package service

import (
	"context"
	"time"
	"zenkeep/cmd/internal/contract"
	"zenkeep/cmd/internal/domain/entity"
	"zenkeep/cmd/internal/domain/events"
	"zenkeep/cmd/internal/idgen"
	"zenkeep/cmd/internal/infrastructure/aws/websocket"
	"zenkeep/cmd/internal/utils"
	"zenkeep/cmd/internal/utils/apierror"

	"github.com/labstack/gommon/log"
)

type ConnectionRepository interface {
	Save(conn *entity.Connection) error
	Delete(connID string) error
	DeleteBySessionID(sessionID string) error
	FindByUserID(userID int64) ([]string, error)
	FindDeliverableUserIDs(now int64) ([]int64, error)
	FindSessionsByUserID(userID int64) ([]*entity.Connection, error)
	FindAll() ([]*entity.Connection, error)
	FindByID(connID string) (*entity.Connection, error)
	FindBySessionID(sessionID string) (*entity.Connection, error)
	IsOnline(userID int64, now int64) (bool, error)
	FindAllConnIDs() ([]string, error)
	FindStale(now int64, hbLimit int64) ([]*entity.Connection, error)
	FindExpiredDisconnected(now int64) ([]*entity.Connection, error)
	UpdateHeartbeat(connID string, now int64) error
	MarkDisconnected(connID string, disconnectedAt int64, graceExpiresAt int64) error
}

type SocketDeliveryRepository interface {
	Create(delivery *entity.SocketDelivery) error
	FindLatestEventID(userID int64) (*int64, error)
	FindOldestEventID(userID int64) (*int64, error)
	ListBetween(userID int64, afterEventID int64, fenceEventID int64) ([]*entity.SocketDelivery, error)
	DeleteOlderThan(cutoff int64) error
	TrimUserToLimit(userID int64, keep int) error
}

type WebSocketService struct {
	ConnRepo     ConnectionRepository
	DeliveryRepo SocketDeliveryRepository
	Gateway      websocket.GatewayClient
}

func NewWebSocketService(
	connRepo ConnectionRepository,
	deliveryRepo SocketDeliveryRepository,
	gateway websocket.GatewayClient,
) *WebSocketService {
	return &WebSocketService{
		ConnRepo:     connRepo,
		DeliveryRepo: deliveryRepo,
		Gateway:      gateway,
	}
}

func (s *WebSocketService) RegisterConnection(
	userID int64,
	sessionID string,
	connectionID string,
	exp int64,
	lastEventID *int64,
) apierror.ErrorResponse {
	now := utils.NowUTC()
	wasOnline, _ := s.ConnRepo.IsOnline(userID, now)

	existingSession, err := s.ConnRepo.FindBySessionID(sessionID)
	if err != nil {
		log.Errorf("failed to look up existing websocket session %s: %v", sessionID, err)
		return apierror.InternalServerError
	}

	createdAt := now
	var replacedConnectionID string
	var replacedUserID int64
	if existingSession != nil {
		createdAt = existingSession.CreatedAt
		replacedConnectionID = existingSession.ConnectionID
		replacedUserID = existingSession.UserID

		if existingSession.ConnectionID != connectionID {
			if err = s.ConnRepo.Delete(existingSession.ConnectionID); err != nil {
				log.Errorf("failed to replace websocket session %s: %v", sessionID, err)
				return apierror.InternalServerError
			}
		}
	}

	latestEventID, err := s.DeliveryRepo.FindLatestEventID(userID)
	if err != nil {
		log.Errorf("failed to load latest socket delivery for user %d: %v", userID, err)
		return apierror.InternalServerError
	}

	replayPending, replayFenceEvent := shouldReplayOnConnect(lastEventID, latestEventID)

	conn := &entity.Connection{
		ConnectionID:     connectionID,
		SessionID:        sessionID,
		UserID:           userID,
		ExpiresAt:        exp * 1000, // "exp" is stored in seconds, our app uses millis
		LastHeartbeatAt:  now,        // Avoid users getting disconnected immediately
		CreatedAt:        createdAt,
		ReplayPending:    replayPending,
		ResumeFromEvent:  copyInt64Ptr(lastEventID),
		ResumeFenceEvent: replayFenceEvent,
	}

	if err = s.ConnRepo.Save(conn); err != nil {
		log.Errorf("failed to save connection: %v", err)
		return apierror.InternalServerError
	}

	if replacedConnectionID != "" && replacedConnectionID != connectionID {
		go func(connID string) {
			_ = s.Gateway.DeleteConnection(context.Background(), connID)
		}(replacedConnectionID)
	}

	if replacedUserID != 0 && replacedUserID != userID {
		s.dispatchOfflineIfNeeded(replacedUserID, now)
	}

	if !wasOnline {
		s.dispatchPresenceEvent(userID, contract.PresenceOnline)
	}

	if replayPending {
		go s.resumeSession(sessionID, connectionID)
	}
	return nil
}

