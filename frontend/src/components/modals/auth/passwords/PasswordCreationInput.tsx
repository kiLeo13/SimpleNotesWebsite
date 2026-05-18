import { useState, type ComponentProps, type FocusEvent, type JSX } from "react"

import * as Popover from "@radix-ui/react-popover"

import { BaseModalTextInput } from "@/components/modals/notes/shared/inputs/BaseModalTextInput"
import type { SignupFormFields } from "@/types/forms/users"
import { useWatch, type Control } from "react-hook-form"

import { getBrokenPasswordRules } from "./PasswordRules.helpers"
import { PasswordRules } from "./PasswordRules"
import styles from "./PasswordCreationInput.module.css"

type PasswordCreationInputProps = ComponentProps<typeof BaseModalTextInput> & {
  control: Control<SignupFormFields>
}

export function PasswordCreationInput({
  control,
  onBlur,
  onFocus,
  ...inputProps
}: PasswordCreationInputProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const password = useWatch({
    control,
    name: "password",
    defaultValue: ""
  })
  const hasBrokenRules = getBrokenPasswordRules(password).length > 0

  const handleFocus = (event: FocusEvent<HTMLInputElement>): void => {
    onFocus?.(event)
    setIsOpen(true)
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
    onBlur?.(event)
    setIsOpen(false)
  }

  return (
    <Popover.Root open={isOpen && hasBrokenRules}>
      <Popover.Trigger asChild>
        <BaseModalTextInput
          type="password"
          {...inputProps}
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="center"
          className={styles.content}
          side="right"
          sideOffset={12}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <PasswordRules control={control} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
