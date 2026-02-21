import type { ComponentProps, JSX } from "react"

import clsx from "clsx"

import styles from "./ModalInputs.module.css"

type BaseModalTextInputProps = ComponentProps<"input"> & {
  errorMessage?: string
}

export function BaseModalTextInput({
  className,
  errorMessage,
  ...props
}: BaseModalTextInputProps): JSX.Element {
  return (
    <div className={clsx(styles.wrapper, className)}>
      <input
        className={clsx(styles.input, errorMessage && styles.invalid)}
        {...props}
      />
      {errorMessage && (
        <span className={styles.errorMessage}>{errorMessage}</span>
      )}
    </div>
  )
}
