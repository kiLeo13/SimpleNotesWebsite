import type { JSX } from "react"
import type { DepartmentData } from "@/types/api/departments"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import { MdDelete, MdDriveFileMove } from "react-icons/md"
import { FaChevronRight } from "react-icons/fa"
import { SlOptions } from "react-icons/sl"
import { useTranslation } from "react-i18next"

import styles from "./DepartmentActionsMenu.module.css"

export type BulkMoveTarget = {
  id: string | null
  name: string
}

type DepartmentActionsMenuProps = {
  department: DepartmentData
  moveTargets: BulkMoveTarget[]
  onBulkMove: (
    department: DepartmentData,
    targetId: string | null,
    targetName: string
  ) => void
  onBulkDelete: (department: DepartmentData) => void
}

export function DepartmentActionsMenu({
  department,
  moveTargets,
  onBulkMove,
  onBulkDelete
}: DepartmentActionsMenuProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={styles.trigger}
          onClick={(event) => event.stopPropagation()}
          aria-label={t("departments.management.options")}
        >
          <SlOptions size={12} color="#9a83b4ff" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={styles.content}
          side="right"
          align="start"
          sideOffset={4}
        >
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className={styles.item}>
              <MdDriveFileMove size={15} className={styles.itemIcon} />
              <span className={styles.itemLabel}>
                {t("departments.actions.bulkMove")}
              </span>
              <FaChevronRight size={10} className={styles.chevron} />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent className={styles.content} sideOffset={4}>
                {moveTargets.map((target) => (
                  <DropdownMenu.Item
                    key={target.id ?? "__general__"}
                    className={styles.item}
                    onSelect={() => onBulkMove(department, target.id, target.name)}
                  >
                    <span className={styles.itemLabel}>{target.name}</span>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          <DropdownMenu.Item
            className={styles.dangerItem}
            onSelect={() => onBulkDelete(department)}
          >
            <MdDelete size={15} className={styles.itemIcon} />
            <span className={styles.itemLabel}>{t("departments.actions.bulkDelete")}</span>
            <FaChevronRight size={10} className={styles.chevron} style={{ visibility: "hidden" }} />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
