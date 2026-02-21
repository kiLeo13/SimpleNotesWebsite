import type { ComponentProps, JSX } from "react"

import clsx from "clsx"

import { useTranslation } from "react-i18next"

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
  label,
  ...props
}: BaseModalFileInputProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={clsx(styles.wrapper, className)}>
      <label
        className={clsx(
          styles.fileInputWrapper,
          errorMessage && styles.invalid
        )}
      >
        <span className={styles.label}>
          {label || t("createNoteModal.selectFile")}
        </span>
        <span className={styles.chosenFile}>
          {displayFileName && (
            <>
              <span className={styles.fileName}>{displayFileName}</span>
              {displayFileSize && (
                <span className={styles.fileSize}>{displayFileSize}</span>
              )}
            </>
          )}
        </span>
        <input type="file" className="hidden-styled-file-input" {...props} />
      </label>

      {errorMessage && (
        <span className={styles.errorMessage}>{errorMessage}</span>
      )}
    </div>
  )
}
