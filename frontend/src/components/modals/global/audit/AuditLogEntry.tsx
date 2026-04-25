import type { JSX } from "react"
import type { AuditLogEntryData } from "@/types/api/audit"

import { IoPerson } from "react-icons/io5"
import { FiChevronDown } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import { formatLocalTimestamp } from "@/utils/utils"

import { AuditLogEvent, type AuditUserLabelResolver } from "./AuditLogEvent"
import { AuditLogChangeRow } from "./AuditLogChangeRow"
import { getAuditSummary } from "./auditPresentation"

import clsx from "clsx"

import styles from "./AuditLogEntry.module.css"

type AuditLogEntryProps = {
  entry: AuditLogEntryData
  actorLabel: string
  resolveUserLabel: AuditUserLabelResolver
  isExpanded: boolean
  onToggle: () => void
}

export function AuditLogEntry({
  entry,
  actorLabel,
  resolveUserLabel,
  isExpanded,
  onToggle
}: AuditLogEntryProps): JSX.Element {
  const { t } = useTranslation()
  const detailsId = `audit-log-details-${entry.id}`
  const event = AuditLogEvent.getByActionType(entry.actionType)
  const summary = getAuditSummary(entry, actorLabel, resolveUserLabel, t)
  const canExpand = event.expands

  const entryContent = (
    <>
      <div className={styles.entryLeft}>
        <div className={styles.entryIcon}>
          <IoPerson size={"1.3em"} color="#644a7a" />
        </div>
        <div className={styles.entryMain}>
          <p className={styles.entrySummary}>{summary}</p>
          <span className={styles.entryMeta}>
            {formatLocalTimestamp(entry.occurredAt)}
          </span>
        </div>
      </div>

      {canExpand && (
        <FiChevronDown
          size={18}
          className={styles.chevron}
          data-expanded={isExpanded}
        />
      )}
    </>
  )

  return (
    <article className={styles.entry}>
      {canExpand ? (
        <button
          type="button"
          className={clsx(styles.entryButton, isExpanded && styles.expanded)}
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={detailsId}
        >
          {entryContent}
        </button>
      ) : (
        <div
          className={styles.entryButton}
          style={{ cursor: "default" }}
          aria-disabled="true"
        >
          {entryContent}
        </div>
      )}

      {canExpand && isExpanded && (
        <div className={styles.entryDetails} id={detailsId}>
          {entry.changes.length === 0 ? (
            <p className={styles.emptyDetails}>{t("modals.audit.noChanges")}</p>
          ) : (
            <div className={styles.changesList}>
              {entry.changes.map((change, index) => (
                <AuditLogChangeRow
                  key={`${entry.id}-${change.fieldName}-${index}`}
                  change={change}
                  displayCode={index + 1}
                  event={event}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
