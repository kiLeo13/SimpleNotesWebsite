import { useState, type JSX, type ReactNode } from "react"
import type { UserResponseData } from "@/types/api/users"

import * as Popover from "@radix-ui/react-popover"

import { UserEntry } from "./UserEntry"
import { LoaderContainer } from "@/components/LoaderContainer"
import { userService } from "@/services/userService"
import { useTranslation } from "react-i18next"
import { toasts } from "@/utils/toastUtils"

import styles from "./UserManagementPopover.module.css"

type UserManagementPopoverProps = {
  children: ReactNode
}

export function UserManagementPopover({
  children
}: UserManagementPopoverProps): JSX.Element {
  const { t } = useTranslation()
  const [users, setUsers] = useState<UserResponseData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenChange = async (isOpen: boolean) => {
    if (!isOpen) return

    setIsLoading(true)
    const resp = await userService.getUsers()
    setIsLoading(false)

    if (resp.success) {
      setUsers(resp.data.users)
    } else {
      toasts.apiError(t("errors.userFetch"), resp)
    }
  }

  return (
    <Popover.Root onOpenChange={handleOpenChange} modal>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.content}
          side="right"
          align="end"
          sideOffset={15}
          collisionPadding={10}
        >
          <div className={styles.header}>
            <h3 className={styles.title}>
              {t("modals.usersMng.title", { val: users.length })}
            </h3>
          </div>

          <div className={styles.division} />

          <div className={styles.userList}>
            {isLoading ? (
              <LoaderContainer
                className={styles.loader}
                loaderColor="#b79ed8"
              />
            ) : (
              [...users]
                .sort((u, au) => u.username.localeCompare(au.username))
                .map((u) => <UserEntry key={u.id} user={u} />)
            )}
          </div>

          <Popover.Arrow className={styles.arrow} fill="#1e1e24" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
