import { useEffect, useMemo, useState, type JSX } from "react"
import type { UserResponseData } from "@/types/api/users"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import { Permission } from "@/models/Permission"
import { FaChevronRight } from "react-icons/fa"
import { BsCheck } from "react-icons/bs"
import { MdSecurity } from "react-icons/md"
import { Ripple } from "@/components/ui/effects/Ripple"
import { Button } from "@/components/ui/buttons/Button"
import { useSessionStore } from "@/stores/useSessionStore"
import { useTranslation } from "react-i18next"
import { userService } from "@/services/userService"
import { toasts } from "@/utils/toastUtils"

import styles from "./UserPermissionsSubMenu.module.css"

type UserPermissionsSubMenuProps = {
  user: UserResponseData
}

export function UserPermissionsSubMenu({
  user
}: UserPermissionsSubMenuProps): JSX.Element {
  const { t } = useTranslation()
  const self = useSessionStore((state) => state.user)

  const [savedPermissions, setSavedPermissions] = useState<number>(
    user.permissions
  )
  const [isLoading, setIsLoading] = useState(false)

  const showSaveFooter = !Permission.hasEffective(
    user.permissions,
    Permission.Administrator
  )
  const allPermissions = useMemo(() => [...Permission.all], [])

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

  const handleTogglePerm = (offset: number) => {
    setSelectedOffsets((prev) =>
      prev.includes(offset)
        ? prev.filter((o) => o !== offset)
        : [...prev, offset]
    )
  }

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
      toasts.apiError(t("errors.userUpdate"), resp)
    }
  }

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className={styles.item}>
        <div className={styles.labelContainer}>
          <span className={styles.optIcon}>
            <MdSecurity size={"1.3em"} />
          </span>
          <span className={styles.itemLabel} style={{ flex: 1 }}>
            {t("menus.users.perms.label")}
          </span>
          <FaChevronRight className={styles.chevron} />
        </div>
      </DropdownMenu.SubTrigger>

      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          className={styles.content}
          sideOffset={8}
          alignOffset={-5}
          style={{ zIndex: 100 }}
        >
          <div className={styles.scrollContainer}>
            {menuOptions.map((opt) => {
              const isChecked = selectedOffsets.includes(opt.id)

              return (
                <DropdownMenu.CheckboxItem
                  key={opt.id}
                  className={styles.item}
                  checked={isChecked}
                  disabled={opt.disabled}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={() => handleTogglePerm(opt.id)}
                >
                  <Ripple />
                  <div className={styles.labelContainer}>
                    <span className={styles.itemLabel}>{opt.label}</span>
                  </div>
                  <div className={styles.checkbox}>
                    <DropdownMenu.ItemIndicator className={styles.indicator}>
                      <BsCheck size={16} strokeWidth={1} />
                    </DropdownMenu.ItemIndicator>
                  </div>
                </DropdownMenu.CheckboxItem>
              )
            })}
          </div>

          {showSaveFooter && (
            <>
              <DropdownMenu.Separator className={styles.separator} />
              <div className={styles.footer}>
                <Button
                  className={styles.saveButton}
                  isLoading={isLoading}
                  disabled={isLoading || !isDirty}
                  onClick={handleSavePerms}
                  loaderProps={{ scale: 0.8 }}
                >
                  {t("menus.users.perms.saveButton")}
                </Button>
              </div>
            </>
          )}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  )
}

function getComputedOptions(
  targetMask: number,
  viewerMask: number,
  allPerms: Permission[],
  t: (key: string) => string
): { id: number; label: string; disabled: boolean }[] {
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

    if (p.raw === Permission.ManagePermissions.raw && !isViewerAdmin) {
      disabled = true
    }

    if (!isViewerManager && !isViewerAdmin) {
      disabled = true
    }

    return { id: p.offset, label: t(p.label), disabled }
  })
}
