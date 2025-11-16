import type { JSX } from "react"
import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form"
import { BaseArrayInput } from "./BaseArrayInput"

type ModalArrayInputProps<T extends FieldValues> = {
  name: Path<T>
  placeholder?: string
  minLength?: number
  maxLength?: number
}

export function ModalArrayInput<T extends FieldValues>({ 
  name, 
  placeholder,
  minLength,
  maxLength
}: ModalArrayInputProps<T>): JSX.Element {
  const { control } = useFormContext<T>()
  const { field, fieldState } = useController<T>({ name, control })
  const currentItems: string[] = Array.isArray(field.value) ? field.value : []

  const handleAdd = (newItem: string) => {
    if (!currentItems.includes(newItem)) {
      field.onChange([...currentItems, newItem])
    }
  }

  const handleRemove = (toRemove: string) => {
    field.onChange(currentItems.filter(t => t !== toRemove))
  }

  return (
    <BaseArrayInput
      items={currentItems}
      onAdd={handleAdd}
      onRemove={handleRemove}
      errorMessage={fieldState.error?.message}
      placeholder={placeholder}

      minLength={minLength}
      maxLength={maxLength}
    />
  )
}