import type { JSX } from "react"
import type { UserResponseData } from "@/types/api/users"

import { FiUserPlus, FiX } from "react-icons/fi"
import { IoPerson } from "react-icons/io5"
import { AppTooltip } from "@/components/ui/AppTooltip"
import { CustomSelect } from "@/components/vanilla/inputs/CustomSelect"
import { useTranslation } from "react-i18next"

import styles from "./DepartmentMembersPanel.module.css"

type DepartmentMembersPanelProps = {
  members: UserResponseData[]
  nonMembers: UserResponseData[]
  addMenuOpen: boolean
  onAddMenuOpenChange: (open: boolean) => void
  onAddMember: (user: UserResponseData) => void
  onRemoveMember: (user: UserResponseData) => void
}

export function DepartmentMembersPanel({
  members,
  nonMembers,
  addMenuOpen,
  onAddMenuOpenChange,
  onAddMember,
  onRemoveMember
}: DepartmentMembersPanelProps): JSX.Element {
  const { t } = useTranslation()

  const nonMemberOptions = nonMembers.map((user) => ({
    value: user.id,
    label: user.username
  }))

  const handleSelect = (userId: string) => {
    const user = nonMembers.find((u) => u.id === userId)
    if (user) {
      onAddMember(user)
    }
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>
          {t("departments.management.members")}
          <span className={styles.count}>{members.length}</span>
        </span>

        <CustomSelect
          options={nonMemberOptions}
          value=""
          onChange={handleSelect}
          hasSearch
          open={addMenuOpen}
          onOpenChange={onAddMenuOpenChange}
          align="end"
          side="bottom"
          sideOffset={4}
          contentClassName={styles.menuContent}
          emptyMessage={t("departments.management.allUsersAdded")}
          customTrigger={
            <button
              type="button"
              className={styles.addButton}
              aria-label={t("departments.management.addMember")}
            >
              <FiUserPlus size={14} />
            </button>
          }
        />
      </div>

      <div className={styles.list}>
        {members.map((user) => (
          <div key={user.id} className={styles.row}>
            <IoPerson size={13} className={styles.userIcon} />
            <span className={styles.name}>{user.username}</span>
            <AppTooltip side="right" label={t("departments.management.removeMember")}>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => onRemoveMember(user)}
                aria-label={t("departments.management.removeMember")}
              >
                <FiX size={13} />
              </button>
            </AppTooltip>
          </div>
        ))}

        {members.length === 0 && (
          <span className={styles.empty}>{t("departments.management.noMembers")}</span>
        )}
      </div>
    </aside>
  )
}

