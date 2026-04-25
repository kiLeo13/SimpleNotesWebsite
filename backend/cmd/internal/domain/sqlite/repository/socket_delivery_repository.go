package repository

import (
	"errors"

	"gorm.io/gorm"
	"zenkeep/cmd/internal/domain/entity"
)

type DefaultSocketDeliveryRepository struct {
	db *gorm.DB
}

func NewSocketDeliveryRepository(db *gorm.DB) *DefaultSocketDeliveryRepository {
	return &DefaultSocketDeliveryRepository{db: db}
}

func (r *DefaultSocketDeliveryRepository) Create(delivery *entity.SocketDelivery) error {
	return r.db.Create(delivery).Error
}

func (r *DefaultSocketDeliveryRepository) FindLatestEventID(userID int64) (*int64, error) {
	var delivery entity.SocketDelivery
	err := r.db.
		Where("user_id = ?", userID).
		Order("event_id DESC").
		First(&delivery).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &delivery.EventID, nil
}

func (r *DefaultSocketDeliveryRepository) FindOldestEventID(userID int64) (*int64, error) {
	var delivery entity.SocketDelivery
	err := r.db.
		Where("user_id = ?", userID).
		Order("event_id ASC").
		First(&delivery).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &delivery.EventID, nil
}

func (r *DefaultSocketDeliveryRepository) ListBetween(userID int64, afterEventID int64, fenceEventID int64) ([]*entity.SocketDelivery, error) {
	var deliveries []*entity.SocketDelivery
	err := r.db.
		Where("user_id = ?", userID).
		Where("event_id > ?", afterEventID).
		Where("event_id <= ?", fenceEventID).
		Order("event_id ASC").
		Find(&deliveries).Error
	return deliveries, err
}

func (r *DefaultSocketDeliveryRepository) DeleteOlderThan(cutoff int64) error {
	return r.db.
		Where("created_at < ?", cutoff).
		Delete(&entity.SocketDelivery{}).Error
}

func (r *DefaultSocketDeliveryRepository) TrimUserToLimit(userID int64, keep int) error {
	if keep <= 0 {
		return r.db.Where("user_id = ?", userID).Delete(&entity.SocketDelivery{}).Error
	}

	return r.db.Exec(`
		DELETE FROM socket_deliveries
		WHERE user_id = ?
			AND event_id NOT IN (
				SELECT event_id
				FROM socket_deliveries
				WHERE user_id = ?
				ORDER BY event_id DESC
				LIMIT ?
			)
	`, userID, userID, keep).Error
}
