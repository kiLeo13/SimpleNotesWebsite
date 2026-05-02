import { render, screen } from "@testing-library/react"
import type { AuditLogChangeData } from "@/types/api/audit"

import { AuditLogChangeRow } from "./AuditLogChangeRow"
import { AuditLogEvent, COLOR_UPDATE } from "./AuditLogEvent"
import { describe, expect, it, vi } from "vitest"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === "modals.audit.change.updated") {
        return `Alterou ${options?.field} de ${options?.oldValue} para ${options?.newValue}`
      }

      if (key === "modals.audit.change.created") {
        return `Definiu ${options?.field} como ${options?.newValue}`
      }

      if (key === "modals.audit.change.deleted") {
        return `Removeu ${options?.field} (antes: ${options?.oldValue})`
      }

      if (key === "modals.audit.emptyValue") {
        return "Sem valor"
      }

      if (key === "departments.general") {
        return "Geral"
      }

      if (key === "modals.audit.fields.department_id") {
        return "departamento"
      }

      return key
    }
  })
}))

describe("AuditLogChangeRow", () => {
  it("renders the local display code and applies the event accent color", () => {
    render(
      <AuditLogChangeRow
        change={makeChange()}
        displayCode={3}
        event={AuditLogEvent.NoteUpdate}
        resolveDepartmentLabel={(id) => `#${id}`}
      />
    )

    const code = screen.getByText((_, element) => {
      return element?.textContent === "3 - "
    })

    expect(code).toBeInTheDocument()
    expect(code).toHaveStyle(`--code-color: ${COLOR_UPDATE}`)
    expect(code).toHaveStyle(`color: ${COLOR_UPDATE}`)
    expect(
      screen.getByText("Alterou title de Before para After")
    ).toBeInTheDocument()
  })

  it("formats department references as names and General instead of raw IDs", () => {
    render(
      <AuditLogChangeRow
        change={{
          fieldName: "department_id",
          oldValue: "70184547911740105",
          newValue: "",
          valueType: "STRING"
        }}
        displayCode={1}
        event={AuditLogEvent.NoteUpdate}
        resolveDepartmentLabel={(id) =>
          id === "70184547911740105" ? "Financeiro" : `#${id}`
        }
      />
    )

    expect(
      screen.getByText("Alterou departamento de Financeiro para Geral")
    ).toBeInTheDocument()
  })
})

function makeChange(): AuditLogChangeData {
  return {
    fieldName: "title",
    oldValue: "Before",
    newValue: "After",
    valueType: "STRING"
  }
}
