import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  useDelayedUnmount,
  useRetainedModalValue
} from "./useModalPresence"

describe("useDelayedUnmount", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("keeps content rendered until the exit delay finishes", () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ open }) => useDelayedUnmount(open, 200),
      { initialProps: { open: false } }
    )

    expect(result.current).toBe(false)

    rerender({ open: true })
    expect(result.current).toBe(true)

    rerender({ open: false })
    expect(result.current).toBe(true)

    act(() => vi.advanceTimersByTime(199))
    expect(result.current).toBe(true)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(false)
  })

  it("cancels the delayed unmount when content reopens", () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ open }) => useDelayedUnmount(open, 200),
      { initialProps: { open: true } }
    )

    rerender({ open: false })
    act(() => vi.advanceTimersByTime(100))

    rerender({ open: true })
    act(() => vi.advanceTimersByTime(200))

    expect(result.current).toBe(true)
  })
})

describe("useRetainedModalValue", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("retains the last modal value while the close animation runs", () => {
    vi.useFakeTimers()
    type ModalType = "DELETE" | "SUSPEND"

    const { result, rerender } = renderHook(
      ({ value }) => useRetainedModalValue<ModalType>(value, 200),
      { initialProps: { value: null as ModalType | null } }
    )

    expect(result.current).toEqual({
      renderedValue: null,
      shouldRender: false
    })

    rerender({ value: "DELETE" })
    expect(result.current).toEqual({
      renderedValue: "DELETE",
      shouldRender: true
    })

    rerender({ value: null })
    expect(result.current).toEqual({
      renderedValue: "DELETE",
      shouldRender: true
    })

    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toEqual({
      renderedValue: null,
      shouldRender: false
    })
  })
})
