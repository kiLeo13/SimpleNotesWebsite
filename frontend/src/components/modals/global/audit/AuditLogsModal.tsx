import { useMemo, useState, type JSX, type UIEvent } from "react"
import {
  AUDIT_LOAD_MORE_OFFSET_PX,
  EMPTY_AUDIT_FILTERS,
  type AuditFilters
} from "./auditFilters"

import { AiOutlineAudit } from "react-icons/ai"
import { IoMdClose } from "react-icons/io"
import { MdOutlineHistory } from "react-icons/md"
import { Button } from "@/components/ui/buttons/Button"
import { AuditLogEntry } from "./AuditLogEntry"
import { AuditLogFilters } from "./AuditLogFilters"
import { useUsersStore } from "@/stores/useUsersStore"
import { useAuditLogsData } from "./useAuditLogsData"
import { useTranslation } from "react-i18next"
import {
  getAuditActionOptions,
  getAuditSubjectOptions
} from "./auditPresentation"

import styles from "./AuditLogsModal.module.css"

type AuditLogsModalProps = {
  setShowAuditLogs: (flag: boolean) => void
}

export function AuditLogsModal({
  setShowAuditLogs
}: AuditLogsModalProps): JSX.Element {
  const { t } = useTranslation()
  const users = useUsersStore((state) => state.users)
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null)
  const [filters, setFilters] = useState<AuditFilters>(EMPTY_AUDIT_FILTERS)

  const closeModal = () => setShowAuditLogs(false)

  const {
    entries,
    nextBeforeId,
    isLoadingInitial,
    isLoadingMore,
    hasLoadError,
    loadInitialLogs,
    loadMoreLogs,
    resolveUserLabel,
    resolveActorLabel,
    resolveNoteLabel,
    resolveDepartmentLabel
  } = useAuditLogsData({
    appliedFilters: filters,
    t
  })

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.username.localeCompare(b.username)),
    [users]
  )

  const actorOptions = useMemo(
    () =>
      sortedUsers.map((user) => ({
        value: String(user.id),
        label: user.username
      })),
    [sortedUsers]
  )

  const actionOptions = useMemo(() => getAuditActionOptions(t), [t])
  const subjectOptions = useMemo(() => getAuditSubjectOptions(t), [t])

  const handleListScroll = (e: UIEvent<HTMLDivElement>) => {
    if (!nextBeforeId || isLoadingInitial || isLoadingMore) return

    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget
    const remaining = scrollHeight - scrollTop - clientHeight

    if (remaining <= AUDIT_LOAD_MORE_OFFSET_PX) {
      void loadMoreLogs()
    }
  }

  const handleFilterSelectChange = (
    name: keyof AuditFilters,
    value: string
  ) => {
    setExpandedEntryId(null)
    setFilters((current) => ({
      ...current,
      [name]: value
    }))
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <AiOutlineAudit size={25} color="#c0a9eb" />
          <h2 className={styles.title}>{t("modals.audit.title")}</h2>
        </div>

        <AuditLogFilters
          filters={filters}
          actorOptions={actorOptions}
          actionOptions={actionOptions}
          subjectOptions={subjectOptions}
          onSelectChange={handleFilterSelectChange}
        />

        <div className={styles.close} onClick={closeModal}>
          <IoMdClose color="#5e4c79" size={"24px"} />
        </div>
      </header>

      <div className={styles.division} />

      <section className={styles.content}>
        {isLoadingInitial ? (
          <div className={styles.state}>
            <div
              className="loader"
              style={{
                borderTopColor: "#c0a9eb",
                borderLeftColor: "#c0a9eb"
              }}
            />
            <p className={styles.stateText}>{t("modals.audit.loading")}</p>
          </div>
        ) : hasLoadError ? (
          <div className={styles.state}>
            <MdOutlineHistory size={44} color="#c4aedf" />
            <p className={styles.stateText}>{t("modals.audit.loadError")}</p>
            <Button onClick={() => void loadInitialLogs()}>
              {t("modals.audit.retry")}
            </Button>
          </div>
        ) : entries.length === 0 ? (
          <div className={styles.state}>
            <MdOutlineHistory size={44} color="#c4aedf" />
            <p className={styles.stateText}>{t("modals.audit.empty")}</p>
          </div>
        ) : (
          <div
            className={styles.list}
            onScroll={handleListScroll}
            data-testid="audit-log-list"
          >
            {entries.map((entry) => (
              <AuditLogEntry
                key={entry.id}
                entry={entry}
                actorLabel={resolveActorLabel(entry.actorUserId)}
                resolveUserLabel={resolveUserLabel}
                resolveNoteLabel={resolveNoteLabel}
                resolveDepartmentLabel={resolveDepartmentLabel}
                isExpanded={expandedEntryId === entry.id}
                onToggle={() =>
                  setExpandedEntryId((current) =>
                    current === entry.id ? null : entry.id
                  )
                }
              />
            ))}

            <div className={styles.footerState}>
              {isLoadingMore ? (
                <div
                  className="loader"
                  style={{
                    borderTopColor: "#c0a9eb",
                    borderLeftColor: "#c0a9eb",
                    margin: "12px 0"
                  }}
                />
              ) : (
                <p className={styles.footerText}>
                  {nextBeforeId
                    ? t("modals.audit.loadMoreHint")
                    : t("modals.audit.endReached")}
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
