import { useEffect, useMemo, useState, type JSX } from "react"
import type { UserResponseData } from "@/types/api/users"
import { ActionMenu, type MenuActionItem } from "@/components/ui/ActionMenu"

import clsx from "clsx"

import { Permission } from "@/models/Permission"
import { SlOptions } from "react-icons/sl"
import { FiRotateCcw } from "react-icons/fi"
import { MdDeleteForever, MdPersonOff } from "react-icons/md"
import { DarkWrapper } from "@/components/DarkWrapper"
import { AppTooltip } from "@/components/ui/AppTooltip"
import {
  MultiSelectMenu,
  type MenuOption
} from "@/components/ui/MultiSelectMenu"
import { SuspendUserModal } from "./SuspendUserModal"
import { DeleteUserModal } from "./DeleteUserModal"
import { usePermission } from "@/hooks/usePermission"
import { useSessionStore } from "@/stores/useSessionStore"
import { useTranslation } from "react-i18next"
import { userService } from "@/services/userService"
import { toasts } from "@/utils/toastUtils"

import styles from "./UserActions.module.css"

type UserActionsProps = {
  user: UserResponseData
}

type ModalType = "NONE" | "SUSPEND" | "DELETE"

export function UserActions({ user }: UserActionsProps): JSX.Element {
  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState<ModalType>("NONE")
  const [savedPermissions, setSavedPermissions] = useState<number>(
    user.permissions
  )
  const [isLoading, setIsLoading] = useState(false)

  const showSaveFooter = !Permission.hasEffective(
    user.permissions,
    Permission.Administrator
  )
  const allPermissions = useMemo(() => [...Permission.all], [])
  const canManagePerms = usePermission(Permission.ManagePermissions)
  const canDeleteUsers = usePermission(Permission.DeleteUsers)
  const canPunishUsers = usePermission(Permission.PunishUsers)
  const self = useSessionStore((state) => state.user)
  const isSelf = user.id === self?.id
  const canModerateUser = (canDeleteUsers || canPunishUsers) && !Permission.hasEffective(user.permissions, Permission.Administrator)
  const moderateOptions = useMemo(() => {
    const opts: MenuActionItem[] = []

    if (canPunishUsers) {
      opts.push({
        label: user.suspended
          ? t("menus.users.unsuspendUser")
          : t("menus.users.suspendUser"),
        icon: user.suspended ? (
          <FiRotateCcw size={"1.3em"} color="#a285d1" />
        ) : (
          <MdPersonOff size={"1.3em"} color="#a285d1" />
        ),
        onClick: () => setActiveModal("SUSPEND")
      })
    }

    if (canDeleteUsers) {
      opts.push({
        label: t("menus.users.deleteUser"),
        icon: (
          <MdDeleteForever className={styles.dangerButtonIcon} size={"1.3em"} />
        ),
        className: styles.dangerButtonOption,
        onClick: () => setActiveModal("DELETE")
      })
    }
    return opts
  }, [canPunishUsers, canDeleteUsers, user.suspended, t])

  const handleSavePerms = async () => {
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

  const isDirty = useMemo(
    () => currentMask !== savedPermissions,
    [currentMask, savedPermissions]
  )

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

  const handleCloseModal = () => setActiveModal("NONE")

  return (
    <div className={styles.userActions}>
      <DarkWrapper open={activeModal !== "NONE"} zIndex={50}>
        {activeModal === "SUSPEND" && (
          <SuspendUserModal user={user} onClose={handleCloseModal} />
        )}
        {activeModal === "DELETE" && (
          <DeleteUserModal user={user} onClose={handleCloseModal} />
        )}
      </DarkWrapper>

      {canModerateUser && !isSelf && (
        <ActionMenu
          items={moderateOptions}
          style={{ zIndex: 50 }}
          side="left"
          align="center"
        >
          <AppTooltip label={t("menus.users.moderateUser")}>
            <button
              className={clsx(styles.actionButton, styles.moderateButton)}
            >
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
          onSave={handleSavePerms}
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
