package entity

import "time"

const (
	HeartbeatPeriod    = 60 * time.Second
	HeartbeatTolerance = 10 * time.Second
	ReconnectGrace     = 60 * time.Second
	CleanupInterval    = 15 * time.Second

	HeartbeatPeriodMillis    = int64(60 * 1000)
	HeartbeatToleranceMillis = int64(10 * 1000)
	ReconnectGraceMillis     = int64(60 * 1000)
)

type Connection struct {
	ConnectionID    string `gorm:"primaryKey;autoIncrement:false"`
	SessionID       string `gorm:"not null;uniqueIndex"`
	UserID          int    `gorm:"not null;index"`
	ExpiresAt       int64  `gorm:"not null;index"`
	LastHeartbeatAt int64  `gorm:"not null;index"`
	CreatedAt       int64  `gorm:"not null"`
	DisconnectedAt  *int64 `gorm:"index"`
	GraceExpiresAt  *int64 `gorm:"index"`
}
