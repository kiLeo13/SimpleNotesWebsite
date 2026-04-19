import type { HTMLInputAutoCompleteAttribute, JSX } from "react"
import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form"

import { BaseModalTextInput } from "./BaseModalTextInput"

type ModalTextInputProps<T extends FieldValues> = {
  name: Path<T>
  placeholder?: string
  autoComplete?: HTMLInputAutoCompleteAttribute
}

export function ModalTextInput<T extends FieldValues>({
  name,
  placeholder,
  autoComplete
}: ModalTextInputProps<T>): JSX.Element {
  const { control } = useFormContext<T>()
  const { field, fieldState } = useController<T>({ name, control })
  
  return (
    <BaseModalTextInput
      {...field}
      placeholder={placeholder}
      autoComplete={autoComplete}
      errorMessage={fieldState.error?.message}
    />
  )
}