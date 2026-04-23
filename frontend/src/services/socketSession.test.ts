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
      .mockReturnValue("11111111-1111-4111-8111-111111111111")

    const first = getOrCreateSocketSessionId()
    const second = getOrCreateSocketSessionId()

    expect(first).toBe("11111111-1111-4111-8111-111111111111")
    expect(second).toBe("11111111-1111-4111-8111-111111111111")
    expect(randomUUID).toHaveBeenCalledTimes(1)
  })

  it("clears the current tab session id", () => {
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce("11111111-1111-4111-8111-111111111111")
      .mockReturnValueOnce("22222222-2222-4222-8222-222222222222")

    const first = getOrCreateSocketSessionId()
    clearSocketSessionId()
    const second = getOrCreateSocketSessionId()

    expect(first).toBe("11111111-1111-4111-8111-111111111111")
    expect(second).toBe("22222222-2222-4222-8222-222222222222")
  })

  it("builds a websocket url with auth and session parameters", () => {
    const url = buildSocketUrl("wss://example.com/ws", "token with spaces", "tab-7")
    const parsed = new URL(url)

    expect(parsed.searchParams.get("token")).toBe("token with spaces")
    expect(parsed.searchParams.get("session_id")).toBe("tab-7")
  })

  it("falls back to Web Crypto random values when randomUUID is unavailable", () => {
    const originalRandomUUID = globalThis.crypto.randomUUID
    Object.defineProperty(globalThis.crypto, "randomUUID", {
      configurable: true,
      value: undefined
    })

    const getRandomValues = vi
      .spyOn(globalThis.crypto, "getRandomValues")
      .mockImplementation((array) => {
        const view = array as Uint8Array
        view.set([
          0x00, 0x11, 0x22, 0x33,
          0x44, 0x55, 0x66, 0x77,
          0x88, 0x99, 0xaa, 0xbb,
          0xcc, 0xdd, 0xee, 0xff
        ])
        return array
      })

    try {
      const sessionId = getOrCreateSocketSessionId()

      expect(sessionId).toBe("00112233-4455-4677-8899-aabbccddeeff")
      expect(getRandomValues).toHaveBeenCalledTimes(1)
    } finally {
      Object.defineProperty(globalThis.crypto, "randomUUID", {
        configurable: true,
        value: originalRandomUUID
      })
    }
  })
})
