import type { JSX } from "react"

import {
  CustomSelect,
  type CustomSelectProps
} from "@/components/vanilla/inputs/CustomSelect"

import styles from "./ModalInputs.module.css"

export type SelectOption = {
  label: string
  value: string
}

type BaseModalSelectProps = CustomSelectProps & {
  options: SelectOption[]
  errorMessage?: string
  hasSearch?: boolean
}

export function BaseModalSelect({
  className,
  errorMessage,
  options,
  hasSearch,
  ...props
}: BaseModalSelectProps): JSX.Element {
  return (
    <>
      <CustomSelect
        className={className}
        options={options}
        hasSearch={hasSearch}
        invalid={!!errorMessage}
        {...props}
      />

      {errorMessage && (
        <span className={styles.errorMessage}>{errorMessage}</span>
      )}
    </>
  )
}
