import React, { type JSX } from "react"

import * as Tooltip from "@radix-ui/react-tooltip"

import styles from "./AppTooltip.module.css"

interface AppTooltipProps {
  children: React.ReactNode
  label: string
  delay?: number
  side?: "top" | "bottom" | "left" | "right"
}

export function AppTooltip({ children, label, delay = 100, side = "top" }: AppTooltipProps): JSX.Element {
  return (
    <Tooltip.Provider delayDuration={delay}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content className={styles.tooltipContent} side={side} sideOffset={5}>
            {label}
            <Tooltip.Arrow className={styles.tooltipArrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
