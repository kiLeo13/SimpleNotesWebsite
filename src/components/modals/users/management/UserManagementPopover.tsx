import { useState, type ChangeEvent, type JSX, type ReactNode } from "react"
import type { UserResponseData } from "@/types/api/users"

import * as Popover from "@radix-ui/react-popover"

import { UserEntry } from "./UserEntry"
import { IoSearchSharp } from "react-icons/io5"
import { Permission } from "@/models/Permission"
import { LoaderContainer } from "@/components/LoaderContainer"
import { userService } from "@/services/userService"
import { useTranslation } from "react-i18next"
import { matchSorter } from "match-sorter"
import { toasts } from "@/utils/toastUtils"

import styles from "./UserManagementPopover.module.css"

type UserManagementPopoverProps = {
  children: ReactNode
}

export function UserManagementPopover({
  children
}: UserManagementPopoverProps): JSX.Element {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<UserResponseData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const filteredUsers = toFilteredUsers(users, search)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

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
            <div className={styles.searchContainer}>
              <IoSearchSharp className={styles.searchIcon} size={"1.4em"} />
              <input
                className={styles.searchInput}
                value={search}
                onChange={handleSearchChange}
                type="text"
                name="user-search"
                placeholder={t("placeholders.search")}
                autoComplete="off"
              />
            </div>
          </div>

          <div className={styles.division} />

          <div className={styles.userList}>
            {isLoading ? (
              <LoaderContainer
                className={styles.loader}
                loaderColor="#b79ed8"
              />
            ) : (
              sortUsers(filteredUsers).map((u) => (
                <UserEntry key={u.id} user={u} />
              ))
            )}
          </div>

          <Popover.Arrow className={styles.arrow} fill="#1e1e24" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function sortUsers(users: UserResponseData[]): UserResponseData[] {
  return users.sort((u, au) => {
    const uIsAdmin = Permission.hasEffective(
      u.permissions,
      Permission.Administrator
    )
    const auIsAdmin = Permission.hasEffective(
      au.permissions,
      Permission.Administrator
    )

    if (uIsAdmin && !auIsAdmin) return -1
    if (!uIsAdmin && auIsAdmin) return 1

    return u.username.localeCompare(au.username)
  })
}

function toFilteredUsers(users: UserResponseData[], search: string) {
  if (!search.trim()) return users

  return matchSorter(users, search, { keys: ["username"] })
}
