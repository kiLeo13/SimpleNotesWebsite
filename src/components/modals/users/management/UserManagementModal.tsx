import type { UserResponseData } from "@/types/api/users"
import { useEffect, useState, type JSX } from "react"

import { IoMdClose } from "react-icons/io"
import { UserEntry } from "./UserEntry"
import { LoaderContainer } from "@/components/LoaderContainer"
import { userService } from "@/services/userService"
import { toasts } from "@/utils/toastUtils"
import { useTranslation } from "react-i18next"

import styles from "./UserManagementModal.module.css"

type UserManagementModalProps = {
  setShowUsersMng: (flag: boolean) => void
}

export function UserManagementModal({ setShowUsersMng }: UserManagementModalProps): JSX.Element {
  const { t } = useTranslation()
  const [users, setUsers] = useState<UserResponseData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleCloseModal = () => setShowUsersMng(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      const resp = await userService.getUsers()
      setIsLoading(false)

      if (resp.success) {
        setUsers(resp.data.users)
      } else {
        toasts.apiError("Erro ao buscar usuários", resp)
      }
    }
    fetchUsers()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.close} onClick={handleCloseModal}>
        <IoMdClose color="rgba(94, 76, 121, 1)" size={"24px"} />
      </div>

      {isLoading && <LoaderContainer className={styles.loader} loaderColor="#b79ed8" />}

      <h2 className={styles.title}>{t("modals.usersMng.title", { val: users.length })}</h2>

      <div className={styles.division} />

      <div className={styles.userList}>
        {[...users]
          .sort((u, au) => u.username.localeCompare(au.username))
          .map((u) => (
            <UserEntry key={u.id} user={u} />
          ))}
      </div>
    </div>
  )
}
