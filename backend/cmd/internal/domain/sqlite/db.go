package sqlite

import (
	"os"
	"path/filepath"
	"time"
	"zenkeep/cmd/internal/domain/entity"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func Init() (*gorm.DB, error) {
	dataDir := os.Getenv("SQLITE_PATH")
	if dataDir == "" {
		dataDir = "/data"
	}
	dbPath := filepath.Join(dataDir, "database.db?_fk=1")
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	err = db.AutoMigrate(
		&entity.AuditLogEvent{},
		&entity.AuditLogChange{},
		&entity.Department{},
		&entity.User{},
		&entity.DepartmentMembership{},
		&entity.Note{},
		&entity.Connection{},
		&entity.SocketDelivery{},
		&entity.Company{},
		&entity.CompanyPartner{},
	)
	if err != nil {
		return nil, err
	}
	if err = db.Migrator().CreateConstraint(&entity.Note{}, "Department"); err != nil {
		return nil, err
	}
	if err = installDepartmentDeleteGuard(db); err != nil {
		return nil, err
	}

	sqlDB, _ := db.DB()
	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetMaxIdleConns(1)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}

func installDepartmentDeleteGuard(db *gorm.DB) error {
	return db.Exec(`
		CREATE TRIGGER IF NOT EXISTS restrict_department_delete_with_notes
		BEFORE DELETE ON departments
		FOR EACH ROW
		WHEN EXISTS (
			SELECT 1
			FROM notes
			WHERE department_id = OLD.id
		)
		BEGIN
			SELECT RAISE(ABORT, 'department still has notes');
		END;
	`).Error
}
