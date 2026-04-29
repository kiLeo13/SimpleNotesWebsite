package entity

type NoteType string

const (
	NoteTypeReference NoteType = "REFERENCE"
	NoteTypeMarkdown  NoteType = "MARKDOWN"
	NoteTypeFlowchart NoteType = "FLOWCHART"
)

type NoteVisibility string

const (
	VisibilityPublic  NoteVisibility = "PUBLIC"
	VisibilityPrivate NoteVisibility = "PRIVATE"
)

type Note struct {
	ID           int64          `gorm:"primaryKey;autoIncrement:false"`
	Name         string         `gorm:"not null"`
	Content      string         `gorm:"not null"`
	CreatedByID  int64          `gorm:"not null"` // References: users(id)
	DepartmentID *int64         `gorm:"index"`
	Tags         string         `gorm:"not null"`
	NoteType     NoteType       `gorm:"not null"`
	ContentSize  int            `gorm:"not null"`
	Visibility   NoteVisibility `gorm:"not null"`
	CreatedAt    int64          `gorm:"not null"`
	UpdatedAt    int64          `gorm:"not null;autoUpdateTime:false"`

	// Relations
	CreatedBy  User       `gorm:"foreignKey:CreatedByID;references:ID"`
	Department Department `gorm:"foreignKey:DepartmentID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}
