import type { JSX, ReactNode } from "react"

import RequiredHint from "../../../../hints/RequiredHint"
import OptionalHint from "../../../../hints/OptionalHint"

import styles from "./ModalLabel.module.css"

type ModalLabelProps = {
  title: string
  icon?: ReactNode
  required?: boolean
  hint?: string
}

export function ModalLabel({ title, icon, required, hint }: ModalLabelProps): JSX.Element {
  return (
    <label className={styles.inputLabel}>
      {icon && icon}

      {title}

      {required === true && <RequiredHint />}
      {required === false && <OptionalHint />}

      {hint && (
        <span className={styles.helpHint}>
          <span>?</span>
          <span className={styles.modalHelpHintText}>{hint}</span>
        </span>
      )}
    </label>
  )
}