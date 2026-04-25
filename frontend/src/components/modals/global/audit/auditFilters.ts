import type { ListAuditLogsParams } from "@/services/auditService"
import type { AuditActionType, AuditSubjectType } from "@/types/api/audit"

export const AUDIT_LOG_PAGE_SIZE = 50
export const AUDIT_LOAD_MORE_OFFSET_PX = 240

export type AuditFilters = {
  actorUserId: string
  actionType: AuditActionType | ""
  subjectType: AuditSubjectType | ""
  subjectId: string
}

export const EMPTY_AUDIT_FILTERS: AuditFilters = {
  actorUserId: "",
  actionType: "",
  subjectType: "",
  subjectId: ""
}

export function toAuditLogQuery(filters: AuditFilters): ListAuditLogsParams {
  return {
    limit: AUDIT_LOG_PAGE_SIZE,
    actorUserId: filters.actorUserId.trim() || undefined,
    actionType: filters.actionType || undefined,
    subjectType: filters.subjectType || undefined,
    subjectId: filters.subjectId.trim() || undefined
  }
}
