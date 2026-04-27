import type { ReactNode } from "react"

import styles from "./ApiReferenceCodePre.module.css"

type ApiReferenceCodePreProps = {
  children?: ReactNode
}

export function ApiReferenceCodePre({ children }: ApiReferenceCodePreProps) {
  return <pre className={styles.pre}>{children}</pre>
}
