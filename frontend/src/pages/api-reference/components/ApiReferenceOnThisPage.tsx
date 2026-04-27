import type { ApiReferenceTocItem } from "../docs/apiReferenceToc"

import clsx from "clsx"

import { Link } from "@tanstack/react-router"
import { FiList } from "react-icons/fi"
import { useTranslation } from "react-i18next"

import styles from "./ApiReferenceOnThisPage.module.css"

type ApiReferenceOnThisPageProps = {
  activeId: string
  detailId?: string
  items: ApiReferenceTocItem[]
}

export function ApiReferenceOnThisPage({
  activeId,
  detailId,
  items
}: ApiReferenceOnThisPageProps) {
  const { t } = useTranslation()

  if (items.length === 0) return null

  return (
    <aside className={styles.toc} aria-label={t("apiReference.toc.ariaLabel")}>
      <div className={styles.tocInner}>
        <div className={styles.tocTitle}>
          <FiList className={styles.tocIcon} aria-hidden="true" />
          <span>{t("apiReference.toc.title")}</span>
        </div>

        <nav className={styles.tocNav}>
          {items.map((item) => (
            <Link
              key={item.id}
              className={clsx(
                styles.tocLink,
                activeId === item.id && styles.activeTocLink
              )}
              to={detailId ? "/api/reference/$resourceId" : "/api/reference"}
              params={detailId ? { resourceId: detailId } : undefined}
              hash={item.id}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
