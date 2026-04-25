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
})

function makeChange(): AuditLogChangeData {
  return {
    fieldName: "title",
    oldValue: "Before",
    newValue: "After",
    valueType: "STRING"
  }
}
