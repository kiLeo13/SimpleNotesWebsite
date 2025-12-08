import { type ComponentProps, type JSX } from "react"

import clsx from "clsx"

import styles from "./ModalInputs.module.css"

type BaseModalFileInputProps = Omit<ComponentProps<"input">, "type"> & {
  errorMessage?: string
  displayFileName?: string
  displayFileSize?: string
  label?: string
}

export function BaseModalFileInput({ 
  className, 
  errorMessage, 
  displayFileName,
  displayFileSize,
  label = "Selecione um arquivo",
  ...props 
}: BaseModalFileInputProps): JSX.Element {
  return (
    <>
      <label className={clsx(styles.fileInputWrapper, errorMessage && styles.invalid, className)}>
        <span className={styles.label}>{label}</span>
        <span className={styles.chosenFile}>
          {displayFileName && (
            <>
              <span className={styles.fileName}>{displayFileName}</span>
              {displayFileSize && <span className={styles.fileSize}>{displayFileSize}</span>}
            </>
          )}
        </span>
        <input
          type="file"
          className="hidden-styled-file-input"
          {...props}
        />
      </label>

      {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
    </>
  )
}