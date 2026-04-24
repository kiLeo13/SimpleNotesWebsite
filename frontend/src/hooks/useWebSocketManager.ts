import useWebSocket, { ReadyState } from "react-use-websocket"

import {
  gatewayMessageSchema,
  serverEvents,
  type GatewayMessage
} from "../models/events/GatewayEvent"
import { Permission } from "@/models/Permission"
import { connectionKillBehaviors } from "@/types/websocket/events"
import { toasts } from "@/utils/toastUtils"
import { useEffect, useRef } from "react"
import { noteService } from "@/services/noteService"
import {
  buildSocketUrl,
  clearSocketSessionId,
  getOrCreateSocketSessionId
} from "@/services/socketSession"
import { useSessionStore } from "@/stores/useSessionStore"
import { useUsersStore } from "@/stores/useUsersStore"
import { useNoteStore } from "../stores/useNotesStore"
import { socketBus } from "@/services/socketBus"
import { useTranslation } from "react-i18next"

const WS_URL = import.meta.env.VITE_WS_URL
const PING_INTERVAL_MS = 60_000

export function useWebSocketManager() {
  const { t } = useTranslation()
  const { getIdToken, logout } = useSessionStore()
  const token = getIdToken()
  const isFatal = useRef(false)
  const shouldResyncOnOpen = useRef(false)
  const socketSessionId = useRef<string | null>(null)

  if (token && socketSessionId.current === null) {
    socketSessionId.current = getOrCreateSocketSessionId()
  }

  if (!token) {
    socketSessionId.current = null
  }

  const socketUrl =
    token && socketSessionId.current
      ? buildSocketUrl(WS_URL, token, socketSessionId.current)
      : null

  const { lastJsonMessage, readyState, sendJsonMessage } = useWebSocket(socketUrl, {
    share: true,
    shouldReconnect: () => {
      if (isFatal.current || !token) return false
      return true
    },
    reconnectAttempts: 1000,
    reconnectInterval: 3000,
    onOpen: () => {
      console.log("[WS] Connected")
      isFatal.current = false

       if (shouldResyncOnOpen.current) {
        shouldResyncOnOpen.current = false
        void resyncRealtimeState()
      }
    },
    onClose: (event) => {
      if (isFatal.current || !token) {
        return
      }

      shouldResyncOnOpen.current = true
      console.warn(
        `[WS] Closed. Code: ${event.code}. Reason: ${event.reason || "unspecified"}`
      )
    },
    onError: (e) => console.error("[WS] Error:", e)
  })

  useEffect(() => {
    if (lastJsonMessage) {
      const result = gatewayMessageSchema.safeParse(lastJsonMessage)
      if (result.success) {
        routeServerMessage(result.data, isFatal, logout, t)
      } else {
        console.error("[WS] Invalid message received:", result.error)
      }
    }
  }, [lastJsonMessage, logout, t])

  useEffect(() => {
    if (!token) {
      return
    }

    const ping = () => {
      if (document.visibilityState !== "visible") {
        return
      }

      if (readyState !== ReadyState.OPEN) {
        return
      }

      sendJsonMessage({ type: "ping" }, false)
    }

    ping()

    const pingInterval = window.setInterval(ping, PING_INTERVAL_MS)
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return
      }

      if (readyState !== ReadyState.OPEN) {
        shouldResyncOnOpen.current = true
        return
      }

      sendJsonMessage({ type: "ping" }, false)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.clearInterval(pingInterval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [readyState, sendJsonMessage, token])

  return { readyState }
}

// ----------------------------------------
// Event Router
// ----------------------------------------

function routeServerMessage(
  msg: GatewayMessage,
  fatalRef: React.RefObject<boolean>,
  logoutAction: () => void,
  t: (s: string) => string
) {
  // Always emit to the event bus first
  socketBus.emit(msg.type, msg.data)

  switch (msg.type) {
    // Note Events
    case serverEvents.NoteCreated.type:
    case serverEvents.NoteUpdated.type:
    case serverEvents.NoteDeleted.type:
      handleNoteEvents(msg)
      break

    // User Events
    case serverEvents.UserCreated.type:
    case serverEvents.UserUpdated.type:
    case serverEvents.UserDeleted.type:
    case serverEvents.PresenceUpdated.type:
      handleUserEvents(msg)
      break

    case serverEvents.Ack.type:
      break

    // System Events
    case serverEvents.SessionExpired.type:
    case serverEvents.ConnectionKill.type:
      handleSystemEvents(msg, fatalRef, logoutAction, t)
      break

    default:
      console.warn(`[WS] Unhandled message type: ${msg.type}`)
      break
  }
}

// ----------------------------------------
// Domain Handlers
// ----------------------------------------

export function handleNoteEvents(msg: GatewayMessage) {
  const { addNote, updateNote, removeNote } = useNoteStore.getState()
  const { user: self } = useSessionStore.getState()
  const canSeeHiddenNotes = Permission.hasEffective(
    self?.permissions || 0,
    Permission.SeeHiddenNotes
  )

  switch (msg.type) {
    case serverEvents.NoteCreated.type:
      if (shouldHideNoteFromClient(msg.data.visibility, canSeeHiddenNotes)) {
        removeNote(msg.data.id)
        break
      }
      addNote(msg.data)
      break

    case serverEvents.NoteUpdated.type: {
      if (shouldHideNoteFromClient(msg.data.visibility, canSeeHiddenNotes)) {
        removeNote(msg.data.id)
        break
      }
      updateNote(msg.data)
      break
    }

    case serverEvents.NoteDeleted.type:
      removeNote(msg.data.id)
      break
  }
}

function shouldHideNoteFromClient(
  visibility: "PUBLIC" | "PRIVATE",
  canSeeHiddenNotes: boolean
): boolean {
  return visibility === "PRIVATE" && !canSeeHiddenNotes
}

function handleUserEvents(msg: GatewayMessage) {
  const { addUser, updateUser, updatePresence, removeUser } =
    useUsersStore.getState()
  const { user: self, setUser } = useSessionStore.getState()

  switch (msg.type) {
    case serverEvents.UserCreated.type:
      addUser(msg.data)
      break

    case serverEvents.UserUpdated.type: {
      const updatedUser = msg.data

      updateUser(updatedUser)

      if (self && self.id === updatedUser.id) {
        const selfHasAdmin = Permission.hasEffective(
          self.permissions,
          Permission.Administrator
        )
        const permissionChanged = Permission.changed(
          self.permissions,
          updatedUser.permissions,
          Permission.SeeHiddenNotes
        )

        // Refetch notes if our own view permissions changed
        if (!selfHasAdmin && permissionChanged) {
          void useNoteStore.getState().reload()
        }

        setUser(updatedUser)
      }
      break
    }

    case serverEvents.UserDeleted.type:
      removeUser(msg.data.id)
      break

    case serverEvents.PresenceUpdated.type:
      updatePresence(msg.data.id, msg.data.presence)
      break
  }
}

function handleSystemEvents(
  msg: GatewayMessage,
  fatalRef: React.RefObject<boolean>,
  logoutAction: () => void,
  t: (s: string, params?: unknown) => string
) {
  switch (msg.type) {
    case serverEvents.SessionExpired.type:
      fatalRef.current = true
      console.warn("[WS] Session expired. Logging out.")
      toasts.warning(t("warnings.sessionExpired"))
      logoutAction()
      break

    case serverEvents.ConnectionKill.type: {
      const { code, reason } = msg.data
      console.warn(`[WS] Connection Killed. Code: ${code}`)

      const behavior = connectionKillBehaviors[code]
      if (!behavior.shouldReconnect) {
        fatalRef.current = true
      }

      if (code === "IDLE_TIMEOUT") {
        console.log("[WS] Idle timeout. Preparing to auto-reconnect...")
        return
      }

      if (code === "SUSPENDED_ACCOUNT") {
        toasts.error(
          t("errors.accountSuspended", {
            reason: reason || t("warnings.unspecified")
          })
        )
      }

      if (!behavior.shouldReconnect) {
        logoutAction()
        unmount()
      }
      break
    }
  }
}

// ----------------------------------------
// Helpers
// ----------------------------------------

function unmount() {
  clearSocketSessionId()
  localStorage.removeItem("id_token")
  localStorage.removeItem("access_token")
  window.location.reload()
}

async function resyncRealtimeState() {
  const usersStore = useUsersStore.getState()
  const notesStore = useNoteStore.getState()

  await Promise.allSettled([
    usersStore.reload(),
    notesStore.reload()
  ])

  const { shownNote, renderNote, closeNote } = useNoteStore.getState()
  if (!shownNote || shownNote.note_type === "REFERENCE") {
    return
  }

  const resp = await noteService.fetchNote(shownNote.id)
  if (!resp.success) {
    if (resp.statusCode === 404) {
      closeNote()
    }
    return
  }

  renderNote(resp.data)
}
