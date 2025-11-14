import type { JSX } from "react"

import styles from "./ModalActionRow.module.css"

type ModalActionRowProps = {
  children: React.ReactElement[] | React.ReactElement
}

export function ModalActionRow({ children: sections }: ModalActionRowProps): JSX.Element {
  return (
    <div className={styles.modalActionRow}>
      {sections}
    </div>
  )
}