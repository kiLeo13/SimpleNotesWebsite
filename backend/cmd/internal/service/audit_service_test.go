package service

import (
	"testing"

	"zenkeep/cmd/internal/domain/entity"
)

func TestAuditFilterValidationAcceptsRecordedDepartmentEvents(t *testing.T) {
	subjects := []entity.AuditSubjectType{
		entity.AuditSubjectNote,
		entity.AuditSubjectUser,
		entity.AuditSubjectCompany,
		entity.AuditSubjectDepartment,
	}

	for _, subject := range subjects {
		if !isAuditSubjectTypeValid(subject) {
			t.Fatalf("expected subject type %q to be valid", subject)
		}
	}

	actions := []entity.AuditActionType{
		entity.AuditActionDepartmentCreate,
		entity.AuditActionDepartmentUpdate,
		entity.AuditActionDepartmentDelete,
		entity.AuditActionDepartmentMembershipAdd,
		entity.AuditActionDepartmentMembershipRemove,
		entity.AuditActionDepartmentNotesBulkMove,
		entity.AuditActionDepartmentNotesBulkDelete,
	}

	for _, action := range actions {
		if !isAuditActionTypeValid(action) {
			t.Fatalf("expected action type %q to be valid", action)
		}
	}
}
