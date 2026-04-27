import type { ApiReferenceDetail } from "./apiReferenceLookup"

import { apiTopics } from "./apiReferenceDocs"
import {
  declarationSectionId,
  gatewayEventSectionId,
  resourceObjectSectionId,
  routeSectionId,
  topicSectionId
} from "./apiReferenceIds"

export type ApiReferenceTocItem = {
  id: string
  label: string
}

export function buildApiReferenceTocItems(
  detail?: ApiReferenceDetail
): ApiReferenceTocItem[] {
  if (!detail) {
    return apiTopics.map((topic) => ({
      id: topicSectionId(topic.id),
      label: topic.title
    }))
  }

  if (detail.type === "resource") {
    return [
      {
        id: resourceObjectSectionId(detail.resource.id),
        label: detail.resource.objectName
      },
      ...(detail.resource.declarations ?? []).map((declaration) => ({
        id: declarationSectionId(detail.resource.id, declaration.id),
        label: declaration.title
      })),
      ...detail.resource.routes.map((route) => ({
        id: routeSectionId(detail.resource.id, route.id),
        label: route.title
      }))
    ]
  }

  return [
    {
      id: detail.group.id,
      label: detail.group.title
    },
    ...detail.group.events.map((event) => ({
      id: gatewayEventSectionId(event.id),
      label: event.type
    }))
  ]
}
