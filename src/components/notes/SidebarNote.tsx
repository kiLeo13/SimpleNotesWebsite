import type { JSX, MouseEventHandler } from "react"

import styles from "./SidebarNote.module.css"

type SidebarNoteProps = {
  name: string
  onClick?: MouseEventHandler<HTMLDivElement>
}

export function SidebarNote({ name, onClick }: SidebarNoteProps): JSX.Element {
  return (
    <div onClick={onClick} className={styles.noteItem}>
      <span className={styles.noteItemTitle}>{name}</span>
    </div>
  )
}