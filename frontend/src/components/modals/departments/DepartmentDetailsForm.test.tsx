import type { DepartmentData } from "@/types/api/departments"
import type { ReactNode } from "react"

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DepartmentDetailsForm } from "./DepartmentDetailsForm"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        "commons.delete": "Excluir",
        "commons.save": "Salvar",
        "departments.actions.create": "Criar",
        "departments.fields.color": "Cor",
        "departments.fields.colorHint": "A cor aparece apenas na barra lateral de notas.",
        "departments.fields.icon": "Icone",
        "departments.fields.iconHint": `Imagem ate ${options?.max}. Recomendado 64x64+; aparece ao lado do nome na barra de notas.`,
        "departments.fields.name": "Nome",
        "departments.management.create": "Novo departamento",
        "departments.management.deleteDisabled": "Somente departamentos vazios podem ser excluidos.",
        "departments.management.details": "Detalhes"
      }

      return translations[key] ?? key
    }
  })
}))

vi.mock("@/components/ui/AppTooltip", () => ({
  AppTooltip: ({ children, label }: { children: ReactNode; label: string }) => (
    <span data-testid="tooltip" data-label={label}>
      {children}
    </span>
  )
}))

vi.mock("./IconPicker", () => ({
  IconPicker: () => <div data-testid="icon-picker" />
}))

vi.mock("./DepartmentColorPicker", () => ({
  DepartmentColorPicker: () => <div data-testid="color-picker" />
}))

describe("DepartmentDetailsForm", () => {
  it("shows the department icon upload guidance with the shared size limit", () => {
    render(
      <DepartmentDetailsForm
        mode="create"
        name=""
        iconType="NONE"
        emoji=""
        iconFile={null}
        colorRGBA={null}
        isSaving={false}
        onNameChange={vi.fn()}
        onEmojiChange={vi.fn()}
        onFileChange={vi.fn()}
        onRemoveIcon={vi.fn()}
        onColorChange={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(
      screen.getByText(
        "Imagem ate 256 KiB. Recomendado 64x64+; aparece ao lado do nome na barra de notas."
      )
    ).toBeInTheDocument()
  })

  it("disables department deletion with a tooltip when notes still exist", () => {
    render(
      <DepartmentDetailsForm
        mode="edit"
        name="Support"
        iconType="NONE"
        emoji=""
        iconFile={null}
        colorRGBA={null}
        isSaving={false}
        department={makeDepartment(2)}
        onNameChange={vi.fn()}
        onEmojiChange={vi.fn()}
        onFileChange={vi.fn()}
        onRemoveIcon={vi.fn()}
        onColorChange={vi.fn()}
        onSubmit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByRole("button", { name: "Excluir" })).toBeDisabled()
    expect(screen.getByTestId("tooltip")).toHaveAttribute(
      "data-label",
      "Somente departamentos vazios podem ser excluidos."
    )
  })
})

function makeDepartment(noteCount: number): DepartmentData {
  return {
    id: "department-a",
    name: "Support",
    icon_type: "NONE",
    icon_value: "",
    color_rgba: null,
    note_count: noteCount,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z"
  }
}
