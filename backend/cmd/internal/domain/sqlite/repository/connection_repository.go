package repository

import (
	"errors"

	"gorm.io/gorm"
	"zenkeep/cmd/internal/domain/entity"
)

type DefaultConnectionRepository struct {
	db *gorm.DB
}

func NewConnectionRepository(db *gorm.DB) *DefaultConnectionRepository {
	return &DefaultConnectionRepository{db: db}
}

func (c *DefaultConnectionRepository) Save(user *entity.Connection) error {
	return c.db.Save(user).Error
}

func (c *DefaultConnectionRepository) Delete(connID string) error {
	result := c.db.
		Where("connection_id = ?", connID).
		Delete(&entity.Connection{})

	return result.Error
}

func (c *DefaultConnectionRepository) DeleteBySessionID(sessionID string) error {
	return c.db.
		Where("session_id = ?", sessionID).
		Delete(&entity.Connection{}).Error
}

func (c *DefaultConnectionRepository) FindByUserID(userID int64) ([]string, error) {
	var ids []string
	result := c.db.Model(&entity.Connection{}).
		Where("user_id = ?", userID).
		Where("disconnected_at IS NULL").
		Pluck("connection_id", &ids)

	if result.Error != nil {
		return nil, result.Error
	}

	return ids, nil
}

func (c *DefaultConnectionRepository) FindAllIDs() ([]int64, error) {
	var ids []int64

	err := c.db.Model(&entity.Connection{}).
		Distinct("user_id").
		Pluck("user_id", &ids).Error

	if err != nil {
		return nil, err
	}
	return ids, nil
}

func (c *DefaultConnectionRepository) CountByUserID(userID int64) (int64, error) {
	var count int64
	err := c.db.Model(&entity.Connection{}).
		Where("user_id = ?", userID).
		Where("disconnected_at IS NULL").
		Count(&count).Error
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (c *DefaultConnectionRepository) FindByID(connID string) (*entity.Connection, error) {
	var conn entity.Connection
	err := c.db.First(&conn, "connection_id = ?", connID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}
	return &conn, nil
}

func (c *DefaultConnectionRepository) FindBySessionID(sessionID string) (*entity.Connection, error) {
	var conn entity.Connection
	err := c.db.First(&conn, "session_id = ?", sessionID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}
	return &conn, nil
}

func (c *DefaultConnectionRepository) IsOnline(userID int64, now int64) (bool, error) {
	var exists bool
	err := c.db.
		Raw(`
			SELECT EXISTS(
				SELECT 1
				FROM connections
				WHERE user_id = ?
					AND expires_at >= ?
					AND (
						disconnected_at IS NULL
						OR grace_expires_at >= ?
					)
			)
		`, userID, now, now).
		Scan(&exists).Error
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (c *DefaultConnectionRepository) FindAllConnIDs() ([]string, error) {
	var ids []string
	result := c.db.
		Model(&entity.Connection{}).
		Where("disconnected_at IS NULL").
		Pluck("connection_id", &ids)
	return ids, result.Error
}

func (c *DefaultConnectionRepository) FindAll() ([]*entity.Connection, error) {
	var conns []*entity.Connection
	result := c.db.
		Where("disconnected_at IS NULL").
		Find(&conns)
	if result.Error != nil {
		return nil, result.Error
	}
	return conns, nil
}

func (c *DefaultConnectionRepository) FindSessionsByUserID(userID int64) ([]*entity.Connection, error) {
	var conns []*entity.Connection
	err := c.db.
		Where("user_id = ?", userID).
		Find(&conns).Error
	if err != nil {
		return nil, err
	}
	return conns, nil
}

func (c *DefaultConnectionRepository) FetchIn(userIDs ...int64) ([]*entity.Connection, error) {
	var conns []*entity.Connection
	if len(userIDs) == 0 {
		return conns, nil
	}

	err := c.db.
		Where("user_id IN ?", userIDs).
		Where("disconnected_at IS NULL").
		Find(&conns).Error

	if err != nil {
		return nil, err
	}
	return conns, nil
}

func (c *DefaultConnectionRepository) FindStale(now int64, heartbeatThreshold int64) ([]*entity.Connection, error) {
	var conns []*entity.Connection
	err := c.db.
		Where("disconnected_at IS NULL").
		Where(
			c.db.
				Where("expires_at < ?", now).
				Or("last_heartbeat_at < ?", heartbeatThreshold),
		).
		Find(&conns).Error

	return conns, err
}

func (c *DefaultConnectionRepository) FindExpiredDisconnected(now int64) ([]*entity.Connection, error) {
	var conns []*entity.Connection
	err := c.db.
		Where("disconnected_at IS NOT NULL").
		Where(
			c.db.
				Where("expires_at < ?", now).
				Or("grace_expires_at < ?", now),
		).
		Find(&conns).Error

	return conns, err
}

func (c *DefaultConnectionRepository) UpdateHeartbeat(connID string, now int64) error {
	return c.db.Model(&entity.Connection{}).
		Where("connection_id = ?", connID).
		Where("disconnected_at IS NULL").
		Update("last_heartbeat_at", now).Error
}

func (c *DefaultConnectionRepository) MarkDisconnected(connID string, disconnectedAt int64, graceExpiresAt int64) error {
	return c.db.Model(&entity.Connection{}).
		Where("connection_id = ?", connID).
		Where("disconnected_at IS NULL").
		Updates(map[string]any{
			"disconnected_at":  disconnectedAt,
			"grace_expires_at": graceExpiresAt,
		}).Error
}
