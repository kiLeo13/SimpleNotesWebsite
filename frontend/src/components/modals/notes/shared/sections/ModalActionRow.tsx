import type { ComponentProps, JSX } from "react"

import clsx from "clsx"

import styles from "./ModalActionRow.module.css"

export function ModalActionRow({
  children,
  className,
  ...props
}: ComponentProps<"div">): JSX.Element {
  return (
    <div className={clsx(styles.modalActionRow, className)} {...props}>
      {children}
    </div>
  )
}
