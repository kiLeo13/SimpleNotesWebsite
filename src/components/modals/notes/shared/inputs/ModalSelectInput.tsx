import type { JSX } from "react"
import { BaseModalSelect, type SelectOption } from "./BaseModalSelect"
import {
  useController,
  useFormContext,
  type FieldValues,
  type Path
} from "react-hook-form"

type SelectInputProps<T extends FieldValues> = {
  name: Path<T>
  options: SelectOption[]
  hasSearch?: boolean
}

export function ModalSelectInput<T extends FieldValues>({
  name,
  options,
  hasSearch
}: SelectInputProps<T>): JSX.Element {
  const { control } = useFormContext<T>()
  const { field, fieldState } = useController<T>({ name, control })

  return (
    <BaseModalSelect
      hasSearch={hasSearch}
      {...field}
      options={options}
      errorMessage={fieldState.error?.message}
    />
  )
}
