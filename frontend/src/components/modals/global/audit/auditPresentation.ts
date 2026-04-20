import type {
  AuditActionType,
  AuditLogChangeData,
  AuditLogEntryData,
  AuditSubjectType
} from "@/types/api/audit"
import {
  AuditLogEvent,
  type AuditEntryPresentation,
  type AuditTranslate,
  type AuditUserLabelResolver
} from "./AuditLogEvent"

export type AuditSelectOption = {
  value: string
  label: string
}

const AUDIT_ACTION_LABEL_KEYS: Record<AuditActionType, string> = {
  NOTE_CREATE: "modals.audit.actions.noteCreate",
  NOTE_UPDATE: "modals.audit.actions.noteUpdate",
  NOTE_DELETE: "modals.audit.actions.noteDelete",
  USER_UPDATE: "modals.audit.actions.userUpdate",
  USER_SUSPEND: "modals.audit.actions.userSuspend",
  USER_UNSUSPEND: "modals.audit.actions.userUnsuspend",
  USER_DELETE: "modals.audit.actions.userDelete",
  COMPANY_LOOKUP: "modals.audit.actions.companyLookup"
}

const AUDIT_SUBJECT_LABEL_KEYS: Record<AuditSubjectType, string> = {
  NOTE: "modals.audit.subjects.note",
  USER: "modals.audit.subjects.user",
  COMPANY: "modals.audit.subjects.company"
}

export function getAuditActionOptions(t: AuditTranslate): AuditSelectOption[] {
  return [
    { value: "", label: t("modals.audit.filters.allActions") },
    ...AuditLogEvent.all.map((event) => ({
      value: event.actionType,
      label: t(AUDIT_ACTION_LABEL_KEYS[event.actionType])
    }))
  ]
}

export function getAuditSubjectOptions(t: AuditTranslate): AuditSelectOption[] {
  return [
    { value: "", label: t("modals.audit.filters.allSubjects") },
    ...Object.entries(AUDIT_SUBJECT_LABEL_KEYS).map(([subjectType, labelKey]) => ({
      value: subjectType,
      label: t(labelKey)
    }))
  ]
}

export function formatAuditValue(
  value: string | undefined,
  t: AuditTranslate
): string {
  if (value == null || value === "") {
    return t("modals.audit.emptyValue")
  }

  return value
}

export function getAuditEntryPresentation(
  entry: AuditLogEntryData,
  actorLabel: string,
  resolveUserLabel: AuditUserLabelResolver,
  t: AuditTranslate
): AuditEntryPresentation {
  return AuditLogEvent.getByActionType(entry.actionType).toPresentation({
    entry,
    actorLabel,
    resolveUserLabel,
    t
  })
}

export function getAuditSummary(
  entry: AuditLogEntryData,
  actorLabel: string,
  resolveUserLabel: AuditUserLabelResolver,
  t: AuditTranslate
): string {
  return getAuditEntryPresentation(entry, actorLabel, resolveUserLabel, t).summary
}

export function getChangeSummary(
  change: AuditLogChangeData,
  t: AuditTranslate
): string {
  if (change.oldValue == null && change.newValue != null) {
    return t("modals.audit.change.created", {
      field: getFieldNamePretty(t, change.fieldName),
      newValue: formatAuditValue(change.newValue, t)
    })
  }

  if (change.oldValue != null && change.newValue == null) {
    return t("modals.audit.change.deleted", {
      field: getFieldNamePretty(t, change.fieldName),
      oldValue: formatAuditValue(change.oldValue, t)
    })
  }

  return t("modals.audit.change.updated", {
    field: getFieldNamePretty(t, change.fieldName),
    oldValue: formatAuditValue(change.oldValue, t),
    newValue: formatAuditValue(change.newValue, t)
  })
}

export function getAuditSourceLabel(source: string, t: AuditTranslate): string {
  const labels: Record<string, string> = {
    HTTP_API: t("modals.audit.sources.httpApi")
  }

  return labels[source] ?? source
}

function getFieldNamePretty(t: AuditTranslate, fieldName: string): string {
  const fieldLabelKey = `modals.audit.fields.${fieldName}`
  const translated = t(fieldLabelKey)
  return translated !== fieldLabelKey ? translated : fieldName
}