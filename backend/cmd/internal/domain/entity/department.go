package entity

type DepartmentIconType string

const (
	DepartmentIconNone  DepartmentIconType = "NONE"
	DepartmentIconEmoji DepartmentIconType = "EMOJI"
	DepartmentIconImage DepartmentIconType = "IMAGE"
)

type Department struct {
	ID        int64              `gorm:"primaryKey;autoIncrement:false"`
	Name      string             `gorm:"not null;uniqueIndex"`
	IconType  DepartmentIconType `gorm:"not null"`
	IconValue string             `gorm:"not null"`
	ColorRGBA *uint32
	CreatedAt int64 `gorm:"not null"`
	UpdatedAt int64 `gorm:"not null;autoUpdateTime:false"`
}

type DepartmentMembership struct {
	DepartmentID int64 `gorm:"primaryKey;autoIncrement:false;index"`
	UserID       int64 `gorm:"primaryKey;autoIncrement:false;index"`
	CreatedAt    int64 `gorm:"not null"`

	Department Department `gorm:"foreignKey:DepartmentID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	User       User       `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}
