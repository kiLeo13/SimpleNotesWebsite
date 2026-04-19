import type { ComponentProps, JSX } from "react"
import type { ModalLabel } from "./ModalLabel"

import clsx from "clsx"

import styles from "./ModalSection.module.css"

type ModalSectionProps = ComponentProps<"div"> & {
  label: React.ReactElement<typeof ModalLabel>
  input: React.ReactElement
  style?: React.CSSProperties
  className?: string
}

export function ModalSection({ label, input, style, className }: ModalSectionProps): JSX.Element {
  return (
    <div className={clsx(styles.section, className)} style={style}>
      {label}

      <div className={styles.inputWrapper}>
        {input}
      </div>
    </div>
  )
}