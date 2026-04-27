import type { ReactNode } from "react"

import clsx from "clsx"

import styles from "./ApiReferenceCode.module.css"

type ApiReferenceCodeProps = {
  children?: ReactNode
  className?: string
}

export function ApiReferenceCode({
  children,
  className
}: ApiReferenceCodeProps) {
  return <code className={clsx(className, styles.code)}>{children}</code>
}
