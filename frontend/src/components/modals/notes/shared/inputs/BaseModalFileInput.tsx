import { useState, type ComponentProps, type JSX } from "react"
import clsx from "clsx"
import { useTranslation } from "react-i18next"
import styles from "./ModalInputs.module.css"

type BaseModalFileInputProps = Omit<
  ComponentProps<"input">,
  "type" | "onChange"
> & {
  errorMessage?: string
  displayFileName?: string
  displayFileSize?: string
  label?: string
  onFilesChange: (files: FileList | null) => void
}

export function BaseModalFileInput({
  className,
  errorMessage,
  displayFileName,
  displayFileSize,
  label,
  onFilesChange,
  ...props
}: BaseModalFileInputProps): JSX.Element {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesChange(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilesChange(e.target.files)
  }

  return (
    <div className={clsx(styles.wrapper, className)}>
      <label
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          styles.fileInputWrapper,
          errorMessage && styles.invalid,
          isDragging && styles.dragging // Added dragging state class
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
        <input
          type="file"
          className="hidden-styled-file-input"
          onChange={handleChange}
          {...props}
        />
      </label>

      {errorMessage && (
        <span className={styles.errorMessage}>{errorMessage}</span>
      )}
    </div>
  )
}
