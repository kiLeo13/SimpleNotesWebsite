import { createFileRoute, redirect } from "@tanstack/react-router"

import { MainPage } from "@/pages/mainpage/MainPage"
import { hasSession } from "@/utils/authutils"

type IndexSearch = {
  id?: string
}

export const Route = createFileRoute("/")({
  validateSearch: (search): IndexSearch => ({
    id: typeof search.id === "string" ? search.id : undefined
  }),
  beforeLoad: () => {
    if (!hasSession()) {
      throw redirect({ to: "/login" })
    }
  },
  component: MainRoute
})

function MainRoute() {
  return <MainPage />
}
