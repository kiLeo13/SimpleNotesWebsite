package service

import (
	"context"
	"strconv"
	"sync"
	"testing"

	"zenkeep/cmd/internal/contract"
	"zenkeep/cmd/internal/domain/entity"
	"zenkeep/cmd/internal/domain/events"
	"zenkeep/cmd/internal/domain/policy"
	"zenkeep/cmd/internal/domain/sqlite/repository"
	"zenkeep/cmd/internal/utils"
)

type capturedMessage struct {
	connID  string
	message *contract.OutgoingSocketMessage
}

type captureGateway struct {
	mu       sync.Mutex
	messages []capturedMessage
}

func (g *captureGateway) PostToConnection(_ context.Context, connID string, payload interface{}) error {
	msg, ok := payload.(*contract.OutgoingSocketMessage)
	if !ok {
		return nil
	}

	g.mu.Lock()
	defer g.mu.Unlock()
	g.messages = append(g.messages, capturedMessage{
		connID:  connID,
		message: msg,
	})
	return nil
}

func (*captureGateway) DeleteConnection(context.Context, string) error {
	return nil
}

func TestDispatchNoteCreateEventSkipsRecipientsWithoutHiddenPermission(t *testing.T) {
	noteSvc, gateway, userRepo, connRepo := newNoteVisibilityTestService(t)
	visibleUser, hiddenUser := seedNoteRecipients(t, userRepo, connRepo)

	noteSvc.dispatchNoteCreateEvent(&entity.Note{
		ID:          91,
		Name:        "Private Reference",
		Content:     "top-secret.pdf",
		CreatedByID: hiddenUser.ID,
		Tags:        "alpha",
		NoteType:    entity.NoteTypeReference,
		ContentSize: 128,
		Visibility:  entity.VisibilityPrivate,
		CreatedAt:   utils.NowUTC(),
		UpdatedAt:   utils.NowUTC(),
	})

	messages := gateway.snapshot()
	if len(messages) != 1 {
		t.Fatalf("expected 1 recipient, got %d", len(messages))
	}
	if messages[0].connID != connectionID(hiddenUser.ID) {
		t.Fatalf("expected hidden-note recipient connection, got %s", messages[0].connID)
	}
	if messages[0].message.Type != contract.EventNoteCreated {
		t.Fatalf("expected NOTE_CREATED, got %s", messages[0].message.Type)
	}
	if _, ok := messages[0].message.Data.(*events.NoteCreated); !ok {
		t.Fatalf("expected NoteCreated payload, got %T", messages[0].message.Data)
	}

	if messages[0].connID == connectionID(visibleUser.ID) {
		t.Fatal("visible-only user should not receive private note create")
	}
}

func TestDispatchNoteUpdateEventDowngradesToDeleteWhenRecipientLosesAccess(t *testing.T) {
	noteSvc, gateway, userRepo, connRepo := newNoteVisibilityTestService(t)
	visibleUser, hiddenUser := seedNoteRecipients(t, userRepo, connRepo)

	before := &entity.Note{
		ID:          42,
		Name:        "Roadmap",
		Content:     "hello",
		CreatedByID: hiddenUser.ID,
		Tags:        "alpha",
		NoteType:    entity.NoteTypeMarkdown,
		ContentSize: 5,
		Visibility:  entity.VisibilityPublic,
		CreatedAt:   utils.NowUTC(),
		UpdatedAt:   utils.NowUTC(),
	}
	after := &entity.Note{
		ID:          before.ID,
		Name:        "Roadmap",
		Content:     before.Content,
		CreatedByID: before.CreatedByID,
		Tags:        before.Tags,
		NoteType:    before.NoteType,
		ContentSize: before.ContentSize,
		Visibility:  entity.VisibilityPrivate,
		CreatedAt:   before.CreatedAt,
		UpdatedAt:   utils.NowUTC(),
	}

	noteSvc.dispatchNoteUpdateEvent(before, after)

	byConn := gateway.byConnection()
	if msg := byConn[connectionID(visibleUser.ID)]; msg == nil || msg.Type != contract.EventNoteDeleted {
		t.Fatalf("expected visible user to receive NOTE_DELETED, got %#v", msg)
	}
	if msg := byConn[connectionID(hiddenUser.ID)]; msg == nil || msg.Type != contract.EventNoteUpdated {
		t.Fatalf("expected hidden-note recipient to receive NOTE_UPDATED, got %#v", msg)
	}
}

