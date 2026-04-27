import { useMemo, useRef, type JSX } from "react"

import "highlight.js/styles/github-dark.css"

import { ApiReferenceGatewayEventGroup } from "./components/ApiReferenceGatewayEventGroup"
import { ApiReferenceOnThisPage } from "./components/ApiReferenceOnThisPage"
import { ApiReferenceResourceSection } from "./components/ApiReferenceResourceSection"
import { ApiReferenceSidebar } from "./components/ApiReferenceSidebar"
import { ApiReferenceTopicSection } from "./components/ApiReferenceTopicSection"
import { apiTopics } from "./docs/apiReferenceDocs"
import { findApiReferenceDetail } from "./docs/apiReferenceLookup"
import { buildApiReferenceTocItems } from "./docs/apiReferenceToc"
import { useActiveApiReferenceSection } from "./hooks/useActiveApiReferenceSection"
import { useActiveApiReferenceToc } from "./hooks/useActiveApiReferenceToc"
import { useTranslation } from "react-i18next"

import styles from "./ApiReferencePage.module.css"

type ApiReferencePageProps = {
  detailId?: string
}

export function ApiReferencePage({
  detailId
}: ApiReferencePageProps): JSX.Element {
  const { t } = useTranslation()
  const { activeId } = useActiveApiReferenceSection()
  const detail = useMemo(
    () => (detailId ? findApiReferenceDetail(detailId) : undefined),
    [detailId]
  )
  const contentRef = useRef<HTMLDivElement | null>(null)
  const tocItems = useMemo(() => buildApiReferenceTocItems(detail), [detail])
  const activeTocId = useActiveApiReferenceToc(tocItems, contentRef)

  return (
    <>
      <title>{t("app.reference")}</title>

      <main className={styles.page}>
        <ApiReferenceSidebar
          activeId={detail?.id ?? activeId}
          detailId={detail?.id}
        />

        <div ref={contentRef} className={styles.content}>
          {!detail ? (
            <header className={styles.header}>
              <p className={styles.eyebrow}>
                {t("apiReference.header.eyebrow")}
              </p>
              <h1 className={styles.title}>{t("apiReference.header.title")}</h1>
              <span className={styles.description}>
                {t("apiReference.header.description")}
              </span>
            </header>
          ) : null}

          {detail?.type === "resource" ? (
            <ApiReferenceResourceSection resource={detail.resource} />
          ) : null}

          {detail?.type === "gateway-event-group" ? (
            <ApiReferenceGatewayEventGroup group={detail.group} />
          ) : null}

          {!detail ? (
            <section
              className={styles.referenceGroup}
              aria-label={t("apiReference.sections.reference")}
            >
              {apiTopics.map((topic) => (
                <ApiReferenceTopicSection key={topic.id} topic={topic} />
              ))}
            </section>
          ) : null}
        </div>

        <ApiReferenceOnThisPage
          activeId={activeTocId}
          detailId={detail?.id}
          items={tocItems}
        />
      </main>
    </>
  )
}
