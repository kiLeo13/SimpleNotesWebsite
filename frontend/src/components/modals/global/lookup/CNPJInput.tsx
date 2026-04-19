import type { ChangeEvent, ComponentProps, KeyboardEvent } from "react"

import { BaseModalTextInput } from "../../notes/shared/inputs/BaseModalTextInput"
import { formatCNPJ } from "@/utils/companies/cnpjFormatter"

const CNPJLength = 14

type CNPJInputProps = Omit<
  ComponentProps<typeof BaseModalTextInput>,
  "value" | "onChange"
> & {
  value?: string
  onChange?: (rawValue: string) => void
  onEnter?: (rawValue: string) => void
}

export function CNPJInput({
  value = "",
  onChange,
  onEnter,
  errorMessage,
  ...props
}: CNPJInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = sanitize(e.target.value).slice(0, CNPJLength)
    onChange?.(rawValue)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()

      if (!errorMessage) {
        const currentRawValue = sanitize((e.target as HTMLInputElement).value)
        onEnter?.(currentRawValue)
      }
    }
    props.onKeyDown?.(e)
  }

  const displayValue = formatCNPJ(value)

  return (
    <BaseModalTextInput
      {...props}
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      errorMessage={errorMessage}
      maxLength={CNPJLength + 4}
      placeholder="00.000.000/0000-00"
    />
  )
}

function sanitize(s: string): string {
  return s.replace(/\D/g, "")
}
