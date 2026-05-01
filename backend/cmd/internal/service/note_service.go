package service

import (
	"context"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/labstack/gommon/log"
	"io"
	"mime/multipart"
	"path/filepath"
	"strconv"
	"strings"
	"zenkeep/cmd/internal/contract"
	"zenkeep/cmd/internal/domain/entity"
	"zenkeep/cmd/internal/domain/events"
	"zenkeep/cmd/internal/domain/policy"
	"zenkeep/cmd/internal/idgen"
	"zenkeep/cmd/internal/infrastructure/aws/storage"
	"zenkeep/cmd/internal/utils"
	"zenkeep/cmd/internal/utils/apierror"

	"gorm.io/gorm"
)

type NoteRepository interface {
	FindAllVisible(allowedDepartmentIDs []int64, includeAllDepartments bool) ([]*entity.Note, error)
	FindByID(id int64) (*entity.Note, error)
	Save(note *entity.Note) error
	SaveWithDB(db *gorm.DB, note *entity.Note) error
	Delete(note *entity.Note) error
	DeleteWithDB(db *gorm.DB, note *entity.Note) error
	CountByDepartmentID(departmentID int64) (int64, error)
	FindByDepartmentID(departmentID int64) ([]*entity.Note, error)
	BulkMoveDepartmentWithDB(db *gorm.DB, sourceDepartmentID int64, targetDepartmentID *int64) (int64, error)
	BulkDeleteDepartmentWithDB(db *gorm.DB, departmentID int64) (int64, error)
}

type DepartmentReader interface {
	FindByID(id int64) (*entity.Department, error)
	FindUserDepartmentIDs(userID int64) ([]int64, error)
	IsMember(userID int64, departmentID int64) (bool, error)
}

type NoteService struct {
	DB             *gorm.DB
	NoteRepo       NoteRepository
	DepartmentRepo DepartmentReader
	UserRepo       UserRepository
	WSService      *WebSocketService
	S3             storage.S3Client
	Validate       *validator.Validate
	Audit          *AuditService
	NotePolicy     *policy.NotePolicy
	IDGen          idgen.Generator
}

func NewNoteService(
	db *gorm.DB,
	noteRepo NoteRepository,
	departmentRepo DepartmentReader,
	userRepo UserRepository,
	wsService *WebSocketService,
	s3 storage.S3Client,
	validate *validator.Validate,
	auditService *AuditService,
	notePolicy *policy.NotePolicy,
	idGenerator idgen.Generator,
) *NoteService {
	return &NoteService{
		DB:             db,
		NoteRepo:       noteRepo,
		DepartmentRepo: departmentRepo,
		UserRepo:       userRepo,
		WSService:      wsService,
		S3:             s3,
		Validate:       validate,
		Audit:          auditService,
		NotePolicy:     notePolicy,
		IDGen:          idGenerator,
	}
}

func (n *NoteService) GetAllNotes(actor *entity.User) ([]*contract.NoteResponse, apierror.ErrorResponse) {
	includeAllDepartments := actor.Permissions.HasEffective(entity.PermissionAdministrator)
	allowedDepartmentIDs, err := n.allowedDepartmentIDs(actor, includeAllDepartments)
	if err != nil {
		log.Errorf("failed to fetch department memberships: %v", err)
		return nil, apierror.InternalServerError
	}

	notes, err := n.NoteRepo.FindAllVisible(allowedDepartmentIDs, includeAllDepartments)
	if err != nil {
		log.Errorf("failed to fetch notes: %v", err)
		return nil, apierror.InternalServerError
	}

	resp := make([]*contract.NoteResponse, len(notes))
	for i, note := range notes {
		resp[i] = toNoteResponse(note, false)
	}
	return resp, nil
}

func (n *NoteService) GetNoteByID(actor *entity.User, noteId int64) (*contract.NoteResponse, apierror.ErrorResponse) {
	note, err := n.NoteRepo.FindByID(noteId)
	if err != nil {
		log.Errorf("failed to fetch note: %v", err)
		return nil, apierror.InternalServerError
	}

	apierr := n.canActorSeeNote(note, actor)
	if apierr != nil {
		return nil, apierr
	}
	return toNoteResponse(note, true), nil
}

