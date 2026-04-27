import { describe, expect, it } from "vitest"

import { beforeLoadApiReferenceDetail } from "./apiReferenceRouteGuard"

describe("api reference detail route", () => {
  it("allows documented API reference detail ids", () => {
    expect(() =>
      beforeLoadApiReferenceDetail({ params: { resourceId: "user" } })
    ).not.toThrow()
    expect(() =>
      beforeLoadApiReferenceDetail({ params: { resourceId: "server-events" } })
    ).not.toThrow()
  })

  it("redirects unknown API reference detail ids to the root reference page", () => {
    let thrown: unknown

    try {
      beforeLoadApiReferenceDetail({ params: { resourceId: "note-created" } })
    } catch (error) {
      thrown = error
    }

    expect(thrown).toMatchObject({
      options: {
        to: "/api/reference"
      }
    })
  })
})
