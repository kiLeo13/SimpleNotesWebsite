import type { HTMLInputAutoCompleteAttribute, JSX } from "react"
import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form"

import clsx from "clsx"

import styles from "./ModalInputs.module.css"

type ModalTextInputProps<T extends FieldValues> = {
  name: Path<T>;
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
  const errorMessage = fieldState.error?.message

  return (
    <>
      <input
        {...field}
        className={clsx(styles.input, errorMessage && styles.invalid)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />

      {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
    </>
  )
}