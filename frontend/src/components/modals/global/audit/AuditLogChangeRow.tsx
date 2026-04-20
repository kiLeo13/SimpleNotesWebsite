import type { CSSProperties, JSX } from "react"
import type { AuditLogChangeData } from "@/types/api/audit"
import type { AuditLogEvent } from "./AuditLogEvent"

import { getChangeSummary } from "./auditPresentation"
import { useTranslation } from "react-i18next"

import styles from "./AuditLogChangeRow.module.css"

type AuditLogChangeRowProps = {
  change: AuditLogChangeData
  displayCode: number
  event: AuditLogEvent
}

export function AuditLogChangeRow({
  change,
  displayCode,
  event
}: AuditLogChangeRowProps): JSX.Element {
  const { t } = useTranslation()
  const codeStyles = {
    color: event.codeColor
  } satisfies CSSProperties

  return (
    <div className={styles.changeRow}>
      <div className={styles.code} style={codeStyles}>
        {String(displayCode).padStart(2, '0')}
        <span className={styles.dash}>—</span>
      </div>
      <div className={styles.change}>
        <p className={styles.summary}>{getChangeSummary(change, t)}</p>
      </div>
    </div>
  )
}
