package entity

import "zenkeep/cmd/internal/contract"

type SocketDelivery struct {
	EventID      int64              `gorm:"primaryKey;autoIncrement"`
	UserID       int64              `gorm:"not null;index:idx_socket_deliveries_user_event,priority:1"`
	EventType    contract.EventType `gorm:"not null;index:idx_socket_deliveries_user_event,priority:2"`
	PayloadJSON  string             `gorm:"not null"`
	ScopeChanged bool               `gorm:"not null;default:false"`
	CreatedAt    int64              `gorm:"not null;index"`
}
