import type { TFunction } from "i18next"
import type { RefObject } from "react"

import {
  serverEvents,
  type GatewayMessage
} from "../models/events/GatewayEvent"
import { connectionKillBehaviors } from "@/types/websocket/events"
import { toasts } from "@/utils/toastUtils"
import { noteService } from "@/services/noteService"
import {
  clearLastSocketEventId,
  clearSocketSessionId,
  getLastSocketEventId,
  setLastSocketEventId
} from "@/services/socketSession"
import { useSessionStore } from "@/stores/useSessionStore"
import { useUsersStore } from "@/stores/useUsersStore"
import { useNoteStore } from "../stores/useNotesStore"
import { useDepartmentsStore } from "@/stores/useDepartmentsStore"
import { socketBus } from "@/services/socketBus"

export async function routeServerMessage(
  msg: GatewayMessage,
  fatalRef: RefObject<boolean>,
  logoutAction: () => void,
  t: TFunction
) {
  socketBus.emit(msg.type, msg.data)

  switch (msg.type) {
    case serverEvents.NoteCreated.type:
    case serverEvents.NoteUpdated.type:
    case serverEvents.NoteDeleted.type:
      await handleNoteEvents(msg)
      break

    case serverEvents.DepartmentCreated.type:
    case serverEvents.DepartmentUpdated.type:
    case serverEvents.DepartmentDeleted.type:
      handleDepartmentEvents(msg)
      break

    case serverEvents.UserCreated.type:
    case serverEvents.UserUpdated.type:
    case serverEvents.UserDeleted.type:
    case serverEvents.PresenceUpdated.type:
      await handleUserEvents(msg)
      break

    case serverEvents.Ack.type:
      break

    case serverEvents.ResyncRequired.type:
    case serverEvents.SessionExpired.type:
    case serverEvents.ConnectionKill.type:
      await handleSystemEvents(msg, fatalRef, logoutAction, t)
      break

    default:
      console.warn(`[WS] Unhandled message type: ${msg.type}`)
      break
  }
}

export function shouldApplyGatewayMessage(msg: GatewayMessage): boolean {
  if (!msg.event_id) {
    return true
  }

  const lastEventId = getLastSocketEventId()
  if (!lastEventId) {
    return true
  }

  return BigInt(msg.event_id) > BigInt(lastEventId)
}

export function persistGatewayCursor(msg: GatewayMessage) {
  if (msg.event_id) {
    setLastSocketEventId(msg.event_id)
  }
}

export async function handleNoteEvents(msg: GatewayMessage) {
  const { addNote, updateNote, removeNote } = useNoteStore.getState()

  switch (msg.type) {
    case serverEvents.NoteCreated.type:
      addNote(msg.data)
      break

    case serverEvents.NoteUpdated.type: {
      const { shownNote } = useNoteStore.getState()
      const shouldRefreshOpenNote =
        shownNote?.id === msg.data.id &&
        shownNote.note_type !== "REFERENCE" &&
        shownNote.updated_at !== msg.data.updated_at

      updateNote(msg.data)
      if (shouldRefreshOpenNote) {
        await refreshOpenTextNote(msg.data.id)
      }
      break
    }

    case serverEvents.NoteDeleted.type:
      removeNote(msg.data.id)
      break
  }
}

async function handleUserEvents(msg: GatewayMessage) {
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

async function handleSystemEvents(
  msg: GatewayMessage,
  fatalRef: RefObject<boolean>,
  logoutAction: () => void,
  t: TFunction
) {
  switch (msg.type) {
    case serverEvents.ResyncRequired.type:
      console.warn(`[WS] Replay fell back to resync: ${msg.data.reason}`)
      await resyncRealtimeState()
      if (msg.data.latest_event_id) {
        setLastSocketEventId(msg.data.latest_event_id)
      } else {
        clearLastSocketEventId()
      }
      break

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

function unmount() {
  clearSocketSessionId()
  localStorage.removeItem("id_token")
  localStorage.removeItem("access_token")
  window.location.reload()
}

async function resyncRealtimeState() {
  const usersStore = useUsersStore.getState()
  const notesStore = useNoteStore.getState()

  await Promise.allSettled([usersStore.reload(), notesStore.reload()])
  await useDepartmentsStore.getState().reload()

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

function handleDepartmentEvents(msg: GatewayMessage) {
  const { addDepartment, updateDepartment, removeDepartment } =
    useDepartmentsStore.getState()

  switch (msg.type) {
    case serverEvents.DepartmentCreated.type:
      addDepartment(msg.data)
      break

    case serverEvents.DepartmentUpdated.type:
      updateDepartment(msg.data)
      break

    case serverEvents.DepartmentDeleted.type:
      removeDepartment(msg.data.id)
      break
  }
}

async function refreshOpenTextNote(noteId: string) {
  const { shownNote, renderNote, closeNote } = useNoteStore.getState()
  if (
    !shownNote ||
    shownNote.id !== noteId ||
    shownNote.note_type === "REFERENCE"
  ) {
    return
  }

  const resp = await noteService.fetchNote(noteId)
  if (!resp.success) {
    if (resp.statusCode === 404) {
      closeNote()
    }
    return
  }

  renderNote(resp.data)
}
