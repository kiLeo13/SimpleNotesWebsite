import type { CSSProperties, JSX } from "react"
import { useController, useFormContext, type ControllerFieldState, type FieldError, type FieldValues, type Path } from "react-hook-form"
import { BaseArrayInput } from "./BaseArrayInput"

type ModalArrayInputProps<T extends FieldValues> = {
  name: Path<T>
  placeholder?: string
  minLength?: number
  maxLength?: number
  style?: CSSProperties
}

export function ModalArrayInput<T extends FieldValues>({ 
  name, 
  placeholder,
  minLength,
  maxLength,
  style
}: ModalArrayInputProps<T>): JSX.Element {
  const { control } = useFormContext<T>()
  const { field, fieldState } = useController<T>({ name, control })
  const currentItems: string[] = Array.isArray(field.value) ? field.value : []
  const errorMessage = toErrorMessage(fieldState)
  const invalidValues = getInvalidValues(currentItems, fieldState.error)

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
      invalidItems={invalidValues}

      onAdd={handleAdd}
      onRemove={handleRemove}
      errorMessage={errorMessage}
      placeholder={placeholder}

      minLength={minLength}
      maxLength={maxLength}

      style={style}
    />
  )
}

// This function proved to be necessary once RHF does not provide
// uniform error display for array structures, so this function is just a helper
function toErrorMessage(state: ControllerFieldState): string | undefined {
  const error = state.error
  if (!error) return undefined

  // Case 1: Top-level array error for constraints like "required"
  if (error.message) return error.message

  // Case 2: Nested item error, for example, a given element requiring a min of X length.
  if (Array.isArray(error)) {
    const first = error.find((e) => e?.message)
    return first?.message
  }
  return undefined
}

function getInvalidValues(
  items: string[],
  error: FieldError | undefined
): string[] {
  if (!Array.isArray(error)) return []

  const errorList = error as unknown as (FieldError | undefined)[]
  return items.filter((_, index) => !!errorList[index])
}