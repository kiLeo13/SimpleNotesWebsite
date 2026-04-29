package service

import (
	"context"
	"encoding/json"

	"github.com/labstack/gommon/log"

	"zenkeep/cmd/internal/contract"
	"zenkeep/cmd/internal/domain/entity"
	"zenkeep/cmd/internal/domain/events"
	"zenkeep/cmd/internal/idgen"
	"zenkeep/cmd/internal/utils"
)

func (s *WebSocketService) PruneReplayLog(now int64) {
	cutoff := now - entity.ReplayRetentionMillis
	if err := s.DeliveryRepo.DeleteOlderThan(cutoff); err != nil {
		log.Errorf("failed to prune socket replay log: %v", err)
	}
}

func (s *WebSocketService) dispatchEventToUser(ctx context.Context, userID int64, evt events.SocketEvent) {
	now := utils.NowUTC()
	isOnline, err := s.ConnRepo.IsOnline(userID, now)
	if err != nil {
		log.Errorf("failed to check websocket delivery eligibility for user %d: %v", userID, err)
		return
	}
	if !isOnline {
		return
	}

	envelope := &contract.OutgoingSocketMessage{
		Type: evt.GetType(),
		Data: evt,
	}
	if isReplayableEvent(evt.GetType()) {
		envelope, err = s.persistDelivery(userID, evt, now)
		if err != nil {
			log.Errorf("failed to persist socket delivery for user %d: %v", userID, err)
			return
		}
	}

	s.pushPayloadToActiveSessions(ctx, userID, envelope)
}

func (s *WebSocketService) pushPayloadToActiveSessions(ctx context.Context, userID int64, payload interface{}) {
	sessions, err := s.ConnRepo.FindSessionsByUserID(userID)
	if err != nil {
		log.Errorf("failed to fetch websocket sessions for user %d: %v", userID, err)
		return
	}

	now := utils.NowUTC()
	for _, session := range sessions {
		if !isSessionLive(session, now) || session.ReplayPending {
			continue
		}

		// We ignore errors here so one stale connection doesn't block others.
		_ = s.Gateway.PostToConnection(ctx, session.ConnectionID, payload)
	}
}

func (s *WebSocketService) persistDelivery(
	userID int64,
	evt events.SocketEvent,
	now int64,
) (*contract.OutgoingSocketMessage, error) {
	payload, err := json.Marshal(evt)
	if err != nil {
		return nil, err
	}

	delivery := &entity.SocketDelivery{
		UserID:       userID,
		EventType:    evt.GetType(),
		PayloadJSON:  string(payload),
		ScopeChanged: isScopeChangingEvent(userID, evt),
		CreatedAt:    now,
	}
	if err = s.DeliveryRepo.Create(delivery); err != nil {
		return nil, err
	}
	if err = s.DeliveryRepo.TrimUserToLimit(userID, entity.ReplayPerUserLimit); err != nil {
		return nil, err
	}

	return &contract.OutgoingSocketMessage{
		Type:    evt.GetType(),
		Data:    evt,
		EventID: idgen.Format(delivery.EventID),
	}, nil
}

func (s *WebSocketService) resumeSession(sessionID string, expectedConnID string) {
	conn, err := s.ConnRepo.FindBySessionID(sessionID)
	if err != nil {
		log.Errorf("failed to load websocket replay session %s: %v", sessionID, err)
		return
	}
	if !isReplaySession(conn, expectedConnID) {
		return
	}

	afterEventID := int64(0)
	if conn.ResumeFromEvent != nil {
		afterEventID = *conn.ResumeFromEvent
	}

	oldestEventID, err := s.DeliveryRepo.FindOldestEventID(conn.UserID)
	if err != nil {
		log.Errorf("failed to load oldest socket delivery for user %d: %v", conn.UserID, err)
		return
	}
	if oldestEventID != nil && afterEventID < (*oldestEventID-1) {
		s.sendResyncRequired(expectedConnID, conn.UserID, contract.ReasonCursorTooOld)
		s.clearReplayState(sessionID, expectedConnID)
		return
	}

	var ok bool
	afterEventID, ok = s.replayRange(sessionID, expectedConnID, conn.UserID, afterEventID, conn.ResumeFenceEvent)
	if !ok {
		return
	}

	latestEventID, err := s.DeliveryRepo.FindLatestEventID(conn.UserID)
	if err != nil {
		log.Errorf("failed to load catch-up socket deliveries for user %d: %v", conn.UserID, err)
		return
	}
	if latestEventID != nil && afterEventID < *latestEventID {
		afterEventID, ok = s.replayRange(sessionID, expectedConnID, conn.UserID, afterEventID, latestEventID)
		if !ok {
			return
		}
	}

	s.clearReplayState(sessionID, expectedConnID)
}