func (s *WebSocketService) RemoveConnection(connID string) {
	conn, err := s.ConnRepo.FindByID(connID)
	if err != nil || conn == nil {
		return
	}

	if conn.DisconnectedAt != nil {
		return
	}

	now := utils.NowUTC()
	graceExpiresAt := now + entity.ReconnectGraceMillis
	if err = s.ConnRepo.MarkDisconnected(connID, now, graceExpiresAt); err != nil {
		log.Errorf("failed to mark connection %s as disconnected: %v", connID, err)
	}
}

func (s *WebSocketService) DeleteConnection(connID string) {
	conn, err := s.ConnRepo.FindByID(connID)
	if err != nil || conn == nil {
		return
	}

	if err = s.ConnRepo.Delete(connID); err != nil {
		log.Errorf("failed to delete connection %s: %v", connID, err)
		return
	}

	s.dispatchOfflineIfNeeded(conn.UserID, utils.NowUTC())
}

func (s *WebSocketService) HandleMessage(msg *contract.IncomingSocketMessage, connID string) {
	switch msg.Type {
	case contract.EventPing:
		s.handlePing(connID)
	}
}

func (s *WebSocketService) PushToUser(ctx context.Context, userID int64, payload interface{}) {
	s.pushPayloadToActiveSessions(ctx, userID, payload)
}

// TerminateUserConnections sends a "poison pill" message and then disconnects
func (s *WebSocketService) TerminateUserConnections(ctx context.Context, userID int64, ck *events.ConnectionKill) {
	conns, _ := s.ConnRepo.FindSessionsByUserID(userID)
	msg := contract.OutgoingSocketMessage{
		Type: contract.EventConnectionKill,
		Data: ck,
	}

	for _, conn := range conns {
		if conn.DisconnectedAt == nil {
			_ = s.Gateway.PostToConnection(ctx, conn.ConnectionID, msg)

			go func(cid string) {
				time.Sleep(200 * time.Millisecond)
				_ = s.Gateway.DeleteConnection(context.Background(), cid)
			}(conn.ConnectionID)
		}

		_ = s.ConnRepo.Delete(conn.ConnectionID)
	}

	if len(conns) > 0 {
		s.dispatchPresenceEvent(userID, contract.PresenceOffline)
	}
}

func (s *WebSocketService) Dispatch(ctx context.Context, userID int64, evt events.SocketEvent) {
	s.dispatchEventToUser(ctx, userID, evt)
}

func (s *WebSocketService) DispatchToConnection(ctx context.Context, connID string, evt events.SocketEvent) {
	envelope := &contract.OutgoingSocketMessage{
		Type: evt.GetType(),
		Data: evt,
	}
	_ = s.Gateway.PostToConnection(ctx, connID, envelope)
}

// Broadcast sends an event to ALL connected users.
// This iterates through every active connection in the DB.
func (s *WebSocketService) Broadcast(ctx context.Context, evt events.SocketEvent) {
	now := utils.NowUTC()
	userIDs, err := s.ConnRepo.FindDeliverableUserIDs(now)
	if err != nil {
		log.Errorf("failed to fetch websocket recipients for broadcast: %v", err)
		return
	}

	for _, userID := range userIDs {
		s.dispatchEventToUser(ctx, userID, evt)
	}
}

// BroadcastSupplier broadcasts the returned socket event to the current user.
// If the supplier returns `nil`, then no event is sent.
func (s *WebSocketService) BroadcastSupplier(ctx context.Context, supplier func(userID int64) events.SocketEvent) {
	now := utils.NowUTC()
	userIDs, err := s.ConnRepo.FindDeliverableUserIDs(now)
	if err != nil {
		log.Errorf("failed to fetch websocket recipients for broadcast: %v", err)
		return
	}

	for _, userID := range userIDs {
		evt := supplier(userID)
		if evt == nil {
			continue
		}
		s.dispatchEventToUser(ctx, userID, evt)
	}
}

func (s *WebSocketService) dispatchPresenceEvent(userID int64, presence contract.UserPresence) {
	s.Broadcast(context.Background(), &events.PresenceUpdated{
		UserID:   idgen.Format(userID),
		Presence: presence,
	})
}

func (s *WebSocketService) dispatchOfflineIfNeeded(userID int64, now int64) {
	isOnline, _ := s.ConnRepo.IsOnline(userID, now)
	if !isOnline {
		s.dispatchPresenceEvent(userID, contract.PresenceOffline)
	}
}

func (s *WebSocketService) handlePing(connID string) {
	now := utils.NowUTC()
	err := s.ConnRepo.UpdateHeartbeat(connID, now)
	if err != nil {
		log.Errorf("failed to update heartbeat: %v", err)
		return
	}

	go func(conn string) {
		_ = s.Gateway.PostToConnection(context.Background(), conn, &contract.OutgoingSocketMessage{
			Type: contract.EventAck,
		})
		if err != nil {
			log.Errorf("failed to post ack to conn %s: %v", conn, err)
		}
	}(connID)
}
