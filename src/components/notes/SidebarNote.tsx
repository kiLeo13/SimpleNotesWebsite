import type { JSX } from "react"

import styles from "./SidebarNote.module.css"

type SidebarNoteProps = {
  name: string
}

export function SidebarNote({ name }: SidebarNoteProps): JSX.Element {
  return (
    <div className={styles.noteItem}>
      <span className={styles.noteItemTitle}>{name}</span>
    </div>
  )
}