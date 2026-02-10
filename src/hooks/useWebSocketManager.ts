import type { ConnectionKill } from "@/types/websocket/events"

import useWebSocket from "react-use-websocket"

import { useEffect, useRef } from "react"
import { useNoteStore } from "../stores/useNotesStore"
import { socketBus } from "@/services/socketBus"
import {
  gatewayMessageSchema,
  ServerEvents,
  type GatewayMessage
} from "../models/events/GatewayEvent"
import { useSessionStore } from "@/stores/useSessionStore"
import { toasts } from "@/utils/toastUtils"
import { useTranslation } from "react-i18next"
import { Permission } from "@/models/Permission"

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
        handleServerMessage(result.data, isFatal, logout, t)
      } else {
        console.error("[WS] Invalid message received:", result.error)
      }
    }
  }, [lastJsonMessage, logout, t])

  return { readyState }
}

function handleServerMessage(
  msg: GatewayMessage,
  fatalRef: React.RefObject<boolean>,
  logoutAction: () => void,
  t: (s: string) => string
) {
  const { addNote, updateNote, removeNote, getNoteById, fetchNotes } = useNoteStore.getState()
  const { user: self, setUser } = useSessionStore.getState()
  const selfHasAdmin = Permission.hasEffective(self?.permissions || 0, Permission.Administrator)
  socketBus.emit(msg.type, msg.data)

  switch (msg.type) {
    case ServerEvents.NoteCreated.type:
      addNote(msg.data)
      break

    case ServerEvents.NoteUpdated.type: {
      const newNote = msg.data
      const oldNote = getNoteById(newNote.id)
      const hasVisibilityChanged = oldNote?.visibility !== newNote.visibility

      // If the note's visibility changed, we need to refetch the notes
      // to ensure the UI reflects the correct set of notes based on the new visibility.
      // Except if user is admin, since they can see all notes regardless of any constraints.
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

    case ServerEvents.UserUpdated.type: {
      const newSelf = msg.data
      if (!selfHasAdmin && Permission.changed(self?.permissions || 0, newSelf.permissions, Permission.SeeHiddenNotes)) {
        // If the user's permission to see hidden notes changed, we need to refetch the notes.
        fetchNotes()
      }

      setUser(newSelf)
      break
    }

    case ServerEvents.SessionExpired.type:
      fatalRef.current = true
      console.warn("[WS] Session expired. Logging out.")
      toasts.warning(t("warnings.sessionExpired"))
      logoutAction()
      break

    case ServerEvents.ConnectionKill.type:
      handleConnectionKill(msg.data, logoutAction, fatalRef, t)
      break

    default:
      break
  }
}

function handleConnectionKill(
  msg: ConnectionKill,
  logoutAction: () => void,
  fatalRef: React.RefObject<boolean>,
  t: (s: string, params?: unknown) => string
) {
  const code = msg.code
  const reason = msg.reason || t("warnings.unspecified")

  console.warn(`[WS] Connection Killed. Code: ${code}`)

  if (code === "IDLE_TIMEOUT") {
    console.log("[WS] Idle timeout. Preparing to auto-reconnect...")
    toasts.warning(t("warnings.reconnectingIdle"))
    return
  }

  if (code === "SUSPENDED") {
    fatalRef.current = true
    toasts.error(t("errors.accountSuspended", { reason: reason }))
    logoutAction()
  }
}