func TestDispatchNoteUpdateEventPromotesToCreateWhenRecipientGainsAccess(t *testing.T) {
	noteSvc, gateway, userRepo, connRepo := newNoteVisibilityTestService(t)
	visibleUser, hiddenUser := seedNoteRecipients(t, userRepo, connRepo)

	before := &entity.Note{
		ID:          77,
		Name:        "Spec",
		Content:     "diagram",
		CreatedByID: hiddenUser.ID,
		Tags:        "beta",
		NoteType:    entity.NoteTypeFlowchart,
		ContentSize: 7,
		Visibility:  entity.VisibilityPrivate,
		CreatedAt:   utils.NowUTC(),
		UpdatedAt:   utils.NowUTC(),
	}
	after := &entity.Note{
		ID:          before.ID,
		Name:        before.Name,
		Content:     before.Content,
		CreatedByID: before.CreatedByID,
		Tags:        before.Tags,
		NoteType:    before.NoteType,
		ContentSize: before.ContentSize,
		Visibility:  entity.VisibilityPublic,
		CreatedAt:   before.CreatedAt,
		UpdatedAt:   utils.NowUTC(),
	}

	noteSvc.dispatchNoteUpdateEvent(before, after)

	byConn := gateway.byConnection()
	if msg := byConn[connectionID(visibleUser.ID)]; msg == nil || msg.Type != contract.EventNoteCreated {
		t.Fatalf("expected visible user to receive NOTE_CREATED, got %#v", msg)
	}
	if msg := byConn[connectionID(hiddenUser.ID)]; msg == nil || msg.Type != contract.EventNoteUpdated {
		t.Fatalf("expected hidden-note recipient to receive NOTE_UPDATED, got %#v", msg)
	}
}

func newNoteVisibilityTestService(t *testing.T) (*NoteService, *captureGateway, *repository.DefaultUserRepository, *repository.DefaultConnectionRepository) {
	t.Helper()

	db := newTestDB(t)
	userRepo := repository.NewUserRepository(db)
	connRepo := repository.NewConnectionRepository(db)
	gateway := &captureGateway{}
	wsSvc := NewWebSocketService(connRepo, gateway)

	noteSvc := NewNoteService(
		db,
		repository.NewNoteRepository(db),
		userRepo,
		wsSvc,
		noopS3{},
		newTestValidator(),
		newTestAuditService(t, db, 6000),
		policy.NewNotePolicy(),
	)

	return noteSvc, gateway, userRepo, connRepo
}

func seedNoteRecipients(
	t *testing.T,
	userRepo *repository.DefaultUserRepository,
	connRepo *repository.DefaultConnectionRepository,
) (*entity.User, *entity.User) {
	t.Helper()

	visibleUser := &entity.User{
		Username:    "visible",
		Email:       "visible@example.com",
		Permissions: 0,
		Active:      true,
		CreatedAt:   utils.NowUTC(),
		UpdatedAt:   utils.NowUTC(),
	}
	hiddenUser := &entity.User{
		Username:    "hidden",
		Email:       "hidden@example.com",
		Permissions: entity.PermissionSeeHiddenNotes,
		Active:      true,
		CreatedAt:   utils.NowUTC(),
		UpdatedAt:   utils.NowUTC(),
	}

	mustSaveUser(t, userRepo, visibleUser)
	mustSaveUser(t, userRepo, hiddenUser)
	mustSaveConnection(t, connRepo, visibleUser.ID)
	mustSaveConnection(t, connRepo, hiddenUser.ID)
	return visibleUser, hiddenUser
}

func mustSaveUser(t *testing.T, userRepo *repository.DefaultUserRepository, user *entity.User) {
	t.Helper()
	if err := userRepo.Save(user); err != nil {
		t.Fatalf("save user: %v", err)
	}
}

func mustSaveConnection(t *testing.T, connRepo *repository.DefaultConnectionRepository, userID int) {
	t.Helper()
	if err := connRepo.Save(&entity.Connection{
		ConnectionID:    connectionID(userID),
		SessionID:       "session-user-" + strconv.Itoa(userID),
		UserID:          userID,
		ExpiresAt:       utils.NowUTC() + 60_000,
		LastHeartbeatAt: utils.NowUTC(),
		CreatedAt:       utils.NowUTC(),
	}); err != nil {
		t.Fatalf("save connection: %v", err)
	}
}

func connectionID(userID int) string {
	return "conn-user-" + strconv.Itoa(userID)
}

func (g *captureGateway) snapshot() []capturedMessage {
	g.mu.Lock()
	defer g.mu.Unlock()

	out := make([]capturedMessage, len(g.messages))
	copy(out, g.messages)
	return out
}

func (g *captureGateway) byConnection() map[string]*contract.OutgoingSocketMessage {
	g.mu.Lock()
	defer g.mu.Unlock()

	out := make(map[string]*contract.OutgoingSocketMessage, len(g.messages))
	for _, message := range g.messages {
		out[message.connID] = message.message
	}
	return out
}
