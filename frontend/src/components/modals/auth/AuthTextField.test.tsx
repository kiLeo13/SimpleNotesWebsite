import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AuthTextField } from "./AuthTextField"

describe("AuthTextField", () => {
  it("renders auth fields with shared modal input styling and errors", () => {
    render(
      <AuthTextField
        id="email"
        errorMessage="Email invalido"
        label="Email"
        type="email"
      />
    )

    expect(screen.getByLabelText(/Email/)).toHaveAttribute("type", "email")
    expect(screen.getByText("Email invalido")).toBeInTheDocument()
  })
})
