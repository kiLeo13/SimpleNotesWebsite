package contract

const MaxDepartmentIconSizeBytes = 1024 * 1024

var ValidDepartmentIconFileTypes = []string{"png", "jpg", "jpeg", "webp", "gif"}

type DepartmentResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	IconType  string `json:"icon_type"`
	IconValue string `json:"icon_value"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type DepartmentMembershipResponse struct {
	DepartmentID string `json:"department_id"`
	UserID       string `json:"user_id"`
}

type CreateDepartmentRequest struct {
	Name      string `json:"name" validate:"required,min=2,max=80"`
	IconType  string `json:"icon_type" validate:"required,oneof=EMOJI IMAGE"`
	IconValue string `json:"icon_value" validate:"omitempty,max=16"`
}

type UpdateDepartmentRequest struct {
	Name      *string `json:"name" validate:"omitempty,min=2,max=80"`
	IconType  *string `json:"icon_type" validate:"omitempty,oneof=EMOJI IMAGE"`
	IconValue *string `json:"icon_value" validate:"omitempty,max=16"`
}

func (r *UpdateDepartmentRequest) IsEmpty() bool {
	return r.Name == nil && r.IconType == nil && r.IconValue == nil
}

type BulkMoveDepartmentNotesRequest struct {
	TargetDepartmentID NullableString `json:"target_department_id"`
}
