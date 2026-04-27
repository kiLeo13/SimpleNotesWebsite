import { redirect } from "@tanstack/react-router"

import { isApiReferenceDetailId } from "../docs/apiReferenceLookup"

type ApiReferenceDetailRouteContext = {
  params: {
    resourceId: string
  }
}

export function beforeLoadApiReferenceDetail({
  params
}: ApiReferenceDetailRouteContext) {
  if (!isApiReferenceDetailId(params.resourceId)) {
    throw redirect({ to: "/api/reference" })
  }
}
