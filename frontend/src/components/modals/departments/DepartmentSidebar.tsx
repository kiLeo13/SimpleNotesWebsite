import type { JSX } from "react"
import type { DepartmentData } from "@/types/api/departments"
import {
  DepartmentActionsMenu,
  type BulkMoveTarget
} from "./DepartmentActionsMenu"

import { FiPlus } from "react-icons/fi"
import { DepartmentIcon } from "@/components/departments/DepartmentIcon"
import { useTranslation } from "react-i18next"

import styles from "./DepartmentSidebar.module.css"

type DepartmentSidebarProps = {
  departments: DepartmentData[]
  selectedDepartmentId: string | null
  getMoveTargets: (department: DepartmentData) => BulkMoveTarget[]
  onCreateClick: () => void
  onSelectDepartment: (departmentId: string) => void
  onBulkMove: (
    department: DepartmentData,
    targetId: string | null,
    targetName: string
  ) => void
  onBulkDelete: (department: DepartmentData) => void
}

export function DepartmentSidebar({
  departments,
  selectedDepartmentId,
  getMoveTargets,
  onCreateClick,
  onSelectDepartment,
  onBulkMove,
  onBulkDelete
}: DepartmentSidebarProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>
          {t("departments.management.listTitle", { count: departments.length })}
        </span>
        <button
          type="button"
          className={styles.addButton}
          onClick={onCreateClick}
          aria-label={t("departments.management.create")}
        >
          <FiPlus size={16} />
        </button>
      </div>

      <div className={styles.list}>
        {departments.map((department) => {
          const hasNotes = department.note_count > 0

          return (
            <div
              key={department.id}
              className={styles.row}
              data-active={department.id === selectedDepartmentId}
            >
              <button
                type="button"
                className={styles.departmentButton}
                onClick={() => onSelectDepartment(department.id)}
              >
                <DepartmentIcon department={department} className={styles.icon} />
                <span className={styles.name}>{department.name}</span>
              </button>

              {hasNotes && (
                <DepartmentActionsMenu
                  department={department}
                  moveTargets={getMoveTargets(department)}
                  onBulkMove={onBulkMove}
                  onBulkDelete={onBulkDelete}
                />
              )}
            </div>
          )
        })}

        {departments.length === 0 && (
          <span className={styles.empty}>{t("departments.management.empty")}</span>
        )}
      </div>
    </aside>
  )
}
