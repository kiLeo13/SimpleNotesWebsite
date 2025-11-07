import { useState, type JSX, type MouseEventHandler } from "react"

import { DarkWrapper } from "../DarkWrapper"
import { IoMdSettings } from "react-icons/io"
import { UpdateNoteModalForm } from "../modals/notes/UpdateNoteModalForm"

import styles from "./SidebarNote.module.css"

type SidebarNoteProps = {
  name: string
  onClick?: MouseEventHandler<HTMLDivElement>
  isAdmin: boolean
}

export function SidebarNote({ name, onClick, isAdmin }: SidebarNoteProps): JSX.Element {
  const [isPatching, setIsPatching] = useState(false)

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setIsPatching(true)
  }

  return (
    <div onClick={onClick} className={styles.noteItem}>
      <span className={styles.noteItemTitle}>{name}</span>

      {isAdmin && (
        <button onClick={handleClick} className={styles.patch}>
          <IoMdSettings size={"1.2em"} color="#9a83b4ff" />
        </button>
      )}

      {isPatching && (
        <DarkWrapper>
          <UpdateNoteModalForm />
        </DarkWrapper>
      )}
    </div>
  )
}