import { createRouter } from "@tanstack/react-router"

import { routeTree } from "./routeTree.gen"
import {
  parseRouterSearch,
  stringifyRouterSearch
} from "./utils/routerSearchParams"

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  parseSearch: parseRouterSearch,
  stringifySearch: stringifyRouterSearch
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
