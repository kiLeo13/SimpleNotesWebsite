import useWebSocket from "react-use-websocket"

import {
  gatewayMessageSchema,
  ServerEvents,
  type GatewayMessage
} from "../models/events/GatewayEvent"
import { Permission } from "@/models/Permission"
import { KillCodeBehaviors } from "@/types/websocket/events"
import { toasts } from "@/utils/toastUtils"
import { useEffect, useRef } from "react"
import { useSessionStore } from "@/stores/useSessionStore"
import { useUsersStore } from "@/stores/useUsersStore"
import { useNoteStore } from "../stores/useNotesStore"
import { socketBus } from "@/services/socketBus"
import { useTranslation } from "react-i18next"

const WS_URL = import.meta.env.VITE_WS_URL

export function useWebSocketManager() {
  const { t } = useTranslation()
  const { getIdToken, logout } = useSessionStore()
  const token = getIdToken()
  const isFatal = useRef(false)

  const socketUrl = token
    ? `${WS_URL}?token=${encodeURIComponent(token)}`
    : null

  const { lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: () => {
      if (isFatal.current || !token) return false
      return true
    },
    reconnectAttempts: 5,
    reconnectInterval: 3000,
    heartbeat: {
      message: JSON.stringify({ type: "ping" }),
      returnMessage: JSON.stringify({ type: "ACK" }),
      timeout: 80_000,
      interval: 60_000
    },
    onOpen: () => {
      console.log("[WS] Connected")
      isFatal.current = false
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
    case ServerEvents.NoteCreated.type:
    case ServerEvents.NoteUpdated.type:
    case ServerEvents.NoteDeleted.type:
      handleNoteEvents(msg)
      break

    // User Events
    case ServerEvents.UserCreated.type:
    case ServerEvents.UserUpdated.type:
    case ServerEvents.UserDeleted.type:
      handleUserEvents(msg)
      break

    // System Events
    case ServerEvents.SessionExpired.type:
    case ServerEvents.ConnectionKill.type:
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

function handleNoteEvents(msg: GatewayMessage) {
  const { addNote, updateNote, removeNote, getNoteById, fetchNotes } =
    useNoteStore.getState()
  const { user: self } = useSessionStore.getState()
  const selfHasAdmin = Permission.hasEffective(
    self?.permissions || 0,
    Permission.Administrator
  )

  switch (msg.type) {
    case ServerEvents.NoteCreated.type:
      addNote(msg.data)
      break

    case ServerEvents.NoteUpdated.type: {
      const newNote = msg.data
      const oldNote = getNoteById(newNote.id)
      const hasVisibilityChanged = oldNote?.visibility !== newNote.visibility

      if (hasVisibilityChanged && !selfHasAdmin) {
        fetchNotes()
      } else {
        updateNote(newNote)
      }
      break
    }

    case ServerEvents.NoteDeleted.type:
      removeNote(msg.data.id)
      break
  }
}

function handleUserEvents(msg: GatewayMessage) {
  const { addUser, updateUser, removeUser } = useUsersStore.getState()
  const { user: self, setUser } = useSessionStore.getState()

  switch (msg.type) {
    case ServerEvents.UserCreated.type:
      addUser(msg.data)
      break

    case ServerEvents.UserUpdated.type: {
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
          useNoteStore.getState().fetchNotes()
        }

        setUser(updatedUser)
      }
      break
    }

    case ServerEvents.UserDeleted.type:
      removeUser(msg.data.id)
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
    case ServerEvents.SessionExpired.type:
      fatalRef.current = true
      console.warn("[WS] Session expired. Logging out.")
      toasts.warning(t("warnings.sessionExpired"))
      logoutAction()
      break

    case ServerEvents.ConnectionKill.type: {
      const { code, reason } = msg.data
      console.warn(`[WS] Connection Killed. Code: ${code}`)

      const behavior = KillCodeBehaviors[code]
      if (!behavior.shouldReconnect) {
        fatalRef.current = true
      }

      if (code === "IDLE_TIMEOUT") {
        console.log("[WS] Idle timeout. Preparing to auto-reconnect...")
        toasts.warning(t("warnings.reconnectingIdle"))
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
  localStorage.removeItem("id_token")
  localStorage.removeItem("access_token")
  window.location.reload()
}
