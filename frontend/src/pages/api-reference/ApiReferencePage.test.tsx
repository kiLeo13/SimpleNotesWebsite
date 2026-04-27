import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import "@/services/i18n"
import { ApiReferencePage } from "./ApiReferencePage"

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
      screen.getByRole("navigation", { name: "HTTP API Resources" })
    ).toBeInTheDocument()
    expect(screen.queryByRole("navigation", { name: "Entities" })).toBeNull()
    expect(screen.queryByText(/frontend/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/openapi/i)).not.toBeInTheDocument()
  })

  it("documents the v1 API Gateway stage", () => {
    render(<ApiReferencePage />)

    expect(screen.getByText("/v1")).toBeInTheDocument()
    expect(screen.getByText(/\/v\{version\}/)).toBeInTheDocument()
    expect(screen.getAllByText("/users/{id}")[0]).toBeInTheDocument()
  })

  it("renders each resource with its object declaration before routes", () => {
    render(<ApiReferencePage />)

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
  })

  it("links route return copy to resource object sections", () => {
    render(<ApiReferencePage />)

    const getUserSection = screen
      .getByRole("heading", { name: "Get User" })
      .closest("article")

    expect(getUserSection).not.toBeNull()
    expect(
      within(getUserSection as HTMLElement).getByRole("link", { name: "user" })
    ).toHaveAttribute("href", "#resource-user")
  })

  it("renders Discord-style callouts and highlighted code blocks from declarations", () => {
    render(<ApiReferencePage />)

    expect(
      getByTextContent(
        "File uploads must use multipart/form-data header and pass all attributes through json_payload parameter."
      )
    ).toBeInTheDocument()
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
  })

  it("collapses and expands sidebar categories", () => {
    render(<ApiReferencePage />)

    const referenceToggle = screen.getByRole("button", { name: /Reference/i })

    expect(screen.getByRole("link", { name: "Authorization" })).toBeInTheDocument()

    fireEvent.click(referenceToggle)

    expect(screen.queryByRole("link", { name: "Authorization" })).toBeNull()

    fireEvent.click(referenceToggle)

    expect(screen.getByRole("link", { name: "Authorization" })).toBeInTheDocument()
  })

  it("uses name and type notation for optional and nullable fields", () => {
    render(<ApiReferencePage />)

    expect(
      screen.getAllByText((_, element) => element?.textContent === "is_verified?")[0]
    ).toBeInTheDocument()
    expect(screen.getAllByText("string?")[0]).toBeInTheDocument()
    expect(screen.queryByText("required")).not.toBeInTheDocument()
  })
})
