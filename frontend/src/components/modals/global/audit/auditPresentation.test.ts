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

  if (key === "modals.audit.summary.departmentMembershipAdd") {
    return `${options?.actor} adicionou ${options?.username} ao departamento ${options?.subjectId}`
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

  it("resolves department membership user labels from the change payload", () => {
    expect(
      getAuditEntryPresentation(
        makeEntry({
          actionType: "DEPARTMENT_MEMBERSHIP_ADD",
          subjectType: "DEPARTMENT",
          subjectId: "10",
          changes: [
            {
              fieldName: "user_id",
              oldValue: undefined,
              newValue: "88",
              valueType: "STRING"
            }
          ]
        }),
        "Leonardo",
        (userId) => `Maria #${userId}`,
        mockT
      )
    ).toEqual({
      summary: "Leonardo adicionou Maria #88 ao departamento 10",
      expands: true
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
