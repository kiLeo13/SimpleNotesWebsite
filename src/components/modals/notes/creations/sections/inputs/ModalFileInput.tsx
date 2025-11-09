import { type JSX } from "react"

import clsx from "clsx"

import { getPrettySize } from "../../../../../../utils/utils"
import { Controller, useFormContext, type FieldValues, type Path } from "react-hook-form"

import styles from "./ModalInputs.module.css"

type ModalFileInputProps<T extends FieldValues> = {
  name: Path<T>
  allowedExtensions: string[]
}

export function ModalFileInput<T extends FieldValues>({ name, allowedExtensions }: ModalFileInputProps<T>): JSX.Element {
  const { control } = useFormContext<T>()
  const exts = allowedExtensions.map(ext => `.${ext}`).join(',')

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const fileList = field.value as FileList | undefined
        const file = fileList?.[0]
        const errorMessage = fieldState.error?.message

        return (
          <>
            <label className={clsx(styles.fileInputWrapper, errorMessage && styles.invalid)}>
              <span>Selecione um arquivo</span>
              <span className={styles.chosenFile}>
                {file && (
                  <>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>{getPrettySize(file.size)}</span>
                  </>
                )}
              </span>
              <input
                type="file"
                className="hidden-styled-file-input"
                onChange={(e) => field.onChange(e.target.files)}
                accept={exts}
              />
            </label>
            {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
          </>
        )
      }}
    />
  )
}