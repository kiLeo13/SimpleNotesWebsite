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

describe("ModalFooter", () => {
  it("renders only the save action without exposing the note ID", () => {
    render(
      <ModalFooter
        exists
        isDirty={false}
        isValid
        isLoading={false}
      />
    )

    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument()
    expect(screen.queryByText(/ID:/i)).not.toBeInTheDocument()
  })
})
