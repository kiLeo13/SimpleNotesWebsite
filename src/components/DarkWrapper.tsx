import React from "react"

import * as Dialog from "@radix-ui/react-dialog"
import clsx from "clsx"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

import styles from "./DarkWrapper.module.css"

type DarkWrapperProps = {
  children: React.ReactNode
  className?: string
  open?: boolean
  zIndex?: number
  isolateEvents?: boolean
}

export function DarkWrapper({
  children,
  className,
  open,
  zIndex = 40,
  isolateEvents = true
}: DarkWrapperProps) {
  const handleEventBubbling = (e: React.SyntheticEvent) => {
    if (isolateEvents) {
      e.stopPropagation()
    }
  }

  return (
    <Dialog.Root open={open ?? true}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={styles.overlay}
          style={{ zIndex: zIndex }}
          onClick={handleEventBubbling}
          onMouseDown={handleEventBubbling}
        />

        <Dialog.Content
          className={clsx(styles.content, className)}
          style={{ zIndex: zIndex + 1 }}
          onClick={handleEventBubbling}
          onMouseDown={handleEventBubbling}
        >
          <VisuallyHidden>
            {/* I know exactly what I am doing */}
            <Dialog.Title>trapLayer</Dialog.Title>
            <Dialog.Description>trapLayer</Dialog.Description>
          </VisuallyHidden>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
