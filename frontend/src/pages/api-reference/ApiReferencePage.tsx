import type { JSX } from "react"

import "highlight.js/styles/github-dark.css"
import { useTranslation } from "react-i18next"

import { apiResources, apiTopics } from "./apiReferenceDocs"
import { ApiReferenceResourceSection } from "./ApiReferenceResourceSection"
import { ApiReferenceSidebar } from "./ApiReferenceSidebar"
import { ApiReferenceTopicSection } from "./ApiReferenceTopicSection"
import { useActiveApiReferenceSection } from "./useActiveApiReferenceSection"

import styles from "./ApiReferencePage.module.css"

export function ApiReferencePage(): JSX.Element {
  const { t } = useTranslation()
  const { activeId, openCategories, toggleCategory } =
    useActiveApiReferenceSection()

  return (
    <>
      <title>{t("app.reference")}</title>

      <main className={styles.page}>
        <ApiReferenceSidebar
          activeId={activeId}
          openCategories={openCategories}
          onToggleCategory={toggleCategory}
        />

        <div className={styles.content}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>
              {t("apiReference.header.eyebrow")}
            </p>
            <h1 className={styles.title}>{t("apiReference.header.title")}</h1>
            <span className={styles.description}>
              {t("apiReference.header.description")}
            </span>
          </header>

          <section
            className={styles.referenceGroup}
            aria-label={t("apiReference.sections.reference")}
          >
            {apiTopics.map((topic) => (
              <ApiReferenceTopicSection key={topic.id} topic={topic} />
            ))}
          </section>

          <section
            className={styles.resourceGroup}
            aria-labelledby="resources-heading"
          >
            <h2 id="resources-heading" className={styles.groupHeading}>
              {t("apiReference.sections.resources")}
            </h2>
            {apiResources.map((resource) => (
              <ApiReferenceResourceSection
                key={resource.id}
                resource={resource}
              />
            ))}
          </section>
        </div>
      </main>
    </>
  )
}
