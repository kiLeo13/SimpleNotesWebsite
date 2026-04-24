package service

import (
	"context"
	"sync"
	"testing"
	"time"

	"zenkeep/cmd/internal/contract"
	"zenkeep/cmd/internal/domain/events"
	"zenkeep/cmd/internal/domain/sqlite/repository"
	"zenkeep/cmd/internal/infrastructure/aws/websocket"
	"zenkeep/cmd/internal/utils"
)

type websocketGatewaySpy struct {
	mu      sync.Mutex
	posted  []capturedMessage
	deleted []string
}

func (g *websocketGatewaySpy) PostToConnection(_ context.Context, connID string, payload interface{}) error {
	g.mu.Lock()
	defer g.mu.Unlock()

	switch message := payload.(type) {
	case *contract.OutgoingSocketMessage:
		g.posted = append(g.posted, capturedMessage{connID: connID, message: message})
	case contract.OutgoingSocketMessage:
		copyMessage := message
		g.posted = append(g.posted, capturedMessage{connID: connID, message: &copyMessage})
	}

	return nil
}

func (g *websocketGatewaySpy) DeleteConnection(_ context.Context, connID string) error {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.deleted = append(g.deleted, connID)
	return nil
}

func (g *websocketGatewaySpy) reset() {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.posted = nil
	g.deleted = nil
}

func (g *websocketGatewaySpy) wasDeleted(connID string) bool {
	g.mu.Lock()
	defer g.mu.Unlock()

	for _, deleted := range g.deleted {
		if deleted == connID {
			return true
		}
	}

	return false
}

func (g *websocketGatewaySpy) snapshot() []capturedMessage {
	g.mu.Lock()
	defer g.mu.Unlock()

	out := make([]capturedMessage, len(g.posted))
	copy(out, g.posted)
	return out
}

func TestRegisterConnectionReplacesPreviousTransportForSameSession(t *testing.T) {
	wsSvc, connRepo, gateway := newWebSocketTestService(t)
	exp := time.Now().Add(time.Hour).Unix()

	if apierr := wsSvc.RegisterConnection(7, "tab-a", "conn-a", exp); apierr != nil {
		t.Fatalf("register first connection: %#v", apierr)
	}

	if apierr := wsSvc.RegisterConnection(7, "tab-a", "conn-b", exp); apierr != nil {
		t.Fatalf("register replacement connection: %#v", apierr)
	}

	conn, err := connRepo.FindBySessionID("tab-a")
	if err != nil {
		t.Fatalf("find session: %v", err)
	}
	if conn == nil {
		t.Fatal("expected session row to exist")
	}
	if conn.ConnectionID != "conn-b" {
		t.Fatalf("expected latest connection id conn-b, got %s", conn.ConnectionID)
	}
	if conn.DisconnectedAt != nil {
		t.Fatal("expected resumed session to be active")
	}

	activeConnIDs, err := connRepo.FindByUserID(7)
	if err != nil {
		t.Fatalf("find active connections: %v", err)
	}
	if len(activeConnIDs) != 1 || activeConnIDs[0] != "conn-b" {
		t.Fatalf("expected only conn-b to stay active, got %#v", activeConnIDs)
	}

	allSessions, err := connRepo.FindSessionsByUserID(7)
	if err != nil {
		t.Fatalf("find sessions by user: %v", err)
	}
	if len(allSessions) != 1 {
		t.Fatalf("expected 1 logical session row, got %d", len(allSessions))
	}

	if !gateway.wasDeleted("conn-a") {
		t.Fatal("expected old transport connection to be evicted")
	}
}

func TestRegisterConnectionFallsBackToConnectionIDWhenSessionIDMissing(t *testing.T) {
	wsSvc, connRepo, _ := newWebSocketTestService(t)
	exp := time.Now().Add(time.Hour).Unix()

	if apierr := wsSvc.RegisterConnection(7, "", "conn-a", exp); apierr != nil {
		t.Fatalf("register connection without session id: %#v", apierr)
	}

	conn, err := connRepo.FindBySessionID("conn-a")
	if err != nil {
		t.Fatalf("find fallback session: %v", err)
	}
	if conn == nil {
		t.Fatal("expected fallback session row to exist")
	}
	if conn.ConnectionID != "conn-a" {
		t.Fatalf("expected fallback session to track conn-a, got %s", conn.ConnectionID)
	}
}

