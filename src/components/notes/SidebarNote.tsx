import type { NoteResponseData } from "../../types/api/notes"
import { useState, type JSX, type MouseEventHandler } from "react"

import { DarkWrapper } from "../DarkWrapper"
import { IoMdSettings } from "react-icons/io"
import { UpdateNoteModalForm } from "../modals/notes/UpdateNoteModalForm"

import styles from "./SidebarNote.module.css"

type SidebarNoteProps = {
  note: NoteResponseData
  onClick?: MouseEventHandler<HTMLDivElement>
  isAdmin: boolean
}

export function SidebarNote({ note, onClick, isAdmin }: SidebarNoteProps): JSX.Element {
  const [isPatching, setIsPatching] = useState(false)

  const handleClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.stopPropagation()
    setIsPatching(true)
  }

  return (
    <div onClick={onClick} className={styles.noteItem}>
      <span className={styles.noteItemTitle}>{note.name}</span>

      {isAdmin && (
        <button onClick={handleClick} className={styles.patch}>
          <IoMdSettings size={"1.2em"} color="#9a83b4ff" />
        </button>
      )}

      {isPatching && (
        <DarkWrapper>
          <UpdateNoteModalForm noteId={note.id} setIsPatching={setIsPatching} />
        </DarkWrapper>
      )}
    </div>
  )
}