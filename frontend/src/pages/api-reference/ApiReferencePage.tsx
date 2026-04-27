import type { JSX } from "react"

import "highlight.js/styles/github-dark.css"
import { useTranslation } from "react-i18next"

import { apiResources, apiTopics } from "./apiReferenceDocs"
import { ApiReferenceSidebar } from "./ApiReferenceSidebar"
import { ResourceSection, TopicSection } from "./ApiReferenceSections"
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
            <p>{t("apiReference.header.eyebrow")}</p>
            <h1>{t("apiReference.header.title")}</h1>
            <span>{t("apiReference.header.description")}</span>
          </header>

          <section
            className={styles.referenceGroup}
            aria-labelledby="reference-heading"
          >
            {apiTopics.map((topic) => (
              <TopicSection key={topic.id} topic={topic} />
            ))}
          </section>

          <section
            className={styles.resourceGroup}
            aria-labelledby="resources-heading"
          >
            <h2 id="resources-heading">
              {t("apiReference.sections.resources")}
            </h2>
            {apiResources.map((resource) => (
              <ResourceSection key={resource.id} resource={resource} />
            ))}
          </section>
        </div>
      </main>
    </>
  )
}
