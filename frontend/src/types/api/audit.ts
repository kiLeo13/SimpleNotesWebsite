import { z } from "zod"

export const auditActionTypeSchema = z.enum([
  "NOTE_CREATE",
  "NOTE_UPDATE",
  "NOTE_DELETE",
  "USER_UPDATE",
  "USER_SUSPEND",
  "USER_UNSUSPEND",
  "USER_DELETE",
  "COMPANY_LOOKUP"
])

export const auditSubjectTypeSchema = z.enum(["NOTE", "USER", "COMPANY"])

export type AuditActionType = z.infer<typeof auditActionTypeSchema>
export type AuditSubjectType = z.infer<typeof auditSubjectTypeSchema>

const auditLogChangeSchema = z
  .object({
    id: z.number(),
    field_name: z.string(),
    old_value: z.string().optional(),
    new_value: z.string().optional(),
    value_type: z.string()
  })
  .transform((data) => ({
    id: data.id,
    fieldName: data.field_name,
    oldValue: data.old_value,
    newValue: data.new_value,
    valueType: data.value_type
  }))

const auditLogEntrySchema = z
  .object({
    id: z.string(),
    actor_user_id: z.string().optional(),
    action_type: auditActionTypeSchema,
    subject_type: auditSubjectTypeSchema,
    subject_id: z.string(),
    source: z.string(),
    occurred_at: z.string(),
    changes: z.array(auditLogChangeSchema)
  })
  .transform((data) => ({
    id: data.id,
    actorUserId: data.actor_user_id,
    actionType: data.action_type,
    subjectType: data.subject_type,
    subjectId: data.subject_id,
    source: data.source,
    occurredAt: data.occurred_at,
    changes: data.changes
  }))

export const auditLogListResponseSchema = z
  .object({
    entries: z.array(auditLogEntrySchema),
    next_before_id: z.string().optional()
  })
  .transform((data) => ({
    entries: data.entries,
    nextBeforeId: data.next_before_id
  }))

export type AuditLogChangeData = z.infer<typeof auditLogChangeSchema>
export type AuditLogEntryData = z.infer<typeof auditLogEntrySchema>
export type AuditLogListResponseData = z.infer<typeof auditLogListResponseSchema>
