import { signupFormSchema, type SignupFormFields } from "@/types/forms/users"
import { useCallback, useEffect, useMemo, useState, type JSX } from "react"
import {
  useForm,
  type SubmitHandler,
  type UseFormSetError
} from "react-hook-form"

import { VerificationModal } from "./steps/verification/VerificationModal"
import { DarkWrapper } from "@/components/DarkWrapper"
import { displayFormsErrors } from "@/utils/errorHandlerUtils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAsync } from "@/hooks/useAsync"
import { userService } from "@/services/userService"
import { useTranslation } from "react-i18next"
import { debounce } from "lodash-es"

import { AuthFormFooter } from "./AuthFormFooter"
import { AuthTextField } from "./AuthTextField"
import { ModalLabel } from "@/components/modals/notes/shared/sections/ModalLabel"
import { ModalSection } from "@/components/modals/notes/shared/sections/ModalSection"
import { PasswordCreationInput } from "./passwords/PasswordCreationInput"
import styles from "./AuthModal.module.css"

export function SignupModal(): JSX.Element {
  const { t } = useTranslation()
  const [isEmailVerifying, setIsEmailVerifying] = useState(false)
  const [signup, signupLoading] = useAsync(userService.signup)
  const [status, statusLoading] = useAsync(userService.getUserStatus)
  const isLoading = signupLoading || statusLoading
  const {
    register,
    handleSubmit,
    setError,
    control,
    getFieldState,
    getValues,
    formState: { errors }
  } = useForm<SignupFormFields>({
    mode: "onChange",
    resolver: zodResolver(signupFormSchema)
  })
  const emailField = register("email")
  const passwordField = register("password")

  const handleEmailCheck = useCallback(async () => {
    const val = getValues("email")

    if (getFieldState("email").invalid) return

    // We don't reuse the `status` function because we don't want the loading
    // icon to show on screen. This operation should be handled "silently".
    const resp = await userService.getUserStatus({ email: val })
    if (resp.success && resp.data.status === "TAKEN") {
      handleEmailTaken(setError, t)
    }
  }, [getFieldState, getValues, setError, t])

  const debouncedEmailCheck = useMemo(
    () => debounce(handleEmailCheck, 500),
    [handleEmailCheck]
  )

  useEffect(() => {
    return () => debouncedEmailCheck.cancel()
  }, [debouncedEmailCheck])

  const onSubmit: SubmitHandler<SignupFormFields> = async (data) => {
    const statusResp = await status(data)
    if (!statusResp.success) {
      displayFormsErrors(statusResp.errors, setError)
      return
    }

    if (statusResp.data.status === "VERIFYING") {
      setIsEmailVerifying(true)
      return
    }

    const resp = await signup(data)
    if (!resp.success) {
      displayFormsErrors(resp.errors, setError)
      return
    }
    setIsEmailVerifying(true)
  }

  return (
    <>
      {isEmailVerifying && (
        <DarkWrapper animationPreset="pop">
          <VerificationModal
            email={getValues("email")}
            password={getValues("password")}
          />
        </DarkWrapper>
      )}

      <div className={styles.authModalContainer}>
        <form className={styles.authForm} onSubmit={handleSubmit(onSubmit)}>
          <AuthTextField
            id="signup-username"
            autoComplete="name"
            errorMessage={errors.username?.message}
            label={t("modals.auth.name")}
            type="text"
            {...register("username")}
          />

          <AuthTextField
            id="signup-email"
            autoComplete="email"
            errorMessage={errors.email?.message}
            label={t("modals.auth.email")}
            placeholder={t("modals.auth.emailPlh")}
            type="email"
            {...emailField}
            onChange={(event) => {
              emailField.onChange(event)
              debouncedEmailCheck()
            }}
          />

          <ModalSection
            label={
              <ModalLabel
                htmlFor="signup-password"
                title={t("modals.auth.newPwd")}
                required
              />
            }
            input={
              <PasswordCreationInput
                id="signup-password"
                control={control}
                errorMessage={errors.password?.message}
                {...passwordField}
              />
            }
          />

          <AuthFormFooter
            errorMessage={errors.root?.message}
            isLoading={isLoading}
            submitLabel={t("modals.auth.verify")}
            switchLabel={t("modals.auth.hasAcc")}
            switchTo="/login"
          />
        </form>
      </div>
    </>
  )
}

function handleEmailTaken(
  setError: UseFormSetError<SignupFormFields>,
  t: (key: string) => string
): void {
  setError("email", {
    type: "manual",
    message: t("modals.auth.errors.usedEmail")
  })
}
