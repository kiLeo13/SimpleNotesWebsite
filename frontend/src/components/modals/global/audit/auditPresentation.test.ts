import type { AuditLogEntryData } from "@/types/api/audit"

import { AuditLogEvent } from "./AuditLogEvent"
import { getAuditEntryPresentation } from "./auditPresentation"
import { describe, expect, it } from "vitest"

const mockT = (
  key: string,
  options?: Record<string, unknown>
): string => {
  if (key === "modals.audit.summary.userDelete") {
    return `${options?.actor} excluiu o usuário ${options?.username}`
  }

  if (key === "modals.audit.summary.userUpdate") {
    return `${options?.actor} atualizou o usuário ${options?.username}`
  }

  if (key === "modals.audit.summary.companyLookup") {
    return `${options?.actor} consultou a empresa ${options?.subjectId}`
  }

  if (key === "modals.audit.summary.noteCreate") {
    return `${options?.actor} criou a nota ${options?.note}`
  }

  if (key === "modals.audit.summary.noteUpdate") {
    return `${options?.actor} atualizou a nota ${options?.note}`
  }

  if (key === "modals.audit.summary.departmentUpdate") {
    return `${options?.actor} atualizou o departamento ${options?.department}`
  }

  if (key === "modals.audit.summary.departmentMembershipAdd") {
    return `${options?.actor} adicionou um usuario ao departamento ${options?.department}`
  }

  return key
}

describe("auditPresentation", () => {
  it("marks user deletion events as non-expandable and resolves the subject user label", () => {
    const presentation = getAuditEntryPresentation(
      makeEntry({
        actionType: "USER_DELETE",
        subjectType: "USER",
        subjectId: "42",
        changes: []
      }),
      "Leonardo",
      (userId) => `Maria #${userId}`,
      mockT
    )

    expect(presentation).toEqual({
      summary: "Leonardo excluiu o usuário Maria #42",
      expands: false
    })
  })

  it("keeps user update events expandable", () => {
    expect(AuditLogEvent.UserUpdate.expands).toBe(true)
  })

  it("marks company lookups as non-expandable", () => {
    expect(
      getAuditEntryPresentation(
        makeEntry({
          actionType: "COMPANY_LOOKUP",
          subjectType: "COMPANY",
          subjectId: "12345678000195",
          changes: []
        }),
        "Leonardo",
        () => "unused",
        mockT
      )
    ).toEqual({
      summary: "Leonardo consultou a empresa 12345678000195",
      expands: false
    })
  })

  it("uses note names from create and update change rows", () => {
    expect(
      getAuditEntryPresentation(
        makeEntry({
          actionType: "NOTE_CREATE",
          subjectType: "NOTE",
          subjectId: "10",
          changes: [
            {
              fieldName: "name",
              oldValue: undefined,
              newValue: "Guia de Reembolso",
              valueType: "STRING"
            }
          ]
        }),
        "Leonardo",
        () => "unused",
        mockT
      ).summary
    ).toBe("Leonardo criou a nota Guia de Reembolso")

    expect(
      getAuditEntryPresentation(
        makeEntry({
          actionType: "NOTE_UPDATE",
          subjectType: "NOTE",
          subjectId: "10",
          changes: [
            {
              fieldName: "name",
              oldValue: "Guia",
              newValue: "Guia de Reembolso",
              valueType: "STRING"
            }
          ]
        }),
        "Leonardo",
        () => "unused",
        mockT
      ).summary
    ).toBe("Leonardo atualizou a nota Guia de Reembolso")
  })

  it("falls back to cached note names when updates do not rename the note", () => {
    expect(
      getAuditEntryPresentation(
        makeEntry({
          actionType: "NOTE_UPDATE",
          subjectType: "NOTE",
          subjectId: "10",
          changes: [
            {
              fieldName: "tags",
              oldValue: "[\"old\"]",
              newValue: "[\"new\"]",
              valueType: "STRING_ARRAY"
            }
          ]
        }),
        "Leonardo",
        () => "unused",
        mockT,
        () => "Guia de Reembolso"
      ).summary
    ).toBe("Leonardo atualizou a nota Guia de Reembolso")
  })

  it("uses department names from cache or change rows", () => {
    expect(
      getAuditEntryPresentation(
        makeEntry({
          actionType: "DEPARTMENT_UPDATE",
          subjectType: "DEPARTMENT",
          subjectId: "10",
          changes: [
            {
              fieldName: "icon_value",
              oldValue: "paperclip",
              newValue: "card",
              valueType: "STRING"
            }
          ]
        }),
        "Leonardo",
        () => "unused",
        mockT,
        undefined,
        () => "Financeiro"
      ).summary
    ).toBe("Leonardo atualizou o departamento Financeiro")
  })

  it("keeps department membership events compact without fake change details", () => {
    expect(
      getAuditEntryPresentation(
        makeEntry({
          actionType: "DEPARTMENT_MEMBERSHIP_ADD",
          subjectType: "DEPARTMENT",
          subjectId: "10",
          changes: []
        }),
        "Leonardo",
        () => "unused",
        mockT,
        undefined,
        () => "Financeiro"
      )
    ).toEqual({
      summary: "Leonardo adicionou um usuario ao departamento Financeiro",
      expands: false
    })
  })
})

function makeEntry(
  overrides: Partial<AuditLogEntryData> = {}
): AuditLogEntryData {
  return {
    id: "evt-1",
    actorUserId: "7",
    actionType: "NOTE_UPDATE",
    subjectType: "NOTE",
    subjectId: "101",
    source: "HTTP_API",
    occurredAt: "2026-04-19T00:00:00Z",
    changes: [],
    ...overrides
  }
}
