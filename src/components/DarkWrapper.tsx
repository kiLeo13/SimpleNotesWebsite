import React from "react"

import * as Dialog from "@radix-ui/react-dialog"
import clsx from "clsx"

import styles from "./DarkWrapper.module.css"

type DarkWrapperProps = {
  children: React.ReactNode
  className?: string
  open?: boolean
}

export function DarkWrapper({ children, className, open }: DarkWrapperProps) {
  return (
    <Dialog.Root open={open ?? true}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />

        <Dialog.Content
          className={clsx(styles.content, className)}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
