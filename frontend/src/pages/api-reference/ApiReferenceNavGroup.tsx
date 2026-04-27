import type { ReactNode } from "react"

import { FiChevronDown } from "react-icons/fi"

import styles from "./ApiReferenceNavGroup.module.css"

type ApiReferenceNavGroupProps = {
  children: ReactNode
  expanded: boolean
  onToggle: () => void
  title: string
}

export function ApiReferenceNavGroup({
  children,
  expanded,
  onToggle,
  title
}: ApiReferenceNavGroupProps) {
  return (
    <nav className={styles.navGroup} aria-label={title}>
      <button
        type="button"
        className={styles.navGroupButton}
        onClick={onToggle}
      >
        <span>{title}</span>
        <FiChevronDown className={styles.chevron} data-expanded={expanded} />
      </button>
      {expanded ? <div className={styles.navItems}>{children}</div> : null}
    </nav>
  )
}
