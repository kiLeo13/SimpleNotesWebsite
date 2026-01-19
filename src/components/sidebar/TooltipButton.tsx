import React, { type JSX } from "react"

import * as Tooltip from "@radix-ui/react-tooltip"

import styles from "./TooltipButton.module.css"

interface TooltipButtonProps {
  children: React.ReactNode
  label: string
  onClick: () => void
}

export function TooltipButton({ children, label, onClick }: TooltipButtonProps): JSX.Element {
  return (
    <Tooltip.Provider delayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button onClick={onClick} className={styles.tooltipButton}>
            {children}
          </button>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content className={styles.tooltipContent} sideOffset={5}>
            {label}
            <Tooltip.Arrow className={styles.tooltipArrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