func (s *WebSocketService) replayRange(
	sessionID string,
	expectedConnID string,
	userID int64,
	afterEventID int64,
	fenceEventID *int64,
) (int64, bool) {
	if fenceEventID == nil || afterEventID >= *fenceEventID {
		return afterEventID, true
	}

	deliveries, err := s.DeliveryRepo.ListBetween(userID, afterEventID, *fenceEventID)
	if err != nil {
		log.Errorf("failed to fetch socket replay range for user %d: %v", userID, err)
		return afterEventID, false
	}
	if hasScopeChanged(deliveries) {
		s.sendResyncRequired(expectedConnID, userID, contract.ReasonScopeChanged)
		s.clearReplayState(sessionID, expectedConnID)
		return afterEventID, false
	}

	for _, delivery := range deliveries {
		if !s.sessionStillReplaying(sessionID, expectedConnID) {
			return afterEventID, false
		}
		_ = s.Gateway.PostToConnection(context.Background(), expectedConnID, deliveryToEnvelope(delivery))
		afterEventID = delivery.EventID
	}

	return afterEventID, true
}

func (s *WebSocketService) clearReplayState(sessionID string, expectedConnID string) {
	conn, err := s.ConnRepo.FindBySessionID(sessionID)
	if err != nil || conn == nil || conn.ConnectionID != expectedConnID {
		return
	}

	conn.ReplayPending = false
	conn.ResumeFromEvent = nil
	conn.ResumeFenceEvent = nil
	if err = s.ConnRepo.Save(conn); err != nil {
		log.Errorf("failed to clear replay state for session %s: %v", sessionID, err)
	}
}

func (s *WebSocketService) sendResyncRequired(connID string, userID int64, reason contract.ResyncReason) {
	latestEventID, err := s.DeliveryRepo.FindLatestEventID(userID)
	if err != nil {
		log.Errorf("failed to load latest event id for websocket resync: %v", err)
	}

	var latest string
	if latestEventID != nil {
		latest = idgen.Format(*latestEventID)
	}

	payload := &events.ResyncRequired{
		Reason: reason,
	}
	if latest != "" {
		payload.LatestEventID = &latest
	}

	_ = s.Gateway.PostToConnection(context.Background(), connID, &contract.OutgoingSocketMessage{
		Type: contract.EventResyncRequired,
		Data: payload,
	})
}

func (s *WebSocketService) sessionStillReplaying(sessionID string, expectedConnID string) bool {
	conn, err := s.ConnRepo.FindBySessionID(sessionID)
	if err != nil {
		log.Errorf("failed to reload websocket replay session %s: %v", sessionID, err)
		return false
	}
	return isReplaySession(conn, expectedConnID)
}

func copyInt64Ptr(value *int64) *int64 {
	if value == nil {
		return nil
	}

	cloned := *value
	return &cloned
}

func shouldReplayOnConnect(lastEventID *int64, latestEventID *int64) (bool, *int64) {
	if lastEventID == nil || latestEventID == nil || *lastEventID >= *latestEventID {
		return false, nil
	}
	return true, copyInt64Ptr(latestEventID)
}

func isReplayableEvent(eventType contract.EventType) bool {
	switch eventType {
	case contract.EventResyncRequired,
		contract.EventNoteCreated,
		contract.EventNoteUpdated,
		contract.EventNoteDeleted,
		contract.EventDepartmentCreated,
		contract.EventDepartmentUpdated,
		contract.EventDepartmentDeleted,
		contract.EventUserCreated,
		contract.EventUserUpdated,
		contract.EventUserDeleted,
		contract.EventPresenceUpdated:
		return true
	default:
		return false
	}
}

func isScopeChangingEvent(userID int64, evt events.SocketEvent) bool {
	switch payload := evt.(type) {
	case *events.ResyncRequired:
		return payload.Reason == contract.ReasonScopeChanged
	case *events.UserUpdated:
		return payload.UserResponse != nil && payload.ID == idgen.Format(userID)
	case *events.UserDeleted:
		return payload.UserID == idgen.Format(userID)
	default:
		return false
	}
}

func hasScopeChanged(deliveries []*entity.SocketDelivery) bool {
	for _, delivery := range deliveries {
		if delivery.ScopeChanged {
			return true
		}
	}
	return false
}

func deliveryToEnvelope(delivery *entity.SocketDelivery) *contract.OutgoingSocketMessage {
	return &contract.OutgoingSocketMessage{
		Type:    delivery.EventType,
		Data:    json.RawMessage(delivery.PayloadJSON),
		EventID: idgen.Format(delivery.EventID),
	}
}

func isSessionLive(conn *entity.Connection, now int64) bool {
	return conn != nil &&
		conn.DisconnectedAt == nil &&
		conn.ExpiresAt >= now
}

func isReplaySession(conn *entity.Connection, expectedConnID string) bool {
	return conn != nil &&
		conn.ConnectionID == expectedConnID &&
		conn.DisconnectedAt == nil &&
		conn.ReplayPending
}
