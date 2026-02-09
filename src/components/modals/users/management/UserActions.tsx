import { useEffect, useMemo, useState, type JSX } from "react"
import type { UserResponseData } from "@/types/api/users"
import { ActionMenu, type MenuActionItem } from "@/components/ui/ActionMenu"

import clsx from "clsx"

import { Permission } from "@/models/Permission"
import { SlOptions } from "react-icons/sl"
import { MdDeleteForever } from "react-icons/md"
import { MdPersonOff } from "react-icons/md"
import { AppTooltip } from "@/components/ui/AppTooltip"
import {
  MultiSelectMenu,
  type MenuOption
} from "@/components/ui/MultiSelectMenu"
import { usePermission } from "@/hooks/usePermission"
import { useSessionStore } from "@/stores/useSessionStore"
import { useTranslation } from "react-i18next"
import { userService } from "@/services/userService"
import { toasts } from "@/utils/toastUtils"

import styles from "./UserActions.module.css"

type UserActionsProps = {
  user: UserResponseData
}

export function UserActions({ user }: UserActionsProps): JSX.Element {
  const { t } = useTranslation()

  // State to track the "Database State" locally, so we can calculate isDirty
  // without waiting for a parent re-render.
  const [savedPermissions, setSavedPermissions] = useState<number>(
    user.permissions
  )
  const [isLoading, setIsLoading] = useState(false)
  const [, setIsDeleting] = useState(false)
  const [, setIsSuspending] = useState(false)

  const showSaveFooter = !Permission.hasEffective(
    user.permissions,
    Permission.Administrator
  )
  const allPermissions = useMemo(() => [...Permission.all], [])
  const canManagePerms = usePermission(Permission.ManagePermissions)
  const canDeleteUsers = usePermission(Permission.DeleteUsers)
  const canPunishUsers = usePermission(Permission.PunishUsers)
  const canModerateUser = canDeleteUsers || canPunishUsers
  const self = useSessionStore((state) => state.user)
  const isSelf = user.id === self?.id
  const moderateOptions = getModerateOptions(
    setIsSuspending,
    setIsDeleting,
    canPunishUsers,
    canDeleteUsers,
    t
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

  return (
    <div className={styles.userActions}>
      

      {canModerateUser && !isSelf && (
        <ActionMenu items={moderateOptions} style={{zIndex: 50}} side="left" align="center">
          <AppTooltip label={t("menus.users.moderateUser")}>
            <button className={clsx(styles.actionButton, styles.moderateButton)}>
              <SlOptions className={styles.actionIcon} size={"1.5em"} />
            </button>
          </AppTooltip>
        </ActionMenu>
      )}

      {canManagePerms && (
        <MultiSelectMenu
          label={t("menus.users.perms.label")}
          options={menuOptions}
          values={selectedOffsets}
          onChange={(newValues) => setSelectedOffsets(newValues as number[])}
          onSave={handleSave}
          isLoading={isLoading}
          showFooter={showSaveFooter}
        />
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

function getModerateOptions(
  setIsSuspending: (flag: boolean) => void,
  setIsDeleting: (flag: boolean) => void,
  canPunish: boolean,
  canDelete: boolean,
  t: (s: string) => string
): MenuActionItem[] {
  const opts = []
  if (canPunish) {
    opts.push({
      label: t("menus.users.suspendUser"),
      icon: <MdPersonOff size={"1.3em"} color="#a285d1" />,
      onClick: () => setIsSuspending(true)
    })
  }
  if (canDelete) {
    opts.push({
      label: t("menus.users.deleteUser"),
      icon: <MdDeleteForever className={styles.dangerButtonIcon} size={"1.3em"} />,
      className: styles.dangerButtonOption,
      onClick: () => setIsDeleting(true)
    })
  }
  return opts
}
