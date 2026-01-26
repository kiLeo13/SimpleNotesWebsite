import React from "react"

import * as Dialog from "@radix-ui/react-dialog"
import clsx from "clsx"

import styles from "./DarkWrapper.module.css"

type DarkWrapperProps = {
  children: React.ReactNode
  className?: string
  open?: boolean
  zIndex?: number
}

export function DarkWrapper({ children, className, open, zIndex = 40 }: DarkWrapperProps) {
  return (
    <Dialog.Root open={open ?? true}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} style={{ zIndex: zIndex }} />

        <Dialog.Content className={clsx(styles.content, className)} style={{ zIndex: zIndex + 1 }}>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
