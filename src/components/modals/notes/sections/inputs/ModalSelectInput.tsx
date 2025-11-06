import type { JSX } from "react"
import { useController, useFormContext, type FieldValues, type Path } from "react-hook-form"

import clsx from "clsx"

import styles from "./ModalInputs.module.css"

type Option = {
  label: string
  value: string
}

type ModalSelectInputProps<T extends FieldValues> = {
  name: Path<T>
  options: Option[]
}

export function ModalSelectInput<T extends FieldValues>({ name, options }: ModalSelectInputProps<T>): JSX.Element {
  const { control } = useFormContext<T>()
  const { field, fieldState } = useController<T>({ name, control })
  const errorMessage = fieldState.error?.message

  return (
    <>
      <select {...field}  className={clsx(styles.input, styles.select, errorMessage && styles.invalid)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
    </>
  )
}