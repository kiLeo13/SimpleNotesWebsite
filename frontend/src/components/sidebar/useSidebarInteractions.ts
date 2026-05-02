import type { DragEventHandler, RefObject } from "react"
import type { NoteResponseData } from "@/types/api/notes"
import type { DepartmentGroup } from "./Sidebar.helpers"

import { useEffect, useState } from "react"

type UseSidebarInteractionsParams = {
  canEditNotes: boolean
  notes: NoteResponseData[]
  searchRef: RefObject<HTMLInputElement | null>
  throttledLoadNotes: () => void
  onMoveNote: (note: NoteResponseData, group: DepartmentGroup) => void
}

export function useSidebarInteractions({
  canEditNotes,
  notes,
  searchRef,
  throttledLoadNotes,
  onMoveNote
}: UseSidebarInteractionsParams) {
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const [draggedNoteID, setDraggedNoteID] = useState<string | null>(null)
  const [dropTargetID, setDropTargetID] = useState<string | null>(null)

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase()
      if (e.ctrlKey && key === " ") {
        searchRef.current?.focus()
        e.preventDefault()
      }

      if (e.ctrlKey && key === "r") {
        e.preventDefault()
        throttledLoadNotes()
      }
    }

    window.addEventListener("keydown", handleGlobalKeydown)
    return () => window.removeEventListener("keydown", handleGlobalKeydown)
  }, [searchRef, throttledLoadNotes])

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey) setIsCtrlPressed(true)
    }
    const handleKeyup = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.key === "Control") setIsCtrlPressed(false)
    }
    const handleBlur = () => setIsCtrlPressed(false)

    window.addEventListener("keydown", handleKeydown)
    window.addEventListener("keyup", handleKeyup)
    window.addEventListener("blur", handleBlur)

    return () => {
      window.removeEventListener("keydown", handleKeydown)
      window.removeEventListener("keyup", handleKeyup)
      window.removeEventListener("blur", handleBlur)
    }
  }, [])

  const handleNoteDragStart =
    (note: NoteResponseData): DragEventHandler<HTMLDivElement> =>
    (e) => {
      if (!canEditNotes || !isCtrlPressed) {
        e.preventDefault()
        return
      }

      e.dataTransfer.effectAllowed = "move"
      e.dataTransfer.setData("text/plain", note.id)
      setDraggedNoteID(note.id)
    }

  const handleNoteDragEnd: DragEventHandler<HTMLDivElement> = () => {
    setDraggedNoteID(null)
    setDropTargetID(null)
  }

  const handleCategoryDragOver =
    (group: DepartmentGroup): DragEventHandler<HTMLButtonElement> =>
    (e) => {
      if (!draggedNoteID) return
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      setDropTargetID(group.id)
    }

  const handleCategoryDragLeave =
    (groupID: string): DragEventHandler<HTMLButtonElement> =>
    (e) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        setDropTargetID((current) => (current === groupID ? null : current))
      }
    }

  const handleCategoryDrop =
    (group: DepartmentGroup): DragEventHandler<HTMLButtonElement> =>
    (e) => {
      e.preventDefault()
      e.stopPropagation()

      const noteID = draggedNoteID || e.dataTransfer.getData("text/plain")
      setDraggedNoteID(null)
      setDropTargetID(null)

      if (!canEditNotes || !noteID) return

      const note = notes.find((item) => item.id === noteID)
      if (note) onMoveNote(note, group)
    }

  return {
    draggedNoteID,
    dropTargetID,
    handleCategoryDragLeave,
    handleCategoryDragOver,
    handleCategoryDrop,
    handleNoteDragEnd,
    handleNoteDragStart,
    isCtrlPressed
  }
}
