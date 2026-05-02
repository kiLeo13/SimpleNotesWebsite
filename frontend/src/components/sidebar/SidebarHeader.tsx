import type {
  ChangeEventHandler,
  JSX,
  KeyboardEventHandler,
  RefObject
} from "react"

import { useTranslation } from "react-i18next"

import styles from "./SidebarHeader.module.css"

type SidebarHeaderProps = {
  disabled: boolean
  resultCount: number
  search: string
  searchRef: RefObject<HTMLInputElement | null>
  onSearch: ChangeEventHandler<HTMLInputElement>
  onSearchKeyDown: KeyboardEventHandler<HTMLInputElement>
}

export function SidebarHeader({
  disabled,
  resultCount,
  search,
  searchRef,
  onSearch,
  onSearchKeyDown
}: SidebarHeaderProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={styles.menuUpperControls}>
      <input
        className={styles.searchInput}
        disabled={disabled}
        type="text"
        name="noteSearch"
        placeholder={t("sidebar.notes.search")}
        autoComplete="off"
        ref={searchRef}
        onKeyDown={onSearchKeyDown}
        onChange={onSearch}
        value={search}
      />
      <div className={styles.menuDivider} />
      <span className={styles.noteListHeader}>
        <span className={styles.noteListTitle}>
          {t("sidebar.notes.title")}
        </span>
        <span className={styles.noteListCount}>
          {resultCount === 1
            ? t("sidebar.notes.oneFound")
            : t("sidebar.notes.manyFound", { val: resultCount })}
        </span>
      </span>
    </div>
  )
}
