import type { JSX } from "react"

import { TbXboxXFilled } from "react-icons/tb"

import styles from "./PasswordRuleItem.module.css"

type PasswordRuleItemProps = {
  text: string
}

export function PasswordRuleItem({ text }: PasswordRuleItemProps): JSX.Element {
  return (
    <span className={styles.rule}>
      <div className={styles.icon}><TbXboxXFilled color="rgba(216, 102, 102, 1)" /></div>
      <span>{text}</span>
    </span>
  )
}