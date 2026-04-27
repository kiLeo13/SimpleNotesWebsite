import { useTranslation } from "react-i18next"

import type { GatewayEvent } from "../docs/apiReferenceDocs"
import { ApiReferenceCallouts } from "./ApiReferenceCallout"
import { ApiReferenceFieldTable } from "./ApiReferenceFieldTable"
import { renderInline } from "./ApiReferenceInline"
import { gatewayEventSectionId } from "../docs/apiReferenceIds"

import styles from "./ApiReferenceGatewayEventCard.module.css"

type ApiReferenceGatewayEventCardProps = {
  event: GatewayEvent
}

export function ApiReferenceGatewayEventCard({
  event
}: ApiReferenceGatewayEventCardProps) {
  const { t } = useTranslation()

  return (
    <article
      id={gatewayEventSectionId(event.id)}
      className={styles.eventCard}
    >
      <div className={styles.eventHeader}>
        <code className={styles.eventType}>{event.type}</code>
      </div>

      <p className={styles.eventDescription}>
        {renderInline(event.description, {
          code: styles.inlineCode,
          link: styles.inlineLink
        })}
      </p>

      <ApiReferenceCallouts callouts={event.callouts} />

      {event.dataFields.length > 0 ? (
        <ApiReferenceFieldTable
          title={t("apiReference.tables.payloadCaption", {
            title: event.type
          })}
          fields={event.dataFields}
        />
      ) : null}

      {event.returns ? (
        <div className={styles.eventReturns}>
          <span className={styles.returnsLabel}>
            {t("apiReference.gateway.dataReturns")}
          </span>
          <span className={styles.returnsValue}>
            {renderInline(event.returns, {
              code: styles.inlineCode,
              link: styles.inlineLink
            })}
          </span>
        </div>
      ) : null}
    </article>
  )
}
