import type { JSX, ReactNode } from "react"

import RequiredHint from "@/components/hints/RequiredHint"
import OptionalHint from "@/components/hints/OptionalHint"

import { MdOutlineQuestionAnswer } from "react-icons/md"
import { MdQuestionAnswer } from "react-icons/md"
import { useHover } from "@/hooks/useHover"

import styles from "./ModalLabel.module.css"

type ModalLabelProps = {
  title: string
  icon?: ReactNode
  required?: boolean
  hint?: string
}

export function ModalLabel({ title, icon, required, hint }: ModalLabelProps): JSX.Element {
  const [hoverRef, isHovering] = useHover()

  return (
    <label className={styles.inputLabel}>
      {icon && icon}

      {title}

      {required === true && <RequiredHint />}
      {required === false && <OptionalHint />}

      {hint && (
        <span ref={hoverRef} className={styles.helpHint}>
          {isHovering ? <MdQuestionAnswer /> : <MdOutlineQuestionAnswer />}
          <span className={styles.modalHelpHintText}>{hint}</span>
        </span>
      )}
    </label>
  )
}