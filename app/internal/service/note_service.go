package service

import (
	"errors"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/gommon/log"
	"gorm.io/gorm"
	"net/http"
	"simplenotes/internal/domain/entity"
	"simplenotes/internal/domain/sqlite"
	"time"
)

type NoteResponse struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Type      string `json:"type"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type NoteRequest struct {
	Name    string `json:"name" validate:"required,min=2,max=50"`
	Type    string `json:"type" validate:"required,oneof=PDF IMAGE TEXT VIDEO AUDIO"`
	Content string `json:"content" validate:"required"`
}

var validate = validator.New()

func GetAllNotes() ([]*NoteResponse, *APIError) {
	var notes []*entity.Note

	err := sqlite.DB.Find(&notes).Error
	if err != nil {
		log.Error("failed to fetch notes: %v", err)
		return nil, ErrorInternalServer
	}

	resp := make([]*NoteResponse, len(notes))
	for i, note := range notes {
		resp[i] = toNoteResponse(note)
	}
	return resp, nil
}

func CreateNote(req *NoteRequest) (*NoteResponse, *APIError) {
	if err := validate.Struct(req); err != nil {
		return nil, NewError(http.StatusBadRequest, err.Error())
	}

	timestamp := time.Now().UTC().UnixMilli()
	note := &entity.Note{
		Name:      req.Name,
		Type:      req.Type,
		Content:   req.Content,
		CreatedAt: timestamp,
		UpdatedAt: timestamp,
	}

	err := sqlite.DB.Create(note).Error
	if err != nil {
		log.Error("failed to create note: %v", err)
		return nil, ErrorInternalServer
	}
	return toNoteResponse(note), nil
}

func DeleteNote(noteId int) *APIError {
	var note *entity.Note
	err := sqlite.DB.First(&note, noteId).Error
	isMissing := errors.Is(err, gorm.ErrRecordNotFound)
	if err != nil && !isMissing {
		log.Error("failed to fetch note: %v", err)
		return ErrorInternalServer
	}

	if isMissing {
		return ErrorNotFound
	}

	err = sqlite.DB.Delete(note, noteId).Error
	if err != nil {
		log.Error("failed to delete note: %v", err)
		return ErrorInternalServer
	}
	return nil
}

func toNoteResponse(note *entity.Note) *NoteResponse {
	return &NoteResponse{
		ID:        note.ID,
		Name:      note.Name,
		Type:      note.Type,
		Content:   note.Content,
		CreatedAt: FormatEpoch(note.CreatedAt),
		UpdatedAt: FormatEpoch(note.UpdatedAt),
	}
}
