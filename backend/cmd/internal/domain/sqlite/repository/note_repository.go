package repository

import (
	"errors"
	"gorm.io/gorm"
	"zenkeep/cmd/internal/domain/entity"
)

type DefaultNoteRepository struct {
	db *gorm.DB
}

func NewNoteRepository(db *gorm.DB) *DefaultNoteRepository {
	return &DefaultNoteRepository{db: db}
}

func (d *DefaultNoteRepository) FindAll(withPrivate bool) ([]*entity.Note, error) {
	var notes []*entity.Note
	var err error
	if withPrivate {
		err = d.db.Find(&notes).Error
	} else {
		err = d.db.
			Where("visibility != ?", string(entity.VisibilityPrivate)).
			Find(&notes).Error
	}

	if err != nil {
		return nil, err
	}
	return notes, nil
}

func (d *DefaultNoteRepository) FindAllVisible(withPrivate bool, allowedDepartmentIDs []int64, includeAllDepartments bool) ([]*entity.Note, error) {
	var notes []*entity.Note
	query := d.db.Model(&entity.Note{})

	if !withPrivate {
		query = query.Where("visibility != ?", string(entity.VisibilityPrivate))
	}

	if !includeAllDepartments {
		if len(allowedDepartmentIDs) == 0 {
			query = query.Where("department_id IS NULL")
		} else {
			query = query.Where("department_id IS NULL OR department_id IN ?", allowedDepartmentIDs)
		}
	}

	err := query.Find(&notes).Error
	if err != nil {
		return nil, err
	}
	return notes, nil
}

func (d *DefaultNoteRepository) FindByID(id int64) (*entity.Note, error) {
	var note entity.Note
	err := d.db.First(&note, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}
	return &note, nil
}

func (d *DefaultNoteRepository) Save(note *entity.Note) error {
	return d.db.Save(note).Error
}

func (d *DefaultNoteRepository) SaveWithDB(db *gorm.DB, note *entity.Note) error {
	if db == nil {
		db = d.db
	}
	return db.Save(note).Error
}

func (d *DefaultNoteRepository) Delete(note *entity.Note) error {
	return d.db.Delete(note).Error
}

func (d *DefaultNoteRepository) DeleteWithDB(db *gorm.DB, note *entity.Note) error {
	if db == nil {
		db = d.db
	}
	return db.Delete(note).Error
}

func (d *DefaultNoteRepository) CountByDepartmentID(departmentID int64) (int64, error) {
	var count int64
	err := d.db.Model(&entity.Note{}).
		Where("department_id = ?", departmentID).
		Count(&count).Error
	return count, err
}

func (d *DefaultNoteRepository) FindByDepartmentID(departmentID int64) ([]*entity.Note, error) {
	var notes []*entity.Note
	err := d.db.
		Where("department_id = ?", departmentID).
		Find(&notes).Error
	return notes, err
}

func (d *DefaultNoteRepository) BulkMoveDepartmentWithDB(db *gorm.DB, sourceDepartmentID int64, targetDepartmentID *int64) (int64, error) {
	if db == nil {
		db = d.db
	}

	result := db.Model(&entity.Note{}).
		Where("department_id = ?", sourceDepartmentID).
		Update("department_id", targetDepartmentID)
	return result.RowsAffected, result.Error
}

func (d *DefaultNoteRepository) BulkDeleteDepartmentWithDB(db *gorm.DB, departmentID int64) (int64, error) {
	if db == nil {
		db = d.db
	}

	result := db.
		Where("department_id = ?", departmentID).
		Delete(&entity.Note{})
	return result.RowsAffected, result.Error
}
