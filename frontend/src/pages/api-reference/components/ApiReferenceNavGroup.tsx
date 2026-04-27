import type { ReactNode } from "react"

import styles from "./ApiReferenceNavGroup.module.css"

type ApiReferenceNavGroupProps = {
  children: ReactNode
  title: string
}

export function ApiReferenceNavGroup({
  children,
  title
}: ApiReferenceNavGroupProps) {
  return (
    <nav className={styles.navGroup} aria-label={title}>
      <h2 className={styles.navGroupTitle}>{title}</h2>
      <div className={styles.navItems}>{children}</div>
    </nav>
  )
}
