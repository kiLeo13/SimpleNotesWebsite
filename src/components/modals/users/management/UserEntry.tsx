import type { UserResponseData } from "@/types/api/users"
import { useState, useMemo, type JSX } from "react"
import { MultiSelectMenu, type MenuOption } from "@/components/ui/MultiSelectMenu"

import { IoPerson } from "react-icons/io5"
import { RiErrorWarningLine } from "react-icons/ri"
import { FaCheck } from "react-icons/fa6"
import { AppTooltip } from "@/components/ui/AppTooltip"
import { formatTimestamp } from "@/utils/utils"
import { useTranslation } from "react-i18next"
import { useSessionStore } from "@/stores/useSessionStore"
import { Permission } from "@/models/Permission"

import styles from "./UserEntry.module.css"

type UserEntryProps = {
  user: UserResponseData
}

export function UserEntry({ user }: UserEntryProps): JSX.Element {
  const { t } = useTranslation()
  const self = useSessionStore((state) => state.user)
  const isSelf = user.id === self?.id

  const allPermissions = useMemo(() => [...Permission.all], [])

  const [selectedOffsets, setSelectedOffsets] = useState<number[]>(() =>
    allPermissions.filter((p) => Permission.hasRaw(user.permissions, p)).map((p) => p.offset)
  )

  const menuOptions = useMemo(
    () => getComputedOptions(selectedOffsets, self?.permissions || 0, allPermissions, t),
    [selectedOffsets, self?.permissions, allPermissions, t]
  )

  const handleSave = async () => {
    const newMask = selectedOffsets.reduce((acc, offset) => acc | (1 << offset), 0)

    console.log(`Saving new mask for ${user.username}: ${newMask}`)
  }

  return (
    <div className={styles.userRow}>
      <div className={styles.left}>
        <div className={styles.userIcon}>
          <IoPerson size={"1.3em"} color="rgb(30, 23, 36)" />
        </div>

        <div className={styles.userData}>
          <div className={styles.userName}>
            <span>{user.username}</span>
            <AppTooltip label={user.isVerified ? t("labels.verified") : t("labels.unverified")}>
              {user.isVerified ? (
                <FaCheck size={"0.7em"} color="#72c272" cursor="pointer" />
              ) : (
                <RiErrorWarningLine size={"0.9em"} color="#c2af72" cursor="pointer" />
              )}
            </AppTooltip>
            {isSelf && <span className={styles.you}>{t("labels.you")}</span>}
          </div>
          <span className={styles.timestamp}>{formatTimestamp(user.createdAt)}</span>
        </div>
      </div>

      <div className={styles.right}>
        <MultiSelectMenu
          label={t("menus.users.perms.label")}
          options={menuOptions}
          values={selectedOffsets}
          onChange={(newValues) => setSelectedOffsets(newValues as number[])}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}

/**
 * Calculates option availability.
 * RULE: 'Administrator' is strictly developer-controlled (Database only).
 * It will appear checked if the user has it, but will always be disabled.
 */
function getComputedOptions(
  currentOffsets: number[],
  viewerMask: number,
  allPerms: Permission[],
  t: (key: string) => string
): MenuOption[] {
  const isAdminSelected = currentOffsets.includes(Permission.Administrator.offset)
  const isViewerAdmin = Permission.hasRaw(viewerMask, Permission.Administrator)

  return allPerms.map((p) => {
    const isTargetAdminOption = p.raw === Permission.Administrator.raw
    let disabled = false

    // RULE 1: STRICT - "Administrator" is always read-only in UI
    if (isTargetAdminOption) {
      disabled = true
    }

    // RULE 2: If the target User has "Administrator" checked, all other options
    // are irrelevant (Admin implies all permissions), so disable them to prevent confusion.
    if (isAdminSelected && !isTargetAdminOption) {
      disabled = true
    }

    // RULE 3: Non-admins cannot touch "Manage Permissions"
    // (This prevents a standard moderator from elevating themselves)
    if (!isViewerAdmin && p.raw === Permission.ManagePermissions.raw) {
      disabled = true
    }

    return {
      id: p.offset,
      label: t(p.label),
      disabled
    }
  })
}
