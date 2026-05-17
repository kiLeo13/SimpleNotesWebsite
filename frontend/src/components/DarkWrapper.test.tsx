import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DarkWrapper } from "./DarkWrapper"

describe("DarkWrapper", () => {
  it("isolates mouse down events by default", () => {
    const onWindowMouseDown = vi.fn()
    window.addEventListener("mousedown", onWindowMouseDown)

    render(
      <DarkWrapper>
        <button type="button">Inside modal</button>
      </DarkWrapper>
    )

    fireEvent.mouseDown(screen.getByRole("button", { name: "Inside modal" }))

    expect(onWindowMouseDown).not.toHaveBeenCalled()
    window.removeEventListener("mousedown", onWindowMouseDown)
  })

  it("can let mouse down events reach native window listeners while isolating clicks", () => {
    const onWindowMouseDown = vi.fn()
    const onWindowClick = vi.fn()
    window.addEventListener("mousedown", onWindowMouseDown)
    window.addEventListener("click", onWindowClick)

    render(
      <DarkWrapper isolateMouseDownEvents={false}>
        <button type="button">Pan target</button>
      </DarkWrapper>
    )

    const target = screen.getByRole("button", { name: "Pan target" })
    fireEvent.mouseDown(target)
    fireEvent.click(target)

    expect(onWindowMouseDown).toHaveBeenCalledTimes(1)
    expect(onWindowClick).not.toHaveBeenCalled()
    window.removeEventListener("mousedown", onWindowMouseDown)
    window.removeEventListener("click", onWindowClick)
  })
})
