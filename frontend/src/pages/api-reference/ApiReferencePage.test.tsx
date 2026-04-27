import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import "@/services/i18n"
import { ApiReferencePage } from "./ApiReferencePage"

describe("ApiReferencePage", () => {
  it("renders a backend-only resource-driven reference", () => {
    render(<ApiReferencePage />)

    expect(
      screen.getByRole("heading", { name: "ZenKeep API Reference" })
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
    expect(screen.getByText("zenkeep.com")).toBeInTheDocument()
    expect(screen.getAllByText("/v1/api/users/{id}")[0]).toBeInTheDocument()
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
      within(getUserSection as HTMLElement).getByRole("link", { name: "User" })
    ).toHaveAttribute("href", "#resource-user")
  })

  it("renders Discord-style callouts and highlighted code blocks from declarations", () => {
    render(<ApiReferencePage />)

    expect(
      screen.getByText(/Reference uploads use/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Routes in this reference are shown relative to the \/v1 API stage/i)
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
