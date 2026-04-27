import type { GatewayEventGroup } from "../docs/apiReferenceDocs"

import { ApiReferenceGatewayEventCard } from "./ApiReferenceGatewayEventCard"
import { renderInline } from "./ApiReferenceInline"

import styles from "./ApiReferenceGatewayEventGroup.module.css"

type ApiReferenceGatewayEventGroupProps = {
  group: GatewayEventGroup
}

export function ApiReferenceGatewayEventGroup({
  group
}: ApiReferenceGatewayEventGroupProps) {
  return (
    <section className={styles.gatewayGroup} aria-labelledby={group.id}>
      <header className={styles.groupHeader}>
        <h2 id={group.id} className={styles.groupTitle}>
          {group.title}
        </h2>
        <p className={styles.groupDescription}>
          {renderInline(group.description, {
            code: styles.inlineCode,
            link: styles.inlineLink
          })}
        </p>
      </header>

      <div className={styles.eventList}>
        {group.events.map((event) => (
          <ApiReferenceGatewayEventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  )
}
