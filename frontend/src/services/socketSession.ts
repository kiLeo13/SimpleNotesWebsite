const SOCKET_SESSION_STORAGE_KEY = "zenkeep.ws.session_id"
const SOCKET_EVENT_CURSOR_STORAGE_KEY = "zenkeep.ws.last_event_id"

export function getOrCreateSocketSessionId(): string {
  const existing = window.sessionStorage.getItem(SOCKET_SESSION_STORAGE_KEY)
  if (existing) {
    return existing
  }

  const sessionId = createSocketSessionId()
  window.sessionStorage.setItem(SOCKET_SESSION_STORAGE_KEY, sessionId)
  return sessionId
}

export function clearSocketSessionId(): void {
  window.sessionStorage.removeItem(SOCKET_SESSION_STORAGE_KEY)
  clearLastSocketEventId()
}

export function getLastSocketEventId(): string | null {
  return window.sessionStorage.getItem(SOCKET_EVENT_CURSOR_STORAGE_KEY)
}

export function setLastSocketEventId(eventId: string): void {
  window.sessionStorage.setItem(SOCKET_EVENT_CURSOR_STORAGE_KEY, eventId)
}

export function clearLastSocketEventId(): void {
  window.sessionStorage.removeItem(SOCKET_EVENT_CURSOR_STORAGE_KEY)
}

export function buildSocketUrl(
  baseUrl: string,
  token: string,
  sessionId: string,
  lastEventId?: string | null
): string {
  const url = new URL(baseUrl)
  url.searchParams.set("token", token)
  url.searchParams.set("session_id", sessionId)
  if (lastEventId) {
    url.searchParams.set("last_event_id", lastEventId)
  }
  return url.toString()
}

function createSocketSessionId(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return createUuidFromCrypto()
}

function createUuidFromCrypto(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join("")
  ].join("-")
}
