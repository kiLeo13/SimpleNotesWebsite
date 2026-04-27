import { useTranslation } from "react-i18next"
import { apiResources, apiTopics, gatewayEventGroups } from "../docs/apiReferenceDocs"
import { ApiReferenceNavGroup } from "./ApiReferenceNavGroup"
import { ApiReferenceNavLink } from "./ApiReferenceNavLink"
import { topicSectionId } from "../docs/apiReferenceIds"

import styles from "./ApiReferenceSidebar.module.css"

type ApiReferenceSidebarProps = {
  activeId: string
  detailId?: string
}

export function ApiReferenceSidebar({
  activeId,
  detailId
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

      <div className={styles.navScroller}>
        <ApiReferenceNavGroup title={t("apiReference.sections.reference")}>
          {apiTopics.map((topic) => (
            <ApiReferenceNavLink
              key={topic.id}
              active={!detailId && activeId === topicSectionId(topic.id)}
              href={`/api/reference#${topicSectionId(topic.id)}`}
              label={topic.title}
            />
          ))}
        </ApiReferenceNavGroup>

        <ApiReferenceNavGroup title={t("apiReference.sidebar.resourcesGroup")}>
          {apiResources.map((resource) => (
            <ApiReferenceNavLink
              key={resource.id}
              active={detailId === resource.id}
              href={`/api/reference/${resource.id}`}
              label={resource.navLabel ?? resource.name}
            />
          ))}
        </ApiReferenceNavGroup>

        <ApiReferenceNavGroup title={t("apiReference.sections.gatewayEvents")}>
          {gatewayEventGroups.map((group) => (
            <ApiReferenceNavLink
              key={group.id}
              active={detailId === group.id}
              href={`/api/reference/${group.id}`}
              label={group.navLabel}
            />
          ))}
        </ApiReferenceNavGroup>
      </div>
    </aside>
  )
}
