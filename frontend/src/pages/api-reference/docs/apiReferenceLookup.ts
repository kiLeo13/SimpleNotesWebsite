import {
  apiResources,
  gatewayEventGroups,
  type ApiResource,
  type GatewayEventGroup
} from "./apiReferenceDocs"

export type ApiReferenceDetail =
  | {
      group: GatewayEventGroup
      id: string
      type: "gateway-event-group"
    }
  | {
      id: string
      resource: ApiResource
      type: "resource"
    }

export function findApiReferenceDetail(
  id: string
): ApiReferenceDetail | undefined {
  const resource = apiResources.find((item) => item.id === id)
  if (resource) return { id, resource, type: "resource" }

  const group = gatewayEventGroups.find((item) => item.id === id)
  if (group) return { id, group, type: "gateway-event-group" }

  return undefined
}

export function isApiReferenceDetailId(id: string): boolean {
  return findApiReferenceDetail(id) !== undefined
}
