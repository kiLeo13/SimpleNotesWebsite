import type { JSX } from "react"

import { MdOutlineAutoFixHigh } from "react-icons/md"

import clsx from "clsx"

import styles from "./SidebarProfile.module.css"

export function SidebarProfile(): JSX.Element {
  return (
    <div className={styles.profile}>
      <div className={styles.avatarWrapper}>
        <img className={clsx(styles.avatar, styles.empty)} src="/favicon.png" />
        <div className={styles.editIcon}>
          <MdOutlineAutoFixHigh color="#ab87ffff" size={"1.3em"} />
        </div>
      </div>
    </div>
  )
}