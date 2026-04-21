import { describe, expect, it } from "vitest"

import { parseRouterSearch, stringifyRouterSearch } from "./routerSearchParams"

describe("routerSearchParams", () => {
  it("keeps simple string params human-readable", () => {
    expect(stringifyRouterSearch({ id: "1" })).toBe("?id=1")
    expect(parseRouterSearch("?id=1")).toEqual({ id: "1" })
  })

  it("still parses older quoted string URLs", () => {
    expect(parseRouterSearch('?id="1"')).toEqual({ id: "1" })
  })

  it("preserves JSON values for complex params", () => {
    const encoded = stringifyRouterSearch({
      filters: { author: "leo", nested: ["a", "b"] }
    })

    expect(parseRouterSearch(encoded)).toEqual({
      filters: { author: "leo", nested: ["a", "b"] }
    })
  })
})
