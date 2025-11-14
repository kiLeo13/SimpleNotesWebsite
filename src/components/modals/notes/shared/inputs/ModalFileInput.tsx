import { type JSX } from "react"
import { Controller, useFormContext, type FieldValues, type Path } from "react-hook-form"

import { BaseModalFileInput } from "./BaseModalFileInput"
import { getPrettySize } from "../../../../../utils/utils"

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
      render={({ field: { onChange, value, ...restField }, fieldState }) => {
        const fileList = value as FileList | undefined
        const file = fileList?.[0]
        
        return (
          <BaseModalFileInput
            {...restField}
            accept={exts}
            onChange={(e) => onChange(e.target.files)}
            errorMessage={fieldState.error?.message}
            displayFileName={file?.name}
            displayFileSize={file ? getPrettySize(file.size) : undefined}
          />
        )
      }}
    />
  )
}