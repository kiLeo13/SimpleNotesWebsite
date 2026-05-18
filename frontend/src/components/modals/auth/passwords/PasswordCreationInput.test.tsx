import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { useForm } from "react-hook-form"

import type { SignupFormFields } from "@/types/forms/users"

import { PasswordCreationInput } from "./PasswordCreationInput"

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserverMock {
    disconnect = vi.fn()
    observe = vi.fn()
    unobserve = vi.fn()
  } as unknown as typeof ResizeObserver
})

describe("PasswordCreationInput", () => {
  it("shows password requirements while focused", async () => {
    render(<PasswordCreationInputHarness />)

    fireEvent.focus(screen.getByLabelText("Senha"))

    expect(await screen.findByText(/ao menos 8 caracteres/)).toBeInTheDocument()
  })

  it("hides password requirements on blur", async () => {
    render(<PasswordCreationInputHarness />)

    const input = screen.getByLabelText("Senha")

    fireEvent.focus(input)
    expect(await screen.findByText(/ao menos 8 caracteres/)).toBeInTheDocument()

    fireEvent.blur(input)

    await waitFor(() => {
      expect(screen.queryByText(/ao menos 8 caracteres/)).not.toBeInTheDocument()
    })
  })

  it("removes the requirements once the password satisfies every rule", async () => {
    render(<PasswordCreationInputHarness />)

    const input = screen.getByLabelText("Senha")

    fireEvent.focus(input)
    expect(await screen.findByText(/ao menos 8 caracteres/)).toBeInTheDocument()

    fireEvent.change(input, { target: { value: "Validpass1!" } })

    await waitFor(() => {
      expect(screen.queryByText(/ao menos 8 caracteres/)).not.toBeInTheDocument()
    })
  })
})

function PasswordCreationInputHarness() {
  const form = useForm<SignupFormFields>({
    defaultValues: {
      email: "",
      password: "",
      username: ""
    }
  })

  return (
    <PasswordCreationInput
      aria-label="Senha"
      control={form.control}
      {...form.register("password")}
    />
  )
}
