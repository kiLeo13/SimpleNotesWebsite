import type { DepartmentData } from "@/types/api/departments"

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DepartmentSidebar } from "./DepartmentSidebar"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        "departments.management.create": "Create department",
        "departments.management.empty": "No departments",
        "departments.management.listTitle": `Departments (${options?.count ?? 0})`,
        "departments.management.options": "Options",
        "departments.actions.bulkDelete": "Delete notes",
        "departments.actions.bulkMove": "Move notes"
      }

      return translations[key] ?? key
    }
  })
}))

vi.mock("@/components/departments/DepartmentIcon", () => ({
  DepartmentIcon: ({ department }: { department: DepartmentData }) => (
    <span aria-hidden="true">{department.icon_value}</span>
  )
}))

describe("DepartmentSidebar", () => {
  it("renders departments and delegates row actions", () => {
    const onCreateClick = vi.fn()
    const onSelectDepartment = vi.fn()

    render(
      <DepartmentSidebar
        departments={[
          makeDepartment("department-a", "Support"),
          makeDepartment("department-b", "Billing")
        ]}
        selectedDepartmentId="department-a"
        getMoveTargets={() => [{ id: null, name: "General" }]}
        onCreateClick={onCreateClick}
        onSelectDepartment={onSelectDepartment}
        onBulkMove={vi.fn()}
        onBulkDelete={vi.fn()}
      />
    )

    expect(screen.getByText("Departments (2)")).toBeInTheDocument()
    expect(screen.getByText("Support")).toBeInTheDocument()
    expect(screen.getByText("Billing")).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText("Create department"))
    expect(onCreateClick).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText("Billing"))
    expect(onSelectDepartment).toHaveBeenCalledWith("department-b")
  })

  it("only exposes bulk note actions for departments that have notes", () => {
    render(
      <DepartmentSidebar
        departments={[
          makeDepartment("department-a", "Empty", 0),
          makeDepartment("department-b", "Has notes", 2)
        ]}
        selectedDepartmentId="department-a"
        getMoveTargets={() => [{ id: null, name: "General" }]}
        onCreateClick={vi.fn()}
        onSelectDepartment={vi.fn()}
        onBulkMove={vi.fn()}
        onBulkDelete={vi.fn()}
      />
    )

    expect(screen.getAllByLabelText("Options")).toHaveLength(1)
  })
})

function makeDepartment(id: string, name: string, noteCount = 0): DepartmentData {
  return {
    id,
    name,
    icon_type: "EMOJI",
    icon_value: "🏷️",
    color_rgba: null,
    note_count: noteCount,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z"
  }
}
