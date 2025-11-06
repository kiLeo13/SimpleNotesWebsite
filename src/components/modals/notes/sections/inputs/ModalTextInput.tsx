import type { JSX } from "react"

import clsx from "clsx"

import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form"

import styles from "./ModalInputs.module.css"

type ModalTextInputProps<T extends FieldValues> = {
  name: Path<T>;
  placeholder?: string
}

export function ModalTextInput<T extends FieldValues>({
  name,
  placeholder
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
      />

      {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
    </>
  )
}