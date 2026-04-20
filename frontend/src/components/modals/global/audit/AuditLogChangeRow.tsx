import type { JSX } from "react"
import type { AuditLogChangeData } from "@/types/api/audit"

import { formatAuditValue, getChangeSummary } from "./auditPresentation"
import { useTranslation } from "react-i18next"

import styles from "./AuditLogChangeRow.module.css"

type AuditLogChangeRowProps = {
  change: AuditLogChangeData
}

export function AuditLogChangeRow({
  change
}: AuditLogChangeRowProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={styles.change}>
      <p className={styles.changeSummary}>{getChangeSummary(change, t)}</p>

      <div className={styles.changeValues}>
        <span className={styles.changeValue}>
          {t("modals.audit.labels.oldValue")}:{" "}
          <strong>{formatAuditValue(change.oldValue, t)}</strong>
        </span>
        <span className={styles.changeValue}>
          {t("modals.audit.labels.newValue")}:{" "}
          <strong>{formatAuditValue(change.newValue, t)}</strong>
        </span>
      </div>
    </div>
  )
}