func (n *NoteService) CreateTextNote(actor *entity.User, req *contract.CreateTextNoteRequest) (*contract.NoteResponse, apierror.ErrorResponse) {
	if !actor.Permissions.HasEffective(entity.PermissionCreateNotes) {
		return nil, apierror.UserMissingPermsError
	}

	utils.Sanitize(req)
	if valerr := n.Validate.Struct(req); valerr != nil {
		return nil, apierror.FromValidationError(valerr)
	}

	departmentID, apierr := n.resolveAssignableDepartment(actor, req.DepartmentID)
	if apierr != nil {
		return nil, apierr
	}

	tags := strings.Join(req.Tags, " ")
	now := utils.NowUTC()
	noteID, err := n.nextID()
	if err != nil {
		log.Errorf("failed to generate note id: %v", err)
		return nil, apierror.InternalServerError
	}

	note := &entity.Note{
		ID:           noteID,
		Name:         req.Name,
		Content:      req.Content,
		CreatedByID:  actor.ID,
		DepartmentID: departmentID,
		Tags:         strings.ToLower(tags),
		NoteType:     entity.NoteType(req.NoteType),
		ContentSize:  len(req.Content),
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	err = n.DB.Transaction(func(tx *gorm.DB) error {
		if err := n.NoteRepo.SaveWithDB(tx, note); err != nil {
			return err
		}
		return n.Audit.Record(tx, &entity.AuditLogEvent{
			ActorUserID: &actor.ID,
			ActionType:  entity.AuditActionNoteCreate,
			SubjectType: entity.AuditSubjectNote,
			SubjectID:   idgen.Format(note.ID),
			Source:      entity.AuditSourceHTTPAPI,
			Changes:     buildNoteCreateAuditChanges(note),
		})
	})
	if err != nil {
		log.Errorf("failed to save note: %v", err)
		return nil, apierror.InternalServerError
	}

	// I cannot reuse the same response since gateway events should not include the
	// `content` if it's not a REFERENCE type (the payload gets too big ^^).
	go n.dispatchNoteCreateEvent(note)
	return toNoteResponse(note, true), nil
}

func (n *NoteService) CreateFileNote(actor *entity.User, req *contract.CreateFileNoteRequest, fileHeader *multipart.FileHeader) (*contract.NoteResponse, apierror.ErrorResponse) {
	if !actor.Permissions.HasEffective(entity.PermissionCreateNotes) {
		return nil, apierror.UserMissingPermsError
	}

	utils.Sanitize(req)
	if valerr := n.Validate.Struct(req); valerr != nil {
		return nil, apierror.FromValidationError(valerr)
	}

	if apierr := checkNoteFile(fileHeader); apierr != nil {
		return nil, apierr
	}

	departmentID, apierr := n.resolveAssignableDepartment(actor, req.DepartmentID)
	if apierr != nil {
		return nil, apierr
	}

	filename, fileLength, apierr := handleNoteUpload(n.S3, fileHeader)
	if apierr != nil {
		return nil, apierr
	}

	tags := strings.Join(req.Tags, " ")
	now := utils.NowUTC()
	noteID, err := n.nextID()
	if err != nil {
		log.Errorf("failed to generate note id: %v", err)
		return nil, apierror.InternalServerError
	}
	note := &entity.Note{
		ID:           noteID,
		Name:         req.Name,
		Content:      filename,
		CreatedByID:  actor.ID,
		DepartmentID: departmentID,
		Tags:         strings.ToLower(tags),
		NoteType:     entity.NoteTypeReference,
		ContentSize:  fileLength,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	err = n.DB.Transaction(func(tx *gorm.DB) error {
		if err := n.NoteRepo.SaveWithDB(tx, note); err != nil {
			return err
		}
		return n.Audit.Record(tx, &entity.AuditLogEvent{
			ActorUserID: &actor.ID,
			ActionType:  entity.AuditActionNoteCreate,
			SubjectType: entity.AuditSubjectNote,
			SubjectID:   idgen.Format(note.ID),
			Source:      entity.AuditSourceHTTPAPI,
			Changes:     buildNoteCreateAuditChanges(note),
		})
	})
	if err != nil {
		_ = deleteBucketObject(n.S3, note)
		log.Errorf("failed to create note: %v", err)
		return nil, apierror.InternalServerError
	}

	resp := toNoteResponse(note, true)
	go n.dispatchNoteCreateEvent(note)
	return resp, nil
}

func (n *NoteService) UpdateNote(actor *entity.User, noteId int64, req *contract.UpdateNoteRequest) (*contract.NoteResponse, apierror.ErrorResponse) {
	note, err := n.NoteRepo.FindByID(noteId)
	if err != nil {
		log.Errorf("failed to fetch note: %v", err)
		return nil, apierror.InternalServerError
	}

	apierr := n.canActorUpdateNote(note, actor)
	if apierr != nil {
		return nil, apierr
	}

	utils.Sanitize(req)
	if valerr := n.Validate.Struct(req); valerr != nil {
		return nil, apierror.FromValidationError(valerr)
	}

	before := *note

	// Now, we can finally PATCH our data :D
	tags := strings.Join(req.Tags, " ")
	if req.Name != nil {
		note.Name = *req.Name
	}
	if req.Tags != nil {
		note.Tags = strings.ToLower(tags)
	}
	if req.DepartmentID.Set {
		nextDepartmentID, apierr := n.resolveAssignableDepartment(actor, req.DepartmentID.Value)
		if apierr != nil {
			return nil, apierr
		}
		note.DepartmentID = nextDepartmentID
	}

	note.UpdatedAt = utils.NowUTC()
	changes := buildNoteUpdateAuditChanges(&before, note)

	err = n.DB.Transaction(func(tx *gorm.DB) error {
		if err := n.NoteRepo.SaveWithDB(tx, note); err != nil {
			return err
		}
		if len(changes) == 0 {
			return nil
		}
		return n.Audit.Record(tx, &entity.AuditLogEvent{
			ActorUserID: &actor.ID,
			ActionType:  entity.AuditActionNoteUpdate,
			SubjectType: entity.AuditSubjectNote,
			SubjectID:   idgen.Format(note.ID),
			Source:      entity.AuditSourceHTTPAPI,
			Changes:     changes,
		})
	})
	if err != nil {
		log.Errorf("failed to update note: %v", err)
		return nil, apierror.InternalServerError
	}

	resp := toNoteResponse(note, false)
	go n.dispatchNoteUpdateEvent(&before, note)
	return resp, nil
}

func (n *NoteService) DeleteNote(actor *entity.User, noteId int64) apierror.ErrorResponse {
	note, err := n.NoteRepo.FindByID(noteId)
	if err != nil {
		log.Errorf("failed to fetch note: %v", err)
		return apierror.InternalServerError
	}

	apierr := n.canActorDeleteNote(note, actor)
	if apierr != nil {
		return apierr
	}

	err = deleteBucketObject(n.S3, note)
	if err != nil {
		log.Errorf("failed to delete note: %v", err)
		return apierror.InternalServerError
	}

	err = n.DB.Transaction(func(tx *gorm.DB) error {
		if err := n.NoteRepo.DeleteWithDB(tx, note); err != nil {
			return err
		}
		return n.Audit.Record(tx, &entity.AuditLogEvent{
			ActorUserID: &actor.ID,
			ActionType:  entity.AuditActionNoteDelete,
			SubjectType: entity.AuditSubjectNote,
			SubjectID:   idgen.Format(note.ID),
			Source:      entity.AuditSourceHTTPAPI,
		})
	})
	if err != nil {
		log.Errorf("failed to delete note: %v", err)
		return apierror.InternalServerError
	}

	go n.dispatchNoteDeleteEvent(note)
	return nil
}

func (n *NoteService) dispatchNoteCreateEvent(note *entity.Note) {
	resp := toNoteResponse(note, false)
	n.WSService.BroadcastSupplier(context.Background(), func(userID int64) events.SocketEvent {
		recipient, ok := n.findNoteRecipient(userID)
		if !ok || !n.canRecipientSeeNote(note, recipient) {
			return nil
		}

		return &events.NoteCreated{
			NoteResponse: resp,
		}
	})
}

func (n *NoteService) dispatchNoteUpdateEvent(before, after *entity.Note) {
	resp := toNoteResponse(after, false)
	n.WSService.BroadcastSupplier(context.Background(), func(userID int64) events.SocketEvent {
		recipient, ok := n.findNoteRecipient(userID)
		if !ok {
			return nil
		}

		couldSeeBefore := n.canRecipientSeeNote(before, recipient)
		canSeeAfter := n.canRecipientSeeNote(after, recipient)

		switch {
		case couldSeeBefore && canSeeAfter:
			return &events.NoteUpdated{
				NoteResponse: resp,
			}
		case couldSeeBefore && !canSeeAfter:
			return &events.NoteDeleted{
				NoteID: idgen.Format(after.ID),
			}
		case !couldSeeBefore && canSeeAfter:
			return &events.NoteCreated{
				NoteResponse: resp,
			}
		default:
			return nil
		}
	})
}

func (n *NoteService) dispatchNoteDeleteEvent(note *entity.Note) {
	n.WSService.BroadcastSupplier(context.Background(), func(userID int64) events.SocketEvent {
		recipient, ok := n.findNoteRecipient(userID)
		if !ok || !n.canRecipientSeeNote(note, recipient) {
			return nil
		}

		return &events.NoteDeleted{
			NoteID: idgen.Format(note.ID),
		}
	})
}

func (n *NoteService) findNoteRecipient(userID int64) (*entity.User, bool) {
	recipient, err := n.UserRepo.FindActiveByID(userID)
	if err != nil {
		log.Errorf("failed to find websocket recipient (%d): %v", userID, err)
		return nil, false
	}
	if recipient == nil {
		return nil, false
	}
	return recipient, true
}

func (n *NoteService) canRecipientSeeNote(note *entity.Note, recipient *entity.User) bool {
	return n.canActorSeeNote(note, recipient) == nil
}

// handleNoteUpload tries to upload the note to S3 and already generates the
// new UUID name of the file object that will persist.
func handleNoteUpload(s3 storage.S3Client, fileheader *multipart.FileHeader) (string, int, apierror.ErrorResponse) {
	ext := filepath.Ext(fileheader.Filename)
	bytes, apierr := readNoteFile(fileheader)
	if apierr != nil {
		return "", 0, apierr
	}

	filename := uuid.NewString() + ext
	err := s3.UploadFile(bytes, storage.PathAttachments+filename)
	if err != nil {
		log.Errorf("failed to upload file: %v", err)
		return "", 0, apierror.InternalServerError
	}
	return filename, len(bytes), nil
}

func checkNoteFile(fileHeader *multipart.FileHeader) apierror.ErrorResponse {
	if fileHeader.Size > contract.MaxNoteFileSizeBytes {
		return apierror.NewNoteContentTooLargeError(contract.MaxNoteFileSizeBytes)
	}

	if strings.TrimSpace(fileHeader.Filename) == "" {
		return apierror.MissingFileNameError
	}

	if ext, ok := utils.CheckFileExt(fileHeader.Filename, contract.ValidNoteFileTypes); !ok {
		return apierror.NewInvalidFileExtError(ext)
	}
	return nil
}

func readNoteFile(fileHeader *multipart.FileHeader) ([]byte, apierror.ErrorResponse) {
	file, err := fileHeader.Open()
	if err != nil {
		log.Errorf("failed to open file: %v", err)
		return nil, apierror.InternalServerError
	}
	defer file.Close()

	bytes, err := io.ReadAll(file)
	if err != nil {
		log.Errorf("failed to read file: %v", err)
		return nil, apierror.InternalServerError
	}
	return bytes, nil
}

func toNoteResponse(note *entity.Note, forceContent bool) *contract.NoteResponse {
	var content string
	if note.NoteType == entity.NoteTypeReference || forceContent {
		content = note.Content
	}

	return &contract.NoteResponse{
		ID:           idgen.Format(note.ID),
		Name:         note.Name,
		Content:      content,
		Tags:         toTagsArray(note.Tags),
		DepartmentID: formatOptionalID(note.DepartmentID),
		NoteType:     string(note.NoteType),
		ContentSize:  note.ContentSize,
		CreatedByID:  idgen.Format(note.CreatedByID),
		CreatedAt:    utils.FormatEpoch(note.CreatedAt),
		UpdatedAt:    utils.FormatEpoch(note.UpdatedAt),
	}
}

func (n *NoteService) allowedDepartmentIDs(actor *entity.User, includeAll bool) ([]int64, error) {
	if includeAll {
		return nil, nil
	}
	return n.DepartmentRepo.FindUserDepartmentIDs(actor.ID)
}

func (n *NoteService) canActorSeeNote(note *entity.Note, actor *entity.User) apierror.ErrorResponse {
	if apierr := n.NotePolicy.CanSee(note, actor); apierr != nil {
		return apierr
	}
	if note.DepartmentID == nil || actor.Permissions.HasEffective(entity.PermissionAdministrator) {
		return nil
	}

	isMember, err := n.DepartmentRepo.IsMember(actor.ID, *note.DepartmentID)
	if err != nil {
		log.Errorf("failed to check department membership: %v", err)
		return apierror.InternalServerError
	}
	if !isMember {
		return apierror.NotFoundError
	}
	return nil
}

func (n *NoteService) canActorUpdateNote(note *entity.Note, actor *entity.User) apierror.ErrorResponse {
	if apierr := n.NotePolicy.CanUpdate(note, actor); apierr != nil {
		return apierr
	}
	return n.canActorSeeNote(note, actor)
}

func (n *NoteService) canActorDeleteNote(note *entity.Note, actor *entity.User) apierror.ErrorResponse {
	if apierr := n.NotePolicy.CanDelete(note, actor); apierr != nil {
		return apierr
	}
	return n.canActorSeeNote(note, actor)
}

func (n *NoteService) resolveAssignableDepartment(actor *entity.User, raw *string) (*int64, apierror.ErrorResponse) {
	if raw == nil || strings.TrimSpace(*raw) == "" {
		return nil, nil
	}

	departmentID, err := idgen.Parse(strings.TrimSpace(*raw))
	if err != nil {
		return nil, apierror.NewInvalidParamTypeError("department_id", "int64")
	}

	department, err := n.DepartmentRepo.FindByID(departmentID)
	if err != nil {
		log.Errorf("failed to fetch department: %v", err)
		return nil, apierror.InternalServerError
	}
	if department == nil {
		return nil, apierror.NotFoundError
	}

	if actor.Permissions.HasEffective(entity.PermissionAdministrator) {
		return &departmentID, nil
	}

	isMember, err := n.DepartmentRepo.IsMember(actor.ID, departmentID)
	if err != nil {
		log.Errorf("failed to check note department assignment: %v", err)
		return nil, apierror.InternalServerError
	}
	if !isMember {
		return nil, apierror.NewForbiddenError("Cannot assign note to a department the user does not belong to")
	}
	return &departmentID, nil
}

func formatOptionalID(id *int64) *string {
	if id == nil {
		return nil
	}
	formatted := idgen.Format(*id)
	return &formatted
}

func (n *NoteService) nextID() (int64, error) {
	if n.IDGen == nil {
		return 0, errors.New("note id generator is nil")
	}
	return n.IDGen.NextID()
}

// deleteBucketObject deletes the file with the given name from the attachments directory in S3.
//
// It is idempotent: it returns nil if the object does not exist.
// This prevents errors when the database and S3 bucket are out of sync.
func deleteBucketObject(bucket storage.S3Client, note *entity.Note) error {
	fileName := note.Content

	// If the note is a text/chart file, then there is nothing to delete from
	// AWS, as we only store files on S3.
	if note.NoteType != entity.NoteTypeReference {
		return nil
	}

	if fileName == "" {
		return fmt.Errorf("deleteBucketObject: filename cannot be empty")
	}

	key := storage.PathAttachments + fileName
	err := bucket.DeleteFile(key)

	var noKey *types.NoSuchKey
	if errors.As(err, &noKey) {
		return nil
	}

	if err != nil {
		return err
	}
	return nil
}

func toTagsArray(tags string) []string {
	if len(tags) == 0 {
		return []string{}
	}
	return strings.Split(tags, " ")
}

func buildNoteCreateAuditChanges(note *entity.Note) []*entity.AuditLogChange {
	return []*entity.AuditLogChange{
		newAuditCreateValue("name", entity.AuditValueTypeString, note.Name),
		newAuditCreateValue("tags", entity.AuditValueTypeStringArray, auditJSONString(toTagsArray(note.Tags))),
		newAuditCreateValue("department_id", entity.AuditValueTypeString, auditOptionalID(note.DepartmentID)),
		newAuditCreateValue("note_type", entity.AuditValueTypeEnum, string(note.NoteType)),
		newAuditCreateValue("content_size", entity.AuditValueTypeInt, strconv.Itoa(note.ContentSize)),
	}
}

func buildNoteUpdateAuditChanges(before, after *entity.Note) []*entity.AuditLogChange {
	var changes []*entity.AuditLogChange
	appendAuditStringChange(&changes, "name", before.Name, after.Name)
	appendAuditStringChange(&changes, "department_id", auditOptionalID(before.DepartmentID), auditOptionalID(after.DepartmentID))
	appendAuditStringArrayChange(&changes, "tags", toTagsArray(before.Tags), toTagsArray(after.Tags))
	return changes
}

func auditOptionalID(id *int64) string {
	if id == nil {
		return ""
	}
	return idgen.Format(*id)
}
