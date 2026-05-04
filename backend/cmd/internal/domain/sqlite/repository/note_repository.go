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

func (d *DefaultNoteRepository) FindAllVisible(allowedDepartmentIDs []int64, includeAllDepartments bool) ([]*entity.Note, error) {
	var notes []*entity.Note
	query := d.db.Model(&entity.Note{})

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

func (d *DefaultNoteRepository) CountByDepartmentIDs(departmentIDs []int64) (map[int64]int64, error) {
	counts := make(map[int64]int64, len(departmentIDs))
	if len(departmentIDs) == 0 {
		return counts, nil
	}

	var rows []struct {
		DepartmentID int64 `gorm:"column:department_id"`
		NoteCount    int64 `gorm:"column:note_count"`
	}
	err := d.db.Model(&entity.Note{}).
		Select("department_id, COUNT(*) AS note_count").
		Where("department_id IN ?", departmentIDs).
		Group("department_id").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	for _, row := range rows {
		counts[row.DepartmentID] = row.NoteCount
	}
	return counts, nil
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
