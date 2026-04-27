import type { ApiField } from "./apiReferenceDocs"
import { ApiReferenceFieldTable } from "./ApiReferenceFieldTable"

import "./ApiReferenceRouteFields.module.css"

type ApiReferenceRouteFieldsProps = {
  fields?: ApiField[]
  title: string
}

export function ApiReferenceRouteFields({
  fields,
  title
}: ApiReferenceRouteFieldsProps) {
  if (!fields?.length) return null
  return <ApiReferenceFieldTable fields={fields} title={title} />
}
