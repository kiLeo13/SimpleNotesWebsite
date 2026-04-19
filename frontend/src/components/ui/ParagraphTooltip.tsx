import React, { forwardRef } from "react"

import * as Popover from "@radix-ui/react-popover"

import { MarkdownDisplay } from "../displays/markdowns/MarkdownDisplay"

import styles from "./ParagraphTooltip.module.css"

interface ParagraphTooltipProps extends React.ComponentPropsWithoutRef<"button"> {
  children: React.ReactNode
  content: string
  side?: "top" | "bottom" | "left" | "right"
}

export const ParagraphTooltip = forwardRef<HTMLButtonElement, ParagraphTooltipProps>(
  ({ children, content, side = "top", ...props }, ref) => {
    return (
      <Popover.Root>
        <Popover.Trigger asChild>
          <button ref={ref} className={styles.triggerButton} {...props}>
            {children}
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content 
            className={styles.popoverContent} 
            side={side} 
            sideOffset={8}
          >
            <MarkdownDisplay className={styles.content} content={content} />
            <Popover.Arrow className={styles.popoverArrow} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    )
  }
)

ParagraphTooltip.displayName = "ParagraphTooltip"