import type { DragEventHandler, JSX, MouseEventHandler } from "react"
import type { NoteResponseData } from "@/types/api/notes"

import clsx from "clsx"
import { SidebarNote } from "../notes/SidebarNote"

import styles from "./SidebarDraggableNote.module.css"

type SidebarDraggableNoteProps = {
  canDrag: boolean
  isDragging: boolean
  note: NoteResponseData
  onClick: MouseEventHandler<HTMLDivElement>
  onDragEnd: DragEventHandler<HTMLDivElement>
  onDragStart: DragEventHandler<HTMLDivElement>
}

export function SidebarDraggableNote({
  canDrag,
  isDragging,
  note,
  onClick,
  onDragEnd,
  onDragStart
}: SidebarDraggableNoteProps): JSX.Element {
  return (
    <div
      className={clsx(
        styles.noteDragSurface,
        canDrag && styles.noteDragSurfaceReady,
        isDragging && styles.noteDragSurfaceDragging
      )}
      draggable={canDrag}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <SidebarNote onClick={onClick} note={note} />
    </div>
  )
}
