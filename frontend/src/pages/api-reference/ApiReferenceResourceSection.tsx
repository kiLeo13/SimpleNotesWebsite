import { useTranslation } from "react-i18next"

import type { ApiResource } from "./apiReferenceDocs"
import { ApiReferenceCallouts } from "./ApiReferenceCallout"
import { ApiReferenceFieldTable } from "./ApiReferenceFieldTable"
import { ApiReferenceRouteSection } from "./ApiReferenceRouteSection"
import { renderInline } from "./ApiReferenceInline"
import { resourceSectionId } from "./apiReferenceIds"

import styles from "./ApiReferenceResourceSection.module.css"

type ApiReferenceResourceSectionProps = {
  resource: ApiResource
}

export function ApiReferenceResourceSection({
  resource
}: ApiReferenceResourceSectionProps) {
  const { t } = useTranslation()

  return (
    <article
      id={resourceSectionId(resource.id)}
      className={styles.resourceSection}
    >
      <div className={styles.resourceHeader}>
        <h2 className={styles.resourceTitle}>{resource.name}</h2>
        <p className={styles.resourceDescription}>
          {renderInline(resource.description, {
            code: styles.inlineCode,
            link: styles.inlineLink
          })}
        </p>
      </div>

      <ApiReferenceCallouts callouts={resource.callouts} />

      <section className={styles.objectSection}>
        <h3 className={styles.objectTitle}>{resource.objectName}</h3>
        <ApiReferenceFieldTable
          fields={resource.fields}
          title={t("apiReference.tables.fieldsCaption", {
            title: resource.objectName
          })}
        />
      </section>

      {resource.routes.length > 0 ? (
        <section
          className={styles.routesBlock}
          aria-label={t("apiReference.sections.resourceRoutesAria", {
            resource: resource.name
          })}
        >
          <h3 className={styles.routesTitle}>
            {t("apiReference.sections.routes")}
          </h3>
          {resource.routes.map((route) => (
            <ApiReferenceRouteSection
              key={route.id}
              resourceId={resource.id}
              route={route}
            />
          ))}
        </section>
      ) : null}
    </article>
  )
}
