import type { ComponentProps, JSX } from "react"

import { BaseModalTextInput } from "@/components/modals/notes/shared/inputs/BaseModalTextInput"
import { ModalLabel } from "@/components/modals/notes/shared/sections/ModalLabel"
import { ModalSection } from "@/components/modals/notes/shared/sections/ModalSection"

type AuthTextFieldProps = ComponentProps<typeof BaseModalTextInput> & {
  id: string
  label: string
  required?: boolean
}

export function AuthTextField({
  id,
  label,
  required = true,
  ...inputProps
}: AuthTextFieldProps): JSX.Element {
  return (
    <ModalSection
      label={<ModalLabel htmlFor={id} title={label} required={required} />}
      input={<BaseModalTextInput id={id} {...inputProps} />}
    />
  )
}
