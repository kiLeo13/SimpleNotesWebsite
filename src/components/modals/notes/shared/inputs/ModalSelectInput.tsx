import type { JSX } from "react"
import { BaseModalSelect, type SelectOption } from "./BaseModalSelect"
import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form"

type SelectInputProps<T extends FieldValues> = {
  name: Path<T>
  options: SelectOption[]
}

export function ModalSelectInput<T extends FieldValues>({ name, options }: SelectInputProps<T>): JSX.Element {
  const { control } = useFormContext<T>()
  const { field, fieldState } = useController<T>({ name, control })

  return (
    <BaseModalSelect
      {...field}
      options={options}
      errorMessage={fieldState.error?.message}
    />
  )
}