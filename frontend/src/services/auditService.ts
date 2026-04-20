import type { ApiResponse } from "@/types/api/api"
import {
  AuditLogListResponseSchema,
  type AuditActionType,
  type AuditLogListResponseData,
  type AuditSubjectType
} from "@/types/api/audit"

import apiClient from "./apiClient"
import { safeApiCall } from "./safeApiCall"

type ListAuditLogsParams = {
  limit?: number
  beforeId?: string
  actorUserId?: number
  subjectType?: AuditSubjectType
  subjectId?: string
  actionType?: AuditActionType
}

export type { ListAuditLogsParams }

export const auditService = {
  listAuditLogs: async ({
    limit = 30,
    beforeId,
    actorUserId,
    subjectType,
    subjectId,
    actionType
  }: ListAuditLogsParams = {}): Promise<ApiResponse<AuditLogListResponseData>> => {
    const params = {
      limit,
      before_id: beforeId,
      actor_user_id: actorUserId,
      subject_type: subjectType,
      subject_id: subjectId,
      action_type: actionType
    }

    return safeApiCall(
      () => apiClient.get("/audit-logs", { params }),
      AuditLogListResponseSchema
    )
  }
}
