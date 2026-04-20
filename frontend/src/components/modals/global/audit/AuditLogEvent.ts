import type {
  AuditActionType,
  AuditLogEntryData,
  AuditSubjectType
} from "@/types/api/audit"

export const COLOR_OK = "#7ecb94"
export const COLOR_UPDATE = "#fcb529"
export const COLOR_DANGER = "#ffa09b"

export type AuditTranslate = (
  key: string,
  options?: Record<string, unknown>
) => string

export type AuditUserLabelResolver = (userId: number | undefined) => string

export type AuditEntryPresentation = {
  summary: string
  expands: boolean
}

type AuditSummaryContext = {
  entry: AuditLogEntryData
  actorLabel: string
  resolveUserLabel: AuditUserLabelResolver
  t: AuditTranslate
}

type AuditLogEventConfig =
  | {
      actionType: AuditActionType
      subjectType: AuditSubjectType
      expands: true
      codeColor: string
      summary: (context: AuditSummaryContext) => string
    }
  | {
      actionType: AuditActionType
      subjectType: AuditSubjectType
      expands: false
      codeColor?: string
      summary: (context: AuditSummaryContext) => string
    }

function resolveAuditUserSubjectLabel(
  subjectId: string,
  resolveUserLabel: AuditUserLabelResolver
): string {
  const parsedUserId = Number(subjectId)

  if (!Number.isInteger(parsedUserId)) {
    return subjectId
  }

  return resolveUserLabel(parsedUserId)
}

export class AuditLogEvent {
  public readonly actionType: AuditActionType
  public readonly subjectType: AuditSubjectType
  public readonly expands: boolean
  public readonly codeColor?: string

  private readonly summaryResolver: AuditLogEventConfig["summary"]

  private constructor(config: AuditLogEventConfig) {
    this.actionType = config.actionType
    this.subjectType = config.subjectType
    this.expands = config.expands
    this.codeColor = config.codeColor
    this.summaryResolver = config.summary
  }

  static readonly NoteCreate = new AuditLogEvent({
    actionType: "NOTE_CREATE",
    subjectType: "NOTE",
    expands: true,
    codeColor: COLOR_OK,
    summary: ({ actorLabel, entry, t }) =>
      t("modals.audit.summary.noteCreate", {
        actor: actorLabel,
        subjectId: entry.subjectId
      })
  })

  static readonly NoteUpdate = new AuditLogEvent({
    actionType: "NOTE_UPDATE",
    subjectType: "NOTE",
    expands: true,
    codeColor: COLOR_UPDATE,
    summary: ({ actorLabel, entry, t }) =>
      t("modals.audit.summary.noteUpdate", {
        actor: actorLabel,
        subjectId: entry.subjectId
      })
  })

  static readonly NoteDelete = new AuditLogEvent({
    actionType: "NOTE_DELETE",
    subjectType: "NOTE",
    expands: false,
    summary: ({ actorLabel, entry, t }) =>
      t("modals.audit.summary.noteDelete", {
        actor: actorLabel,
        subjectId: entry.subjectId
      })
  })

  static readonly UserUpdate = new AuditLogEvent({
    actionType: "USER_UPDATE",
    subjectType: "USER",
    expands: true,
    codeColor: COLOR_UPDATE,
    summary: ({ actorLabel, entry, resolveUserLabel, t }) =>
      t("modals.audit.summary.userUpdate", {
        actor: actorLabel,
        username: resolveAuditUserSubjectLabel(
          entry.subjectId,
          resolveUserLabel
        )
      })
  })

  static readonly UserSuspend = new AuditLogEvent({
    actionType: "USER_SUSPEND",
    subjectType: "USER",
    expands: false,
    summary: ({ actorLabel, entry, resolveUserLabel, t }) =>
      t("modals.audit.summary.userSuspend", {
        actor: actorLabel,
        username: resolveAuditUserSubjectLabel(
          entry.subjectId,
          resolveUserLabel
        )
      })
  })

  static readonly UserUnsuspend = new AuditLogEvent({
    actionType: "USER_UNSUSPEND",
    subjectType: "USER",
    expands: false,
    summary: ({ actorLabel, entry, resolveUserLabel, t }) =>
      t("modals.audit.summary.userUnsuspend", {
        actor: actorLabel,
        username: resolveAuditUserSubjectLabel(
          entry.subjectId,
          resolveUserLabel
        )
      })
  })

  static readonly UserDelete = new AuditLogEvent({
    actionType: "USER_DELETE",
    subjectType: "USER",
    expands: false,
    summary: ({ actorLabel, entry, resolveUserLabel, t }) =>
      t("modals.audit.summary.userDelete", {
        actor: actorLabel,
        username: resolveAuditUserSubjectLabel(
          entry.subjectId,
          resolveUserLabel
        )
      })
  })

  static readonly CompanyLookup = new AuditLogEvent({
    actionType: "COMPANY_LOOKUP",
    subjectType: "COMPANY",
    expands: false,
    summary: ({ actorLabel, entry, t }) =>
      t("modals.audit.summary.companyLookup", {
        actor: actorLabel,
        subjectId: entry.subjectId
      })
  })

  static get all(): AuditLogEvent[] {
    return [
      AuditLogEvent.NoteCreate,
      AuditLogEvent.NoteUpdate,
      AuditLogEvent.NoteDelete,
      AuditLogEvent.UserUpdate,
      AuditLogEvent.UserSuspend,
      AuditLogEvent.UserUnsuspend,
      AuditLogEvent.UserDelete,
      AuditLogEvent.CompanyLookup
    ]
  }

  static getByActionType(actionType: AuditActionType): AuditLogEvent {
    const match = AuditLogEvent.all.find(
      (event) => event.actionType === actionType
    )

    if (!match) {
      throw new Error(`Unhandled audit action type: ${actionType}`)
    }

    return match
  }

  toPresentation(context: AuditSummaryContext): AuditEntryPresentation {
    return {
      summary: this.summaryResolver(context),
      expands: this.expands
    }
  }
}
