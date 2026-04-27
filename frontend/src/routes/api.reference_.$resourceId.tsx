import { createFileRoute } from "@tanstack/react-router"

import { ApiReferencePage } from "@/pages/api-reference/ApiReferencePage"
import { beforeLoadApiReferenceDetail } from "@/pages/api-reference/routing/apiReferenceRouteGuard"

export const Route = createFileRoute("/api/reference_/$resourceId")({
  beforeLoad: beforeLoadApiReferenceDetail,
  component: ApiReferenceDetailRoute
})

function ApiReferenceDetailRoute() {
  const { resourceId } = Route.useParams()

  return <ApiReferencePage detailId={resourceId} />
}
