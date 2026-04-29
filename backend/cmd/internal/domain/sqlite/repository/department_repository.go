package repository

import (
	"errors"

	"gorm.io/gorm"
	"zenkeep/cmd/internal/domain/entity"
)

type DefaultDepartmentRepository struct {
	db *gorm.DB
}

func NewDepartmentRepository(db *gorm.DB) *DefaultDepartmentRepository {
	return &DefaultDepartmentRepository{db: db}
}

func (r *DefaultDepartmentRepository) FindAll() ([]*entity.Department, error) {
	var departments []*entity.Department
	err := r.db.Order("name ASC").Find(&departments).Error
	return departments, err
}

func (r *DefaultDepartmentRepository) FindVisibleForUser(userID int64, includeAll bool) ([]*entity.Department, error) {
	if includeAll {
		return r.FindAll()
	}

	var departments []*entity.Department
	err := r.db.
		Joins("INNER JOIN department_memberships ON department_memberships.department_id = departments.id").
		Where("department_memberships.user_id = ?", userID).
		Order("departments.name ASC").
		Find(&departments).Error
	return departments, err
}

func (r *DefaultDepartmentRepository) FindByID(id int64) (*entity.Department, error) {
	var department entity.Department
	err := r.db.First(&department, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &department, nil
}

func (r *DefaultDepartmentRepository) SaveWithDB(db *gorm.DB, department *entity.Department) error {
	if db == nil {
		db = r.db
	}
	return db.Save(department).Error
}

func (r *DefaultDepartmentRepository) DeleteWithDB(db *gorm.DB, department *entity.Department) error {
	if db == nil {
		db = r.db
	}
	return db.Delete(department).Error
}

func (r *DefaultDepartmentRepository) ListMemberships() ([]*entity.DepartmentMembership, error) {
	var memberships []*entity.DepartmentMembership
	err := r.db.
		Order("department_id ASC, user_id ASC").
		Find(&memberships).Error
	return memberships, err
}

func (r *DefaultDepartmentRepository) AddMemberWithDB(db *gorm.DB, membership *entity.DepartmentMembership) error {
	if db == nil {
		db = r.db
	}
	return db.FirstOrCreate(membership, &entity.DepartmentMembership{
		DepartmentID: membership.DepartmentID,
		UserID:       membership.UserID,
	}).Error
}

func (r *DefaultDepartmentRepository) RemoveMemberWithDB(db *gorm.DB, departmentID int64, userID int64) error {
	if db == nil {
		db = r.db
	}
	return db.
		Where("department_id = ? AND user_id = ?", departmentID, userID).
		Delete(&entity.DepartmentMembership{}).Error
}

func (r *DefaultDepartmentRepository) IsMember(userID int64, departmentID int64) (bool, error) {
	var count int64
	err := r.db.Model(&entity.DepartmentMembership{}).
		Where("user_id = ? AND department_id = ?", userID, departmentID).
		Count(&count).Error
	return count > 0, err
}

func (r *DefaultDepartmentRepository) FindUserDepartmentIDs(userID int64) ([]int64, error) {
	var ids []int64
	err := r.db.Model(&entity.DepartmentMembership{}).
		Where("user_id = ?", userID).
		Pluck("department_id", &ids).Error
	return ids, err
}
