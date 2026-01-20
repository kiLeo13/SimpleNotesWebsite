import React, { type JSX } from "react"

import { AppTooltip } from "../ui/AppTooltip"

import styles from "./FooterButton.module.css"

interface FooterButtonProps {
  children: React.ReactNode
  label: string
  onClick: () => void
}

export function FooterButton({ children, label, onClick }: FooterButtonProps): JSX.Element {
  return (
    <AppTooltip label={label}>
      <button onClick={onClick} className={styles.button}>
        {children}
      </button>
    </AppTooltip>
  )
}
