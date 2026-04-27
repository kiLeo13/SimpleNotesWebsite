import type { NavCategory } from "./apiReferenceIds"

import { useTranslation } from "react-i18next"
import { apiResources, apiTopics } from "./apiReferenceDocs"
import { ApiReferenceNavGroup } from "./ApiReferenceNavGroup"
import { ApiReferenceNavLink } from "./ApiReferenceNavLink"
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
          alt={t("apiReference.sidebar.brandIconAlt")}
          draggable={false}
        />
        <strong className={styles.brandName}>
          {t("apiReference.sidebar.brand")}
        </strong>
      </div>

      <ApiReferenceNavGroup
        expanded={openCategories.reference}
        onToggle={() => onToggleCategory("reference")}
        title={t("apiReference.sections.reference")}
      >
        {apiTopics.map((topic) => (
          <ApiReferenceNavLink
            key={topic.id}
            active={activeId === topicSectionId(topic.id)}
            href={`#${topicSectionId(topic.id)}`}
            label={topic.title}
          />
        ))}
      </ApiReferenceNavGroup>

      <ApiReferenceNavGroup
        expanded={openCategories.resources}
        onToggle={() => onToggleCategory("resources")}
        title={t("apiReference.sidebar.resourcesGroup")}
      >
        {apiResources.map((resource) => (
          <div key={resource.id} className={styles.resourceNavBlock}>
            <ApiReferenceNavLink
              active={activeId === resourceSectionId(resource.id)}
              href={`#${resourceSectionId(resource.id)}`}
              label={resource.navLabel ?? resource.name}
            />
            {resource.routes.map((route) => (
              <ApiReferenceNavLink
                key={route.id}
                active={activeId === routeSectionId(resource.id, route.id)}
                href={`#${routeSectionId(resource.id, route.id)}`}
                label={route.title}
                nested
              />
            ))}
          </div>
        ))}
      </ApiReferenceNavGroup>
    </aside>
  )
}
