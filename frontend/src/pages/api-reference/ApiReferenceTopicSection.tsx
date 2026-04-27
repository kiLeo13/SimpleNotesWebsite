import { AppTooltip } from "@/components/ui/AppTooltip"
import { FiLink } from "react-icons/fi"
import { useTranslation } from "react-i18next"

import type { ApiTopic } from "./apiReferenceDocs"
import { ApiReferenceCallouts } from "./ApiReferenceCallout"
import { ApiReferenceCodeBlock } from "./ApiReferenceCodeBlock"
import { ApiReferenceFieldTable } from "./ApiReferenceFieldTable"
import { renderInline } from "./ApiReferenceInline"
import { topicSectionId } from "./apiReferenceIds"

import styles from "./ApiReferenceTopicSection.module.css"

type ApiReferenceTopicSectionProps = {
  topic: ApiTopic
}

export function ApiReferenceTopicSection({
  topic
}: ApiReferenceTopicSectionProps) {
  const { t } = useTranslation()
  const sectionId = topicSectionId(topic.id)

  return (
    <article id={sectionId} className={styles.docSection}>
      <div className={styles.titleHead}>
        <h3 className={styles.title}>{topic.title}</h3>
        <a className={styles.linkSection} href={`#${sectionId}`}>
          <AppTooltip label={t("tooltips.labels.anchorSection")}>
            <FiLink className={styles.linkIcon} />
          </AppTooltip>
        </a>
      </div>

      {topic.description ? (
        <p className={styles.description}>
          {renderInline(topic.description, {
            code: styles.inlineCode,
            link: styles.inlineLink
          })}
        </p>
      ) : null}

      <ApiReferenceCallouts callouts={topic.callouts} />

      {topic.fields ? (
        <ApiReferenceFieldTable
          fields={topic.fields}
          title={t("apiReference.tables.fieldsCaption", {
            title: topic.title
          })}
        />
      ) : null}

      {topic.examples?.map((example, index) => (
        <ApiReferenceCodeBlock key={`${topic.id}-${index}`} example={example} />
      ))}
    </article>
  )
}
