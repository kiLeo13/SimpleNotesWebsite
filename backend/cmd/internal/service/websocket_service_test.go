package service

import (
	"context"
	"encoding/json"
	"strconv"
	"sync"
	"testing"
	"time"

	"zenkeep/cmd/internal/contract"
	"zenkeep/cmd/internal/domain/entity"
	"zenkeep/cmd/internal/domain/events"
	"zenkeep/cmd/internal/domain/sqlite/repository"
	"zenkeep/cmd/internal/idgen"
	"zenkeep/cmd/internal/infrastructure/aws/websocket"
	"zenkeep/cmd/internal/utils"
)

type capturedMessage struct {
	connID  string
	message *contract.OutgoingSocketMessage
}

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
	wsSvc, connRepo, gateway, _ := newWebSocketTestService(t)
	exp := time.Now().Add(time.Hour).Unix()

	if apierr := wsSvc.RegisterConnection(7, "tab-a", "conn-a", exp, nil); apierr != nil {
		t.Fatalf("register first connection: %#v", apierr)
	}

	if apierr := wsSvc.RegisterConnection(7, "tab-a", "conn-b", exp, nil); apierr != nil {
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

func TestRemoveConnectionMarksSessionDisconnectedButKeepsUserOnlineDuringGrace(t *testing.T) {
	wsSvc, connRepo, gateway, _ := newWebSocketTestService(t)
	exp := time.Now().Add(time.Hour).Unix()

	if apierr := wsSvc.RegisterConnection(99, "recipient-tab", "recipient-conn", exp, nil); apierr != nil {
		t.Fatalf("register recipient connection: %#v", apierr)
	}
	if apierr := wsSvc.RegisterConnection(7, "tab-a", "conn-a", exp, nil); apierr != nil {
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
	wsSvc, connRepo, gateway, _ := newWebSocketTestService(t)
	exp := time.Now().Add(time.Hour).Unix()

	if apierr := wsSvc.RegisterConnection(99, "recipient-tab", "recipient-conn", exp, nil); apierr != nil {
		t.Fatalf("register recipient connection: %#v", apierr)
	}
	if apierr := wsSvc.RegisterConnection(7, "tab-a", "conn-a", exp, nil); apierr != nil {
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

func TestDispatchAssignsIncreasingReplayEventIDs(t *testing.T) {
	wsSvc, _, gateway, _ := newWebSocketTestService(t)
	exp := time.Now().Add(time.Hour).Unix()

	if apierr := wsSvc.RegisterConnection(7, "tab-a", "conn-a", exp, nil); apierr != nil {
		t.Fatalf("register connection: %#v", apierr)
	}
	gateway.reset()

	wsSvc.Dispatch(context.Background(), 7, &events.NoteDeleted{NoteID: "41"})
	wsSvc.Dispatch(context.Background(), 7, &events.NoteDeleted{NoteID: "42"})

	messages := gateway.snapshot()
	if len(messages) != 2 {
		t.Fatalf("expected 2 replayable messages, got %d", len(messages))
	}

	firstEventID := mustParseEventID(t, messages[0].message.EventID)
	secondEventID := mustParseEventID(t, messages[1].message.EventID)
	if firstEventID <= 0 {
		t.Fatalf("expected positive first event id, got %d", firstEventID)
	}
	if secondEventID <= firstEventID {
		t.Fatalf("expected increasing event ids, got %d then %d", firstEventID, secondEventID)
	}
}

func TestReconnectReplaysMissedEventsInOrder(t *testing.T) {
	wsSvc, _, gateway, _ := newWebSocketTestService(t)
	exp := time.Now().Add(time.Hour).Unix()

	if apierr := wsSvc.RegisterConnection(7, "tab-a", "conn-a", exp, nil); apierr != nil {
		t.Fatalf("register connection: %#v", apierr)
	}
	gateway.reset()

	wsSvc.Dispatch(context.Background(), 7, &events.NoteDeleted{NoteID: "41"})
	wsSvc.Dispatch(context.Background(), 7, &events.NoteDeleted{NoteID: "42"})

	initialMessages := gateway.snapshot()
	if len(initialMessages) != 2 {
		t.Fatalf("expected 2 initial live messages, got %d", len(initialMessages))
	}
	lastSeenEventID := mustParseEventID(t, initialMessages[1].message.EventID)

	wsSvc.RemoveConnection("conn-a")
	gateway.reset()

	wsSvc.Dispatch(context.Background(), 7, &events.NoteDeleted{NoteID: "43"})
	wsSvc.Dispatch(context.Background(), 7, &events.NoteDeleted{NoteID: "44"})

	if apierr := wsSvc.RegisterConnection(7, "tab-a", "conn-b", exp, &lastSeenEventID); apierr != nil {
		t.Fatalf("register resumed connection: %#v", apierr)
	}

	replayed := waitForMessages(t, gateway, 2)
	if len(replayed) != 2 {
		t.Fatalf("expected 2 replayed messages, got %d", len(replayed))
	}
	if replayed[0].connID != "conn-b" || replayed[1].connID != "conn-b" {
		t.Fatalf("expected replay on conn-b, got %#v", replayed)
	}

	firstReplayEventID := mustParseEventID(t, replayed[0].message.EventID)
	secondReplayEventID := mustParseEventID(t, replayed[1].message.EventID)
	if firstReplayEventID <= lastSeenEventID {
		t.Fatalf("expected first replay id to be newer than cursor %d, got %d", lastSeenEventID, firstReplayEventID)
	}
	if secondReplayEventID <= firstReplayEventID {
		t.Fatalf("expected ordered replay event ids, got %d then %d", firstReplayEventID, secondReplayEventID)
	}

	firstPayload, ok := replayed[0].message.Data.(json.RawMessage)
	if !ok || string(firstPayload) != `{"id":"43"}` {
		t.Fatalf("expected first replay payload NOTE_DELETED 43, got %#v", replayed[0].message.Data)
	}
	secondPayload, ok := replayed[1].message.Data.(json.RawMessage)
	if !ok || string(secondPayload) != `{"id":"44"}` {
		t.Fatalf("expected second replay payload NOTE_DELETED 44, got %#v", replayed[1].message.Data)
	}
}

func TestReconnectWithExpiredCursorRequestsResync(t *testing.T) {
	wsSvc, _, gateway, deliveryRepo := newWebSocketTestService(t)
	now := utils.NowUTC()

	if err := deliveryRepo.Create(&entity.SocketDelivery{
		UserID:      7,
		EventType:   contract.EventNoteDeleted,
		PayloadJSON: `{"id":"41"}`,
		CreatedAt:   now - entity.ReplayRetentionMillis - 1,
	}); err != nil {
		t.Fatalf("create old delivery: %v", err)
	}
	if err := deliveryRepo.Create(&entity.SocketDelivery{
		UserID:      7,
		EventType:   contract.EventNoteDeleted,
		PayloadJSON: `{"id":"42"}`,
		CreatedAt:   now,
	}); err != nil {
		t.Fatalf("create current delivery: %v", err)
	}

	wsSvc.PruneReplayLog(now)

	exp := time.Now().Add(time.Hour).Unix()
	lastEventID := int64(0)
	if apierr := wsSvc.RegisterConnection(7, "tab-a", "conn-a", exp, &lastEventID); apierr != nil {
		t.Fatalf("register resumed connection: %#v", apierr)
	}

	messages := waitForMessages(t, gateway, 1)
	if len(messages) != 1 {
		t.Fatalf("expected one replay control message, got %d", len(messages))
	}
	if messages[0].message.Type != contract.EventResyncRequired {
		t.Fatalf("expected RESYNC_REQUIRED, got %s", messages[0].message.Type)
	}
	payload, ok := messages[0].message.Data.(*events.ResyncRequired)
	if !ok {
		t.Fatalf("expected resync payload, got %T", messages[0].message.Data)
	}
	if payload.Reason != contract.ReasonCursorTooOld {
		t.Fatalf("expected CURSOR_TOO_OLD, got %s", payload.Reason)
	}
}

func newWebSocketTestService(t *testing.T) (*WebSocketService, *repository.DefaultConnectionRepository, *websocketGatewaySpy, *repository.DefaultSocketDeliveryRepository) {
	t.Helper()

	db := newTestDB(t)
	connRepo := repository.NewConnectionRepository(db)
	deliveryRepo := repository.NewSocketDeliveryRepository(db)
	gateway := &websocketGatewaySpy{}
	return NewWebSocketService(connRepo, deliveryRepo, gateway), connRepo, gateway, deliveryRepo
}

func assertPresenceMessage(
	t *testing.T,
	messages []capturedMessage,
	connID string,
	userID int64,
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
		if payload.UserID == idgen.Format(userID) && payload.Presence == presence {
			return
		}
	}

	t.Fatalf("expected %s presence update for user %d on %s", presence, userID, connID)
}

var _ websocket.GatewayClient = (*websocketGatewaySpy)(nil)

func waitForMessages(t *testing.T, gateway *websocketGatewaySpy, want int) []capturedMessage {
	t.Helper()

	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		messages := gateway.snapshot()
		if len(messages) >= want {
			return messages
		}
		time.Sleep(10 * time.Millisecond)
	}

	return gateway.snapshot()
}

func mustParseEventID(t *testing.T, raw string) int64 {
	t.Helper()

	value, err := strconv.ParseInt(raw, 10, 64)
	if err != nil {
		t.Fatalf("parse event id %q: %v", raw, err)
	}
	return value
}
