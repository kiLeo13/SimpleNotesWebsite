import type { ComponentProps, JSX } from "react"
import type { ModalLabel } from "./ModalLabel"

import styles from "./ModalSection.module.css"

type ModalSectionProps = ComponentProps<"div"> & {
  label: React.ReactElement<typeof ModalLabel>
  input: React.ReactElement
  style?: React.CSSProperties
}

export function ModalSection({ label, input, style }: ModalSectionProps): JSX.Element {
  return (
    <div className={styles.section} style={style}>
      {label}

      <div className={styles.inputWrapper}>
        {input}
      </div>
    </div>
  )
}