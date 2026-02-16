import type { JSX } from "react"
import type { UserResponseData } from "@/types/api/users"

import { IoPerson } from "react-icons/io5"
import { RiErrorWarningLine } from "react-icons/ri"
import { UserActions } from "./UserActions"
import { FaCheck } from "react-icons/fa6"
import { AppTooltip } from "@/components/ui/AppTooltip"
import { FaUserSlash } from "react-icons/fa"
import { formatTimestamp } from "@/utils/utils"
import { useSessionStore } from "@/stores/useSessionStore"
import { useTranslation } from "react-i18next"

import styles from "./UserEntry.module.css"

type UserEntryProps = {
  user: UserResponseData
}

export function UserEntry({ user }: UserEntryProps): JSX.Element {
  const { t } = useTranslation()
  const self = useSessionStore((state) => state.user)
  const isSelf = user.id === self?.id

  return (
    <div className={styles.userRow}>
      <div className={styles.left}>
        <div className={styles.userIcon}>
          <IoPerson size={"1.3em"} color="rgb(30, 23, 36)" />
        </div>

        <div className={styles.userData}>
          <div className={styles.userName}>
            <span>{user.username}</span>

            {/* Suspended? */}
            {user.suspended && <FaUserSlash color="#eb5e5e" />}
            
            {/* User Verification Status */}
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

      <UserActions user={user} />
    </div>
  )
}
