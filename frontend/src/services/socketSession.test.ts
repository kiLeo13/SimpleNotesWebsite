import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  buildSocketUrl,
  clearSocketSessionId,
  getOrCreateSocketSessionId
} from "./socketSession"

describe("socketSession", () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it("reuses the same socket session id for the current tab", () => {
    const randomUUID = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValue("tab-1")

    const first = getOrCreateSocketSessionId()
    const second = getOrCreateSocketSessionId()

    expect(first).toBe("tab-1")
    expect(second).toBe("tab-1")
    expect(randomUUID).toHaveBeenCalledTimes(1)
  })

  it("clears the current tab session id", () => {
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce("tab-1")
      .mockReturnValueOnce("tab-2")

    const first = getOrCreateSocketSessionId()
    clearSocketSessionId()
    const second = getOrCreateSocketSessionId()

    expect(first).toBe("tab-1")
    expect(second).toBe("tab-2")
  })

  it("builds a websocket url with auth and session parameters", () => {
    const url = buildSocketUrl("wss://example.com/ws", "token with spaces", "tab-7")
    const parsed = new URL(url)

    expect(parsed.searchParams.get("token")).toBe("token with spaces")
    expect(parsed.searchParams.get("session_id")).toBe("tab-7")
  })
})
