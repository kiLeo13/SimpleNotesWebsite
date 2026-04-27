import type { ReactNode } from "react"
import type { NavCategory } from "./apiReferenceIds"

import clsx from "clsx"

import { FiChevronDown } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import { apiResources, apiTopics } from "./apiReferenceDocs"
import {
  resourceSectionId,
  routeSectionId,
  topicSectionId
} from "./apiReferenceIds"

import styles from "./ApiReferenceSidebar.module.css"

type ApiReferenceSidebarProps = {
  activeId: string
  openCategories: Record<NavCategory, boolean>
  onToggleCategory: (category: NavCategory) => void
}

export function ApiReferenceSidebar({
  activeId,
  openCategories,
  onToggleCategory
}: ApiReferenceSidebarProps) {
  const { t } = useTranslation()

  return (
    <aside
      className={styles.sidebar}
      aria-label={t("apiReference.sidebar.ariaLabel")}
    >
      <div className={styles.brand}>
        <img
          className={styles.brandIcon}
          src="/favicon.png"
          alt="ZenKeep Icon"
          draggable={false}
        />
        <strong>{t("apiReference.sidebar.brand")}</strong>
      </div>

      <NavGroup
        expanded={openCategories.reference}
        onToggle={() => onToggleCategory("reference")}
        title={t("apiReference.sections.reference")}
      >
        {apiTopics.map((topic) => (
          <NavLink
            key={topic.id}
            active={activeId === topicSectionId(topic.id)}
            href={`#${topicSectionId(topic.id)}`}
            label={topic.title}
          />
        ))}
      </NavGroup>

      <NavGroup
        expanded={openCategories.resources}
        onToggle={() => onToggleCategory("resources")}
        title={t("apiReference.sidebar.resourcesGroup")}
      >
        {apiResources.map((resource) => (
          <div key={resource.id} className={styles.resourceNavBlock}>
            <NavLink
              active={activeId === resourceSectionId(resource.id)}
              href={`#${resourceSectionId(resource.id)}`}
              label={resource.navLabel ?? resource.name}
            />
            {resource.routes.map((route) => (
              <NavLink
                key={route.id}
                active={activeId === routeSectionId(resource.id, route.id)}
                href={`#${routeSectionId(resource.id, route.id)}`}
                label={route.title}
                nested
              />
            ))}
          </div>
        ))}
      </NavGroup>
    </aside>
  )
}

function NavGroup({
  children,
  expanded,
  onToggle,
  title
}: {
  children: ReactNode
  expanded: boolean
  onToggle: () => void
  title: string
}) {
  return (
    <nav className={styles.navGroup} aria-label={title}>
      <button
        type="button"
        className={styles.navGroupButton}
        onClick={onToggle}
      >
        <span>{title}</span>
        <FiChevronDown className={styles.chevron} data-expanded={expanded} />
      </button>
      {expanded && <div>{children}</div>}
    </nav>
  )
}

function NavLink({
  active,
  href,
  label,
  nested = false
}: {
  active: boolean
  href: string
  label: string
  nested?: boolean
}) {
  return (
    <a
      className={clsx(
        nested ? styles.nestedNavItem : styles.navItem,
        active && styles.activeNavItem
      )}
      href={href}
    >
      {label}
    </a>
  )
}
