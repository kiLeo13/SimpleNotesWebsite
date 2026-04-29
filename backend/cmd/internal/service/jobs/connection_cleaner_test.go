package jobs

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"

	"zenkeep/cmd/internal/contract"
	"zenkeep/cmd/internal/domain/entity"
	"zenkeep/cmd/internal/domain/sqlite/repository"
	"zenkeep/cmd/internal/service"
	"zenkeep/cmd/internal/utils"
)

type cleanerGatewaySpy struct {
	deleted []string
}

func (*cleanerGatewaySpy) PostToConnection(context.Context, string, interface{}) error {
	return nil
}

func (g *cleanerGatewaySpy) DeleteConnection(_ context.Context, connID string) error {
	g.deleted = append(g.deleted, connID)
	return nil
}

func TestCleanupMarksIdleConnectionsAsDisconnectedBeforeGraceExpiry(t *testing.T) {
	db := newCleanerTestDB(t)
	connRepo := repository.NewConnectionRepository(db)
	deliveryRepo := repository.NewSocketDeliveryRepository(db)
	gateway := &cleanerGatewaySpy{}
	wsService := service.NewWebSocketService(connRepo, deliveryRepo, gateway)
	cleaner := NewConnectionCleaner(wsService)

	now := utils.NowUTC()
	staleHeartbeatAt := now - ((entity.HeartbeatPeriodMillis * 2) + entity.HeartbeatToleranceMillis + 1)
	if err := connRepo.Save(&entity.Connection{
		ConnectionID:    "conn-a",
		SessionID:       "tab-a",
		UserID:          7,
		ExpiresAt:       now + int64(time.Hour/time.Millisecond),
		LastHeartbeatAt: staleHeartbeatAt,
		CreatedAt:       now - 1_000,
	}); err != nil {
		t.Fatalf("save stale connection: %v", err)
	}

	cleaner.cleanup()

	conn, err := connRepo.FindByID("conn-a")
	if err != nil {
		t.Fatalf("find cleaned connection: %v", err)
	}
	if conn == nil {
		t.Fatal("expected idle connection to stay resumable during grace")
	}
	if conn.DisconnectedAt == nil || conn.GraceExpiresAt == nil {
		t.Fatal("expected cleaner to mark connection as disconnected with grace")
	}

	activeConnIDs, err := connRepo.FindByUserID(7)
	if err != nil {
		t.Fatalf("find active connections after cleanup: %v", err)
	}
	if len(activeConnIDs) != 0 {
		t.Fatalf("expected no active transport connections after cleanup, got %#v", activeConnIDs)
	}

	if len(gateway.deleted) != 1 || gateway.deleted[0] != "conn-a" {
		t.Fatalf("expected gateway transport deletion for conn-a, got %#v", gateway.deleted)
	}
}

func TestCleanupPrunesExpiredReplayDeliveries(t *testing.T) {
	db := newCleanerTestDB(t)
	connRepo := repository.NewConnectionRepository(db)
	deliveryRepo := repository.NewSocketDeliveryRepository(db)
	wsService := service.NewWebSocketService(connRepo, deliveryRepo, &cleanerGatewaySpy{})
	cleaner := NewConnectionCleaner(wsService)

	now := utils.NowUTC()
	if err := deliveryRepo.Create(&entity.SocketDelivery{
		UserID:      7,
		EventType:   contract.EventNoteDeleted,
		PayloadJSON: `{"id":"41"}`,
		CreatedAt:   now - entity.ReplayRetentionMillis - 1,
	}); err != nil {
		t.Fatalf("create expired delivery: %v", err)
	}
	if err := deliveryRepo.Create(&entity.SocketDelivery{
		UserID:      7,
		EventType:   contract.EventNoteDeleted,
		PayloadJSON: `{"id":"42"}`,
		CreatedAt:   now,
	}); err != nil {
		t.Fatalf("create retained delivery: %v", err)
	}

	cleaner.cleanup()

	oldestEventID, err := deliveryRepo.FindOldestEventID(7)
	if err != nil {
		t.Fatalf("find oldest delivery: %v", err)
	}
	if oldestEventID == nil || *oldestEventID <= 1 {
		t.Fatalf("expected expired replay rows to be pruned, oldest=%v", oldestEventID)
	}
}

func newCleanerTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	dsn := "file:" + strings.ReplaceAll(t.Name(), "/", "_") + "?mode=memory&cache=shared&_fk=1"
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}

	if err = db.AutoMigrate(
		&entity.AuditLogEvent{},
		&entity.AuditLogChange{},
		&entity.Department{},
		&entity.User{},
		&entity.DepartmentMembership{},
		&entity.Note{},
		&entity.Connection{},
		&entity.SocketDelivery{},
		&entity.Company{},
		&entity.CompanyPartner{},
	); err != nil {
		t.Fatalf("automigrate: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("sql db: %v", err)
	}
	sqlDB.SetMaxOpenConns(1)
	return db
}
