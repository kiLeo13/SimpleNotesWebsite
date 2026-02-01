import { signupSchema, type SignupFormFields } from "@/types/forms/users"
import { useCallback, useMemo, useState, type JSX } from "react"
import { useForm, type SubmitHandler, type UseFormSetError } from "react-hook-form"

import RequiredHint from "@/components/hints/RequiredHint"

import { VerificationModal } from "./steps/verification/VerificationModal"
import { FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"
import { DarkWrapper } from "@/components/DarkWrapper"
import { PasswordRules } from "./passwords/PasswordRules"
import { LoaderWrapper } from "@/components/loader/LoaderWrapper"
import { displayFormsErrors } from "@/utils/errorHandlerUtils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAsync } from "@/hooks/useAsync"
import { userService } from "@/services/userService"
import { useTranslation } from "react-i18next"
import { debounce } from "lodash-es"

import styles from "./AuthModal.module.css"

export function SignupModal(): JSX.Element {
  const { t } = useTranslation()
  const [isEmailVerifying, setIsEmailVerifying] = useState(false)
  const [showPwdChecks, setShowPwdChecks] = useState(false)
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
    resolver: zodResolver(signupSchema)
  })
  const { onBlur, ...passwordRest } = register("password")
  const { onChange, ...emailRest } = register("email")

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

  const debouncedEmailCheck = useMemo(() => debounce(handleEmailCheck, 500), [handleEmailCheck])

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
      <DarkWrapper open={isEmailVerifying}>
        <VerificationModal email={getValues("email")} />
      </DarkWrapper>

      <div className={styles.authModalContainer}>
        <form className={styles.authForm} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.authFormControl}>
            <label className={styles.authFormLabel}>
              {t("modals.auth.name")}
              <RequiredHint />
            </label>
            <input
              className={styles.authFormInput}
              {...register("username")}
              type="text"
              autoComplete="name"
            />
            {!!errors.username && (
              <span className={styles.authInputError}>{errors.username.message}</span>
            )}
          </div>

          <div className={styles.authFormControl}>
            <label className={styles.authFormLabel}>
              {t("modals.auth.email")}
              <RequiredHint />
            </label>
            <input
              className={styles.authFormInput}
              {...emailRest}
              onChange={(e) => {
                onChange(e)
                debouncedEmailCheck()
              }}
              type="email"
              autoComplete="email"
              placeholder={t("modals.auth.emailPlh")}
            />
            {!!errors.email && (
              <span className={styles.authInputError}>{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className={styles.authFormControl}>
            <label className={styles.authFormLabel}>
              {t("modals.auth.newPwd")}
              <RequiredHint />
            </label>
            <div className={styles.passwordContainer}>
              <input
                className={styles.authFormInput}
                {...passwordRest}
                onFocus={() => setShowPwdChecks(true)}
                onBlur={(e) => {
                  onBlur(e) // Let RHF do its validations
                  setShowPwdChecks(false)
                }}
                type="password"
              />
              {showPwdChecks && (
                <div className={styles.passwordConstraintsWrapper}>
                  <PasswordRules control={control} />
                </div>
              )}
            </div>
            {!!errors.password && (
              <span className={styles.authInputError}>{errors.password.message}</span>
            )}
          </div>

          <div className={styles.authFormFooterContainer}>
            <div className={styles.authFooterContents}>
              <LoaderWrapper isLoading={isLoading} loaderProps={{ scale: 0.8 }}>
                <button disabled={isLoading} className={styles.submitButton} type="submit">
                  {t("modals.auth.verify")}
                </button>
              </LoaderWrapper>
              <Link draggable="false" className={styles.modalSwitcher} to="/login">
                <span>{t("modals.auth.hasAcc")}</span>
                <FaArrowRight />
              </Link>
            </div>
            {!!errors.root && <span className={styles.authInputError}>{errors.root.message}</span>}
          </div>
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
