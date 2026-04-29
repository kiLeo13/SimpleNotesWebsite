package contract

const MaxNoteFileSizeBytes = 30 * 1024 * 1024

var ValidNoteFileTypes = []string{"pdf", "png", "jpg", "jpeg", "jfif", "webp", "gif", "mp4", "mp3"}

type NoteResponse struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Content      string   `json:"content,omitempty"`
	Tags         []string `json:"tags"`
	Visibility   string   `json:"visibility"`
	DepartmentID *string  `json:"department_id"`
	NoteType     string   `json:"note_type"`
	ContentSize  int      `json:"content_size"`
	CreatedByID  string   `json:"created_by_id"`
	CreatedAt    string   `json:"created_at"`
	UpdatedAt    string   `json:"updated_at"`
}

type CreateFileNoteRequest struct {
	Name         string   `json:"name" validate:"required,min=2,max=80"`
	Visibility   string   `json:"visibility" validate:"required,oneof=PUBLIC PRIVATE"`
	DepartmentID *string  `json:"department_id" validate:"omitempty"`
	Tags         []string `json:"tags" validate:"required,max=50,nodupes,dive,required,min=2,max=30,nospaces"`
}

type CreateTextNoteRequest struct {
	Name         string   `json:"name" validate:"required,min=2,max=80"`
	Content      string   `json:"content" validate:"required,max=1000000"`
	NoteType     string   `json:"note_type" validate:"required,oneof=MARKDOWN FLOWCHART"`
	Visibility   string   `json:"visibility" validate:"required,oneof=PUBLIC PRIVATE"`
	DepartmentID *string  `json:"department_id" validate:"omitempty"`
	Tags         []string `json:"tags" validate:"required,max=50,nodupes,dive,required,min=2,max=30,nospaces"`
}

type UpdateNoteRequest struct {
	Name         *string        `form:"name" validate:"omitempty,min=2,max=80"`
	Visibility   *string        `form:"visibility" validate:"omitempty,oneof=PUBLIC PRIVATE"`
	DepartmentID NullableString `json:"department_id"`
	Tags         []string       `form:"tags" validate:"omitempty,max=50,nodupes,dive,required,min=2,max=30,nospaces"`
}
