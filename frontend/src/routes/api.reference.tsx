import { createFileRoute } from "@tanstack/react-router"

import { ApiReferencePage } from "@/pages/api-reference/ApiReferencePage"

export const Route = createFileRoute("/api/reference")({
  component: ApiReferencePage
})
