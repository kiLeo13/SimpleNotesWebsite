import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useState, type ReactNode } from "react"

import { DepartmentColorPicker } from "./DepartmentColorPicker"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        "departments.colorPicker.custom": "Cor personalizada",
        "departments.colorPicker.preset": `Cor ${options?.index ?? ""}`,
        "departments.colorPicker.presets": "Cores do departamento",
        "departments.colorPicker.reset": "Resetar cor"
      }

      return translations[key] ?? key
    }
  })
}))

vi.mock("@/components/ui/AppTooltip", () => ({
  AppTooltip: ({ children }: { children: ReactNode }) => <>{children}</>
}))

const colorPickerMock = vi.hoisted(() => ({
  latestProps: null as null | {
    color: { r: number; g: number; b: number; a: number }
    onChange: (color: { r: number; g: number; b: number; a: number }) => void
  }
}))

vi.mock("react-colorful", () => ({
  RgbaColorPicker: (props: {
    color: { r: number; g: number; b: number; a: number }
    onChange: (color: { r: number; g: number; b: number; a: number }) => void
  }) => {
    colorPickerMock.latestProps = props

    return (
      <button
        type="button"
        data-testid="rgba-color-picker"
        onClick={() => props.onChange({ r: 45, g: 179, b: 157, a: 0.5 })}
      />
    )
  }
}))

describe("DepartmentColorPicker", () => {
  it("marks reset as selected when no department color is set", () => {
    render(<DepartmentColorPicker value={null} onChange={vi.fn()} />)

    const resetButton = screen.getByRole("button", { name: "Resetar cor" })
    const customButton = screen.getByRole("button", { name: "Cor personalizada" })

    expect(resetButton).toHaveAttribute("data-active", "true")
    expect(resetButton.querySelectorAll("svg")).toHaveLength(2)
    expect(customButton).toHaveAttribute("data-active", "false")
    expect(customButton.querySelectorAll("svg")).toHaveLength(1)
    expect(customButton).not.toHaveStyle({ backgroundColor: "rgba(45, 179, 157, 1)" })
  })

  it("paints and marks the custom color box when a color is set", () => {
    render(<DepartmentColorPicker value={0x2db39dff} onChange={vi.fn()} />)

    const resetButton = screen.getByRole("button", { name: "Resetar cor" })
    const customButton = screen.getByRole("button", { name: "Cor personalizada" })

    expect(resetButton).toHaveAttribute("data-active", "false")
    expect(resetButton.querySelectorAll("svg")).toHaveLength(1)
    expect(customButton).toHaveAttribute("data-active", "true")
    expect(customButton.querySelectorAll("svg")).toHaveLength(2)
    expect(customButton).toHaveStyle({ backgroundColor: "rgba(45, 179, 157, 1)" })
  })

  it("keeps live alpha drags local instead of echoing rounded props back into the picker", () => {
    const onChange = vi.fn()

    function StatefulPicker() {
      const [value, setValue] = useState<number | null>(null)

      return (
        <DepartmentColorPicker
          value={value}
          onChange={(nextValue) => {
            onChange(nextValue)
            setValue(nextValue)
          }}
        />
      )
    }

    render(<StatefulPicker />)

    fireEvent.click(screen.getByRole("button", { name: "Cor personalizada" }))
    fireEvent.click(screen.getByTestId("rgba-color-picker"))

    expect(onChange).toHaveBeenCalledWith(0x2db39d80)
    expect(colorPickerMock.latestProps?.color.a).toBe(0.5)
  })
})
