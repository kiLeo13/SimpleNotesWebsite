import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import { ModalFooter } from "./ModalFooter"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === "commons.save") {
        return "Salvar"
      }

      if (key === "updateNoteModal.actions") {
        return "Ações"
      }

      return key
    }
  })
}))

vi.mock("@/components/ui/effects/Ripple", () => ({
  Ripple: () => null
}))

vi.mock("@/components/loader/LoaderWrapper", () => ({
  LoaderWrapper: ({ children }: { children: ReactNode }) => <>{children}</>
}))

vi.mock("@/components/ui/AppTooltip", () => ({
  AppTooltip: ({ children }: { children: ReactNode }) => <>{children}</>
}))

describe("ModalFooter", () => {
  it("renders the left action rail with only the save action", () => {
    render(
      <ModalFooter
        exists
        isDirty={false}
        isValid
        isLoading={false}
      />
    )

    const rail = screen.getByRole("toolbar", { name: "Ações" })
    const saveButton = screen.getByRole("button", { name: "Salvar" })

    expect(rail).toBeInTheDocument()
    expect(saveButton).toBeDisabled()
    expect(screen.queryByText(/ID:/i)).not.toBeInTheDocument()
  })
})
