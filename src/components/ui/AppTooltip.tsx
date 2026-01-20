import React, { forwardRef } from "react"

import * as Tooltip from "@radix-ui/react-tooltip"

import styles from "./AppTooltip.module.css"

interface AppTooltipProps extends React.ComponentPropsWithoutRef<"button"> {
  children: React.ReactNode
  label: string
  delay?: number
  side?: "top" | "bottom" | "left" | "right"
}

export const AppTooltip = forwardRef<HTMLButtonElement, AppTooltipProps>(
  ({ children, label, delay = 100, side = "top", ...props }, ref) => {
    return (
      <Tooltip.Provider delayDuration={delay}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild ref={ref} {...props}>
            {children}
          </Tooltip.Trigger>

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
)

AppTooltip.displayName = "AppTooltip"
