import type { JSX } from "react"
import type { AuditFilters } from "./auditFilters"
import type { AuditSelectOption } from "./auditPresentation"

import { CustomSelect } from "@/components/vanilla/inputs/CustomSelect"
import { useTranslation } from "react-i18next"

import styles from "./AuditLogFilters.module.css"

type AuditLogFiltersProps = {
  filters: AuditFilters
  actorOptions: AuditSelectOption[]
  actionOptions: AuditSelectOption[]
  subjectOptions: AuditSelectOption[]
  onSelectChange: (name: keyof AuditFilters, value: string) => void
}

export function AuditLogFilters({
  filters,
  actorOptions,
  actionOptions,
  subjectOptions,
  onSelectChange
}: AuditLogFiltersProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={styles.filters}>
      <label className={styles.filterField}>
        <span className={styles.filterLabel}>
          {t("modals.audit.filters.actor")}
        </span>
        <CustomSelect
          hasSearch
          id="audit-filter-actor"
          value={filters.actorUserId}
          options={[
            {
              value: "",
              label: t("modals.audit.filters.allActors")
            },
            ...actorOptions
          ]}
          onChange={(value) => onSelectChange("actorUserId", value)}
          placeholder={t("modals.audit.filters.allActors")}
          aria-label={t("modals.audit.filters.actor")}
        />
      </label>

      <label className={styles.filterField}>
        <span className={styles.filterLabel}>
          {t("modals.audit.filters.action")}
        </span>
        <CustomSelect
          hasSearch
          id="audit-filter-action"
          value={filters.actionType}
          options={actionOptions}
          onChange={(value) => onSelectChange("actionType", value)}
          placeholder={t("modals.audit.filters.allActions")}
          aria-label={t("modals.audit.filters.action")}
        />
      </label>

      <label className={styles.filterField}>
        <span className={styles.filterLabel}>
          {t("modals.audit.filters.subject")}
        </span>
        <CustomSelect
          id="audit-filter-subject"
          value={filters.subjectType}
          options={subjectOptions}
          onChange={(value) => onSelectChange("subjectType", value)}
          placeholder={t("modals.audit.filters.allSubjects")}
          aria-label={t("modals.audit.filters.subject")}
        />
      </label>
    </div>
  )
}
