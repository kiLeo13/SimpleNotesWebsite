package jobs

import (
	"context"
	"time"
	"zenkeep/cmd/internal/contract"
	"zenkeep/cmd/internal/domain/entity"

	"zenkeep/cmd/internal/domain/events"
	"zenkeep/cmd/internal/service"
	"zenkeep/cmd/internal/utils"

	"github.com/labstack/gommon/log"
)

type ConnectionCleaner struct {
	wsService *service.WebSocketService
}

func NewConnectionCleaner(wsService *service.WebSocketService) *ConnectionCleaner {
	return &ConnectionCleaner{wsService: wsService}
}

func (c *ConnectionCleaner) Start(ctx context.Context) {
	ticker := time.NewTicker(entity.CleanupInterval)
	defer ticker.Stop()

	log.Info("Connection cleaner cron started")

	for {
		select {
		case <-ctx.Done():
			log.Info("Stopping connection cleaner...")
			return
		case <-ticker.C:
			c.cleanup()
		}
	}
}

func (c *ConnectionCleaner) cleanup() {
	now := utils.NowUTC()
	heartbeatCutoff := now - ((entity.HeartbeatPeriodMillis * 2) + entity.HeartbeatToleranceMillis)
	conns, err := c.wsService.ConnRepo.FindStale(now, heartbeatCutoff)
	if err != nil {
		log.Errorf("Cleaner: failed to fetch stale connections: %v", err)
		return
	}

	if len(conns) == 0 {
		log.Debug("Cleaner: no stale active connections found")
	}

	for _, conn := range conns {
		var envelope contract.OutgoingSocketMessage

		if conn.ExpiresAt < now {
			envelope = contract.OutgoingSocketMessage{
				Type: contract.EventSessionExpired,
			}
		} else {
			envelope = contract.OutgoingSocketMessage{
				Type: contract.EventConnectionKill,
				Data: events.ConnectionKill{
					Code: contract.CodeIdleTimeout,
				},
			}
		}

		bgCtx := context.Background()
		_ = c.wsService.Gateway.PostToConnection(bgCtx, conn.ConnectionID, envelope)

		_ = c.wsService.Gateway.DeleteConnection(bgCtx, conn.ConnectionID)

		if conn.ExpiresAt < now {
			c.wsService.DeleteConnection(conn.ConnectionID)
			continue
		}

		c.wsService.RemoveConnection(conn.ConnectionID)
	}

	expiredDisconnected, err := c.wsService.ConnRepo.FindExpiredDisconnected(now)
	if err != nil {
		log.Errorf("Cleaner: failed to fetch expired disconnected sessions: %v", err)
		return
	}

	for _, conn := range expiredDisconnected {
		c.wsService.DeleteConnection(conn.ConnectionID)
	}
}
