import { render, screen, within } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import "@/services/i18n"
import { ApiReferencePage } from "./ApiReferencePage"
import { isApiReferenceDetailId } from "./docs/apiReferenceLookup"

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>()

  return {
    ...actual,
    Link: ({
      children,
      className,
      hash,
      params,
      to
    }: {
      children: ReactNode
      className?: string
      hash?: string
      params?: { resourceId?: string }
      to: string
    }) => {
      const href =
        to === "/api/reference/$resourceId" && params?.resourceId
          ? `/api/reference/${params.resourceId}`
          : to
      const suffix = hash ? `#${hash}` : ""

      return (
        <a className={className} href={`${href}${suffix}`}>
          {children}
        </a>
      )
    }
  }
})

function getByTextContent(text: string) {
  return screen.getByText((_, element) => {
    if (element?.textContent !== text) return false

    return Array.from(element.children).every(
      (child) => child.textContent !== text
    )
  })
}

describe("ApiReferencePage", () => {
  it("renders a backend-only resource-driven reference", () => {
    render(<ApiReferencePage />)

    expect(
      screen.getByRole("heading", { name: "API Reference" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("navigation", { name: "HTTP Resources" })
    ).toBeInTheDocument()
    expect(screen.queryByRole("navigation", { name: "Entities" })).toBeNull()
    expect(screen.queryByText(/frontend/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/openapi/i)).not.toBeInTheDocument()
  })

  it("documents the v1 API Gateway stage", () => {
    render(<ApiReferencePage />)

    expect(screen.getByText("/v1")).toBeInTheDocument()
    expect(screen.getByText(/\/v\{version\}/)).toBeInTheDocument()
  })

  it("renders a selected resource with its object declaration before routes", () => {
    render(<ApiReferencePage detailId="user" />)

    const userResource = screen.getByRole("heading", { name: "User" })
      .closest("article")

    expect(userResource).not.toBeNull()
    expect(
      within(userResource as HTMLElement).getByRole("heading", {
        name: "User Object"
      })
    ).toBeInTheDocument()
    expect(
      within(userResource as HTMLElement).getByRole("table", {
        name: "User Object fields"
      })
    ).toBeInTheDocument()
    expect(
      within(userResource as HTMLElement).getByRole("heading", {
        name: "Get User"
      })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "API Reference" })
    ).not.toBeInTheDocument()
  })

  it("links route return copy to resource object sections", () => {
    render(<ApiReferencePage detailId="user" />)

    const getUserSection = screen
      .getByRole("heading", { name: "Get User" })
      .closest("article")

    expect(getUserSection).not.toBeNull()
    expect(
      within(getUserSection as HTMLElement).getByRole("link", { name: "user" })
    ).toHaveAttribute("href", "/api/reference/user")
  })

  it("renders Discord-style callouts and highlighted code blocks from declarations", () => {
    const { rerender } = render(<ApiReferencePage />)

    expect(
      getByTextContent(
        "Requests that do not provide a valid bearer token will fail with a 401 Unauthorized."
      )
    ).toBeInTheDocument()

    const highlightedCode = screen.getByText((_, element) => {
      return (
        element?.tagName.toLowerCase() === "code" &&
        element.textContent?.includes('"errors"') === true
      )
    })

    expect(highlightedCode.className).toContain("hljs")

    rerender(<ApiReferencePage detailId="note" />)

    expect(
      getByTextContent(
        "File uploads must use multipart/form-data header and pass all attributes through json_payload parameter."
      )
    ).toBeInTheDocument()
  })

  it("keeps sidebar categories always expanded", () => {
    render(<ApiReferencePage />)

    const referenceNav = screen.getByRole("navigation", { name: "Reference" })
    const resourcesNav = screen.getByRole("navigation", { name: "HTTP Resources" })
    const gatewayNav = screen.getByRole("navigation", { name: "Gateway Events" })

    expect(
      within(referenceNav).getByRole("link", { name: "Authorization" })
    ).toBeInTheDocument()
    expect(
      within(resourcesNav).getByRole("link", { name: "User" })
    ).toHaveAttribute(
      "href",
      "/api/reference/user"
    )
    expect(
      within(gatewayNav).getByRole("link", { name: "Server Events" })
    ).toHaveAttribute(
      "href",
      "/api/reference/server-events"
    )
    expect(
      within(gatewayNav).getByRole("link", { name: "Client Events" })
    ).toHaveAttribute(
      "href",
      "/api/reference/client-events"
    )
    expect(screen.queryByRole("button", { name: /Reference/i })).toBeNull()
  })

  it("uses name and type notation for optional and nullable fields", () => {
    const { rerender } = render(<ApiReferencePage detailId="user" />)

    expect(
      screen.getAllByText(
        (_, element) => element?.textContent === "is_verified?"
      )[0]
    ).toBeInTheDocument()

    rerender(<ApiReferencePage detailId="audit-logs" />)

    expect(screen.getAllByText("string?")[0]).toBeInTheDocument()
    expect(screen.queryByText("required")).not.toBeInTheDocument()
  })

  it("renders selected gateway event groups as routed detail pages", () => {
    const { rerender } = render(<ApiReferencePage detailId="server-events" />)

    const serverEvents = screen
      .getByRole("heading", { name: "Server Events" })
      .closest("section")

    expect(serverEvents).not.toBeNull()
    expect(within(serverEvents as HTMLElement).getByText("NOTE_CREATED"))
      .toBeInTheDocument()
    expect(within(serverEvents as HTMLElement).getByText("NOTE_UPDATED"))
      .toBeInTheDocument()

    rerender(<ApiReferencePage detailId="client-events" />)

    const clientEvents = screen
      .getByRole("heading", { name: "Client Events" })
      .closest("section")

    expect(clientEvents).not.toBeNull()
    expect(within(clientEvents as HTMLElement).getByText("ping"))
      .toBeInTheDocument()
    expect(within(clientEvents as HTMLElement).queryByText("NOTE_CREATED"))
      .not.toBeInTheDocument()
  })

  it("sidebar shows only top-level resources without nested routes", () => {
    render(<ApiReferencePage />)

    const resourcesNav = screen.getByRole("navigation", { name: "HTTP Resources" })

    expect(
      within(resourcesNav).getByRole("link", { name: "User" })
    ).toBeInTheDocument()
    expect(
      within(resourcesNav).getByRole("link", { name: "Note" })
    ).toBeInTheDocument()
    expect(
      within(resourcesNav).getByRole("link", { name: "Company" })
    ).toBeInTheDocument()

    // Should NOT have nested route links in sidebar
    expect(
      within(resourcesNav).queryByRole("link", { name: "Login" })
    ).toBeNull()
    expect(
      within(resourcesNav).queryByRole("link", { name: "Get User" })
    ).toBeNull()
  })

  it("renders an on-this-page rail for the current page sections", () => {
    const { rerender } = render(<ApiReferencePage />)

    const rootToc = screen.getByRole("complementary", {
      name: "Page sections"
    })

    expect(within(rootToc).getByText("On this page")).toBeInTheDocument()
    expect(within(rootToc).getByRole("link", { name: "Base URL" }))
      .toHaveAttribute("href", "/api/reference#topic-base-url")
    expect(within(rootToc).getByRole("link", { name: "Gateway (WebSocket) API" }))
      .toHaveAttribute("href", "/api/reference#topic-gateway")

    rerender(<ApiReferencePage detailId="note" />)

    const noteToc = screen.getByRole("complementary", {
      name: "Page sections"
    })

    expect(within(noteToc).getByRole("link", { name: "Note Object" }))
      .toHaveAttribute("href", "/api/reference/note#object-note")
    expect(within(noteToc).getByRole("link", { name: "Note Type" }))
      .toHaveAttribute("href", "/api/reference/note#declaration-note-note-type")
    expect(within(noteToc).getByRole("link", { name: "Create Note" }))
      .toHaveAttribute("href", "/api/reference/note#route-note-create-note")
  })

  it("renders note type declarations for reusable field references", () => {
    render(<ApiReferencePage detailId="note" />)

    expect(
      screen.getByRole("heading", { name: "Note Type" })
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole("link", { name: "Note Type" })[0]
    ).toHaveAttribute("href", "/api/reference/note#declaration-note-note-type")
  })

  it("accepts only documented detail route ids", () => {
    expect(isApiReferenceDetailId("user")).toBe(true)
    expect(isApiReferenceDetailId("server-events")).toBe(true)
    expect(isApiReferenceDetailId("client-events")).toBe(true)
    expect(isApiReferenceDetailId("note-created")).toBe(false)
    expect(isApiReferenceDetailId("missing-doc")).toBe(false)
  })
})
