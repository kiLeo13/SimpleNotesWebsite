import type { JSX } from "react"
import type { UserResponseData } from "../../types/api/users"

import { MdOutlineAutoFixHigh } from "react-icons/md"

import clsx from "clsx"

import styles from "./SidebarProfile.module.css"

type SidebarProfileProps = {
  selfUser: UserResponseData | null
}

export function SidebarProfile({ selfUser }: SidebarProfileProps): JSX.Element {
  return (
    <div className={styles.profile}>
      <div className={styles.avatarWrapper}>
        <img className={clsx(styles.avatar, styles.empty)} src="/favicon.png" />
        <div className={styles.editIcon}>
          <MdOutlineAutoFixHigh color="#ab87ffff" size={"1.3em"} />
        </div>
      </div>
      <span className={styles.username}>{selfUser?.username}</span>
    </div>
  )
}