import React from "react"

import * as Dialog from "@radix-ui/react-dialog"
import clsx from "clsx"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useDelayedUnmount } from "@/hooks/useModalPresence"

import styles from "./DarkWrapper.module.css"

export type ModalAnimationPreset = "none" | "pop" | "slide-up"

type DarkWrapperProps = {
  children: React.ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  zIndex?: number
  isolateEvents?: boolean
  isolateMouseDownEvents?: boolean
  animationPreset?: ModalAnimationPreset
}

export function DarkWrapper({
  children,
  className,
  open,
  onOpenChange,
  zIndex = 40,
  isolateEvents = true,
  isolateMouseDownEvents = true,
  animationPreset = "none"
}: DarkWrapperProps) {
  const isOpen = open ?? true
  const delayedShouldRender = useDelayedUnmount(isOpen)
  const shouldRender = animationPreset === "none" ? isOpen : delayedShouldRender

  const handleEventBubbling = (e: React.SyntheticEvent) => {
    if (isolateEvents) {
      e.stopPropagation()
    }
  }

  const handleMouseDownBubbling = (e: React.SyntheticEvent) => {
    if (isolateEvents && isolateMouseDownEvents) {
      e.stopPropagation()
    }
  }

  if (!shouldRender) {
    return null
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal forceMount>
        <Dialog.Overlay
          forceMount
          data-animation-preset={animationPreset}
          className={styles.overlay}
          style={{ zIndex: zIndex }}
          onClick={handleEventBubbling}
          onMouseDown={handleMouseDownBubbling}
        />

        <Dialog.Content
          forceMount
          data-animation-preset={animationPreset}
          className={clsx(styles.content, className)}
          style={{ zIndex: zIndex + 1 }}
          onClick={handleEventBubbling}
          onMouseDown={handleMouseDownBubbling}
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
