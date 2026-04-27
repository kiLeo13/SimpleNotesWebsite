import type { ApiTopic } from "./apiReferenceDocs"

export function topicSectionId(id: string): string {
  return `topic-${id}`
}

export function routeSectionId(resourceId: string, routeId: string): string {
  return `route-${resourceId}-${routeId}`
}

export function declarationSectionId(
  resourceId: string,
  declarationId: string
): string {
  return `declaration-${resourceId}-${declarationId}`
}

export function resourceObjectSectionId(resourceId: string): string {
  return `object-${resourceId}`
}

export function gatewayEventSectionId(id: string): string {
  return `gw-event-${id}`
}

export function buildApiReferenceTopicSectionIds(topics: ApiTopic[]) {
  return topics.map((topic) => topicSectionId(topic.id))
}
