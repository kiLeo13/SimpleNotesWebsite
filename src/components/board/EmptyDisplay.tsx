import type { JSX } from "react"

import { GiGearStickPattern } from "react-icons/gi"

import styles from "./EmptyDisplay.module.css"

export function EmptyDisplay(): JSX.Element {
  return (
    <div className={styles.emptyBox}>
      {/* <span>:/</span> */}
      <GiGearStickPattern size={"40px"} color="rgba(141, 87, 192, 0.19)" />
    </div>
  )
}