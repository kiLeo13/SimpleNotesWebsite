import type { JSX } from "react"

import { TbXboxXFilled } from "react-icons/tb"

import styles from "./PasswordRuleItem.module.css"

type PasswordRuleItemProps = {
  text: string
}

export function PasswordRuleItem({ text }: PasswordRuleItemProps): JSX.Element {
  return (
    <span className={styles.rule}>
      <span className={styles.icon}>
        <TbXboxXFilled aria-hidden="true" size={16} />
      </span>
      <span>{text}</span>
    </span>
  )
}
