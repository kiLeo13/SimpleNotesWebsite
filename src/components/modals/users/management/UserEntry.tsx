import type { UserResponseData } from "@/types/api/users"
import { useState, useMemo, type JSX, useEffect } from "react"
import {
  MultiSelectMenu,
  type MenuOption
} from "@/components/ui/MultiSelectMenu"

import { IoPerson } from "react-icons/io5"
import { RiErrorWarningLine } from "react-icons/ri"
import { FaCheck } from "react-icons/fa6"
import { AppTooltip } from "@/components/ui/AppTooltip"
import { Permission } from "@/models/Permission"
import { formatTimestamp } from "@/utils/utils"
import { useTranslation } from "react-i18next"
import { useSessionStore } from "@/stores/useSessionStore"
import { usePermission } from "@/hooks/usePermission"
import { userService } from "@/services/userService"
import { toasts } from "@/utils/toastUtils"

import styles from "./UserEntry.module.css"

type UserEntryProps = {
  user: UserResponseData
}

export function UserEntry({ user }: UserEntryProps): JSX.Element {
  const { t } = useTranslation()
  const self = useSessionStore((state) => state.user)
  const isSelf = user.id === self?.id
  const canManagePerms = usePermission(Permission.ManagePermissions)
  const allPermissions = useMemo(() => [...Permission.all], [])
  const [isLoading, setIsLoading] = useState(false)

  // State to track the "Database State" locally, so we can calculate isDirty
  // without waiting for a parent re-render.
  const [savedPermissions, setSavedPermissions] = useState<number>(
    user.permissions
  )
  const [selectedOffsets, setSelectedOffsets] = useState<number[]>(() =>
    allPermissions
      .filter((p) => Permission.hasRaw(user.permissions, p))
      .map((p) => p.offset)
  )

  const currentMask = useMemo(() => {
    return selectedOffsets.reduce((acc, offset) => acc | (1 << offset), 0)
  }, [selectedOffsets])

  const isDirty = useMemo(() => {
    return currentMask !== savedPermissions
  }, [currentMask, savedPermissions])

  useEffect(() => {
    setSavedPermissions(user.permissions)
  }, [user.permissions])

  const menuOptions = useMemo(
    () =>
      getComputedOptions(
        savedPermissions,
        self?.permissions || 0,
        allPermissions,
        t
      ),
    [savedPermissions, self?.permissions, allPermissions, t]
  )

  const handleSave = async () => {
    if (!isDirty) return

    setIsLoading(true)
    const resp = await userService.updateUser(user.id, {
      permissions: currentMask
    })
    setIsLoading(false)

    if (resp.success) {
      setSavedPermissions(currentMask)
      user.permissions = currentMask
    } else {
      toasts.apiError(t("toasts.userUpdateFailed"), resp)
    }
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
            <AppTooltip
              label={
                user.isVerified ? t("labels.verified") : t("labels.unverified")
              }
            >
              {user.isVerified ? (
                <FaCheck size={"0.7em"} color="#72c272" cursor="pointer" />
              ) : (
                <RiErrorWarningLine
                  size={"0.9em"}
                  color="#c2af72"
                  cursor="pointer"
                />
              )}
            </AppTooltip>
            {isSelf && <span className={styles.you}>{t("labels.you")}</span>}
          </div>
          <span className={styles.timestamp}>
            {formatTimestamp(user.createdAt)}
          </span>
        </div>
      </div>

      {canManagePerms && (
        <div className={styles.right}>
          <MultiSelectMenu
            label={t("menus.users.perms.label")}
            options={menuOptions}
            values={selectedOffsets}
            onChange={(newValues) => setSelectedOffsets(newValues as number[])}
            onSave={handleSave}
            isLoading={isLoading}
            showFooter={
              !Permission.hasEffective(
                user.permissions,
                Permission.Administrator
              )
            }
          />
        </div>
      )}
    </div>
  )
}

function getComputedOptions(
  targetMask: number,
  viewerMask: number,
  allPerms: Permission[],
  t: (key: string) => string
): MenuOption[] {
  const isTargetAdmin = Permission.hasRaw(targetMask, Permission.Administrator)
  const isViewerAdmin = Permission.hasRaw(viewerMask, Permission.Administrator)
  const isViewerManager = Permission.hasEffective(
    viewerMask,
    Permission.ManagePermissions
  )

  return allPerms.map((p) => {
    let disabled = false

    if (p.raw === Permission.Administrator.raw) {
      disabled = true
    }

    if (isTargetAdmin && p.raw !== Permission.Administrator.raw) {
      disabled = true
    }

    if (p.raw === Permission.ManagePermissions.raw) {
      if (!isViewerAdmin) {
        disabled = true
      }
    }

    if (!isViewerManager && !isViewerAdmin) {
      disabled = true
    }

    return {
      id: p.offset,
      label: t(p.label),
      disabled
    }
  })
}
