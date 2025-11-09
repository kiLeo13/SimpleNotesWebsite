import type { JSX } from "react"

import RequiredHint from "../../../../hints/RequiredHint"
import OptionalHint from "../../../../hints/OptionalHint"

import styles from "./ModalLabel.module.css"

type ModalLabelProps = {
  title: string
  required?: boolean
  hint?: string
}

export function ModalLabel({ title, required = true, hint }: ModalLabelProps): JSX.Element {
  return (
    <label className={styles.inputLabel}>{title}
      {required && <RequiredHint />}
      {!required && <OptionalHint />}

      {hint && (
        <span className={styles.helpHint}>
          <span>?</span>
          <span className={styles.modalHelpHintText}>{hint}</span>
        </span>
      )}
    </label>
  )
}