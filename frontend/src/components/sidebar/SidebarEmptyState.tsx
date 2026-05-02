import type { JSX } from "react"

import { PiListMagnifyingGlass } from "react-icons/pi"
import { useTranslation } from "react-i18next"

import styles from "./SidebarEmptyState.module.css"

export function SidebarEmptyState(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={styles.noResultsContainer}>
      <PiListMagnifyingGlass size={"3em"} color="#61586b67" />
      <span className={styles.noResultsText}>
        {t("sidebar.notes.noResults")}
      </span>
    </div>
  )
}