func TestRemoveConnectionMarksSessionDisconnectedButKeepsUserOnlineDuringGrace(t *testing.T) {
	wsSvc, connRepo, gateway := newWebSocketTestService(t)
	exp := time.Now().Add(time.Hour).Unix()

	if apierr := wsSvc.RegisterConnection(99, "recipient-tab", "recipient-conn", exp); apierr != nil {
		t.Fatalf("register recipient connection: %#v", apierr)
	}
	if apierr := wsSvc.RegisterConnection(7, "tab-a", "conn-a", exp); apierr != nil {
		t.Fatalf("register actor connection: %#v", apierr)
	}

	messageCountBeforeDisconnect := len(gateway.snapshot())
	wsSvc.RemoveConnection("conn-a")

	conn, err := connRepo.FindByID("conn-a")
	if err != nil {
		t.Fatalf("find disconnected connection: %v", err)
	}
	if conn == nil {
		t.Fatal("expected connection row to remain during grace window")
	}
	if conn.DisconnectedAt == nil || conn.GraceExpiresAt == nil {
		t.Fatal("expected disconnection timestamps to be recorded")
	}

	activeConnIDs, err := connRepo.FindByUserID(7)
	if err != nil {
		t.Fatalf("find active transport connections: %v", err)
	}
	if len(activeConnIDs) != 0 {
		t.Fatalf("expected no active transport connections, got %#v", activeConnIDs)
	}

	isOnline, err := connRepo.IsOnline(7, utils.NowUTC())
	if err != nil {
		t.Fatalf("check online during grace: %v", err)
	}
	if !isOnline {
		t.Fatal("expected user to stay online during reconnect grace")
	}

	if got := len(gateway.snapshot()); got != messageCountBeforeDisconnect {
		t.Fatalf("expected no extra presence broadcasts on graceful disconnect, got %d messages", got)
	}
}

func TestDeleteConnectionBroadcastsOfflineOnceGraceSessionExpires(t *testing.T) {
	wsSvc, connRepo, gateway := newWebSocketTestService(t)
	exp := time.Now().Add(time.Hour).Unix()

	if apierr := wsSvc.RegisterConnection(99, "recipient-tab", "recipient-conn", exp); apierr != nil {
		t.Fatalf("register recipient connection: %#v", apierr)
	}
	if apierr := wsSvc.RegisterConnection(7, "tab-a", "conn-a", exp); apierr != nil {
		t.Fatalf("register actor connection: %#v", apierr)
	}

	wsSvc.RemoveConnection("conn-a")
	gateway.reset()

	wsSvc.DeleteConnection("conn-a")

	conn, err := connRepo.FindByID("conn-a")
	if err != nil {
		t.Fatalf("find deleted connection: %v", err)
	}
	if conn != nil {
		t.Fatal("expected expired grace session to be removed")
	}

	isOnline, err := connRepo.IsOnline(7, utils.NowUTC())
	if err != nil {
		t.Fatalf("check online after deletion: %v", err)
	}
	if isOnline {
		t.Fatal("expected user to be offline after grace session deletion")
	}

	assertPresenceMessage(t, gateway.snapshot(), "recipient-conn", 7, contract.PresenceOffline)
}

func newWebSocketTestService(t *testing.T) (*WebSocketService, *repository.DefaultConnectionRepository, *websocketGatewaySpy) {
	t.Helper()

	db := newTestDB(t)
	connRepo := repository.NewConnectionRepository(db)
	gateway := &websocketGatewaySpy{}
	return NewWebSocketService(connRepo, gateway), connRepo, gateway
}

func assertPresenceMessage(
	t *testing.T,
	messages []capturedMessage,
	connID string,
	userID int,
	presence contract.UserPresence,
) {
	t.Helper()

	for _, message := range messages {
		if message.connID != connID || message.message.Type != contract.EventPresenceUpdated {
			continue
		}

		payload, ok := message.message.Data.(*events.PresenceUpdated)
		if !ok {
			t.Fatalf("expected presence payload, got %T", message.message.Data)
		}
		if payload.UserID == userID && payload.Presence == presence {
			return
		}
	}

	t.Fatalf("expected %s presence update for user %d on %s", presence, userID, connID)
}

var _ websocket.GatewayClient = (*websocketGatewaySpy)(nil)
