import type { JSX } from "react"

import styles from "./ModalActionRow.module.css"

type ModalActionRowProps = {
  label: React.ReactNode
  input: React.ReactNode
}

export function ModalActionRow({ label, input }: ModalActionRowProps): JSX.Element {
  return (
    <div className={styles.modalActionRow}>
      {label}
      {input}
    </div>
  )
}