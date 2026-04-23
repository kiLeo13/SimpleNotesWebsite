const SOCKET_SESSION_STORAGE_KEY = "zenkeep.ws.session_id"

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
}

export function buildSocketUrl(
  baseUrl: string,
  token: string,
  sessionId: string
): string {
  const url = new URL(baseUrl)
  url.searchParams.set("token", token)
  url.searchParams.set("session_id", sessionId)
  return url.toString()
}

function createSocketSessionId(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
