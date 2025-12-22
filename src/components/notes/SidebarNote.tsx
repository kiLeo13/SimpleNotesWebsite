import type { NoteResponseData } from "@/types/api/notes"
import { useState, type JSX, type MouseEventHandler } from "react"

import clsx from "clsx"

import { DarkWrapper } from "../DarkWrapper"
import { IoMdSettings } from "react-icons/io"
import { UpdateNoteModal } from "../modals/notes/updates/UpdateNoteModal"
import { useNoteStore } from "@/stores/useNotesStore"

import styles from "./SidebarNote.module.css"

type SidebarNoteProps = {
  note: NoteResponseData
  onClick?: MouseEventHandler<HTMLDivElement>
  isAdmin: boolean
}

export function SidebarNote({ note, onClick, isAdmin }: SidebarNoteProps): JSX.Element {
  const [isPatching, setIsPatching] = useState(false)
  const shownNote = useNoteStore((state) => state.shownNote)
  const isOpen = shownNote?.id === note.id

  const handleClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.stopPropagation()
    setIsPatching(true)
  }

  return (
    <div onClick={onClick} className={clsx(styles.noteItem, isOpen && styles.open)}>
      <span className={styles.noteItemTitle}>{note.name}</span>

      {isAdmin && (
        <button onClick={handleClick} className={styles.patch}>
          <IoMdSettings size={"1.2em"} color="#9a83b4ff" />
        </button>
      )}

      {isPatching && (
        <DarkWrapper>
          <UpdateNoteModal noteId={note.id} setIsPatching={setIsPatching} />
        </DarkWrapper>
      )}
    </div>
  )
}