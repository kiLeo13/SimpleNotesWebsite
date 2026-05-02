import type { DragEventHandler, JSX, MouseEventHandler } from "react"
import type { NoteResponseData } from "@/types/api/notes"
import type { DepartmentGroup } from "./Sidebar.helpers"

import clsx from "clsx"
import { DepartmentIcon } from "../departments/DepartmentIcon"
import { IoChevronForward } from "react-icons/io5"
import { MdOutlineTag } from "react-icons/md"
import { SidebarDraggableNote } from "./SidebarDraggableNote"

import styles from "./SidebarCategoryGroup.module.css"

type SidebarCategoryGroupProps = {
  canEditNotes: boolean
  draggedNoteID: string | null
  group: DepartmentGroup
  isCtrlPressed: boolean
  isDropTarget: boolean
  isExpanded: boolean
  onCategoryDragLeave: DragEventHandler<HTMLButtonElement>
  onCategoryDragOver: DragEventHandler<HTMLButtonElement>
  onCategoryDrop: DragEventHandler<HTMLButtonElement>
  onNoteDragEnd: DragEventHandler<HTMLDivElement>
  onNoteDragStart: (note: NoteResponseData) => DragEventHandler<HTMLDivElement>
  onOpenNote: (note: NoteResponseData) => MouseEventHandler<HTMLDivElement>
  onToggle: () => void
}

export function SidebarCategoryGroup({
  canEditNotes,
  draggedNoteID,
  group,
  isCtrlPressed,
  isDropTarget,
  isExpanded,
  onCategoryDragLeave,
  onCategoryDragOver,
  onCategoryDrop,
  onNoteDragEnd,
  onNoteDragStart,
  onOpenNote,
  onToggle
}: SidebarCategoryGroupProps): JSX.Element {
  const canDragNotes = canEditNotes && isCtrlPressed

  return (
    <div className={styles.departmentGroup}>
      <button
        type="button"
        className={clsx(
          styles.departmentHeader,
          isDropTarget && styles.departmentHeaderDropTarget
        )}
        aria-expanded={isExpanded}
        aria-label={group.name}
        onClick={onToggle}
        onDragOver={onCategoryDragOver}
        onDragLeave={onCategoryDragLeave}
        onDrop={onCategoryDrop}
      >
        <span className={styles.departmentLeading}>
          {group.department ? (
            <DepartmentIcon
              className={styles.departmentIcon}
              department={group.department}
            />
          ) : (
            <MdOutlineTag className={styles.departmentIcon} />
          )}
          <span className={styles.departmentName}>{group.name}</span>
          <IoChevronForward
            className={clsx(
              styles.departmentChevron,
              isExpanded && styles.departmentChevronExpanded
            )}
          />
        </span>
        <span className={styles.departmentCount}>{group.notes.length}</span>
      </button>

      {isExpanded &&
        group.notes.map((note) => (
          <SidebarDraggableNote
            canDrag={canDragNotes}
            isDragging={draggedNoteID === note.id}
            key={note.id}
            note={note}
            onClick={onOpenNote(note)}
            onDragStart={onNoteDragStart(note)}
            onDragEnd={onNoteDragEnd}
          />
        ))}
    </div>
  )
}
