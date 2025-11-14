import { type ComponentProps, type JSX } from "react"

import clsx from "clsx"

import styles from "./ModalInputs.module.css"

export type SelectOption = {
  label: string
  value: string
}

type BaseModalSelectProps = ComponentProps<"select"> & {
  options: SelectOption[]
  errorMessage?: string
}

export function BaseModalSelect({ 
  className, 
  errorMessage, 
  options, 
  ...props 
}: BaseModalSelectProps): JSX.Element {
  return (
    <>
      <select 
        className={clsx(styles.input, styles.select, errorMessage && styles.invalid, className)} 
        {...props}
      >
        {options.map((opt) => (
          <option className={styles.selectOption} key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
    </>
  )
}