import type { ApiResource, ApiTopic } from "./apiReferenceDocs"

export type NavCategory = "reference" | "resources"

export function topicSectionId(id: string): string {
  return `topic-${id}`
}

export function resourceSectionId(id: string): string {
  return `resource-${id}`
}

export function routeSectionId(resourceId: string, routeId: string): string {
  return `route-${resourceId}-${routeId}`
}

export function categoryForSection(id: string): NavCategory {
  return id.startsWith("topic-") ? "reference" : "resources"
}

export function buildApiReferenceSectionIds(
  topics: ApiTopic[],
  resources: ApiResource[]
) {
  return [
    ...topics.map((topic) => topicSectionId(topic.id)),
    ...resources.flatMap((resource) => [
      resourceSectionId(resource.id),
      ...resource.routes.map((route) => routeSectionId(resource.id, route.id))
    ])
  ]
}
