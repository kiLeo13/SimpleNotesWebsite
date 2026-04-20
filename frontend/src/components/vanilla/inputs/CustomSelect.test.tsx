import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { CustomSelect } from "./CustomSelect"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === "menus.select.searchPlaceholder") {
        return "Buscar..."
      }

      if (key === "menus.select.noResults") {
        return "Nenhum resultado."
      }

      return key
    }
  })
}))

describe("CustomSelect", () => {
  it("focuses the search input when a searchable select opens", async () => {
    render(
      <CustomSelect
        hasSearch
        options={[
          { value: "note", label: "Nota" },
          { value: "file", label: "Arquivo" }
        ]}
        onChange={vi.fn()}
        placeholder="Selecione"
      />
    )

    const trigger = screen.getByRole("button", { name: /selecione/i })

    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Buscar...")).toHaveFocus()
    })
  })

  it("keeps the search input focused when hovering menu items", async () => {
    render(
      <CustomSelect
        hasSearch
        options={[
          { value: "note", label: "Nota" },
          { value: "file", label: "Arquivo" }
        ]}
        onChange={vi.fn()}
        placeholder="Selecione"
      />
    )

    const trigger = screen.getByRole("button", { name: /selecione/i })

    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })

    const searchInput = await screen.findByPlaceholderText("Buscar...")

    await waitFor(() => {
      expect(searchInput).toHaveFocus()
    })

    fireEvent.pointerMove(screen.getByRole("menuitem", { name: /nota/i }))

    expect(searchInput).toHaveFocus()
  })
})
