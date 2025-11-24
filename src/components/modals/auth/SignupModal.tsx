import { signupSchema, type SignupFormFields } from "../../../types/forms/users"
import { useCallback, useMemo, useState, type JSX } from "react"
import { useForm, type SubmitHandler, type UseFormSetError } from "react-hook-form"

import RequiredHint from "../../hints/RequiredHint"

import { VerificationModal } from "./steps/verification/VerificationModal"
import { FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"
import { DarkWrapper } from "../../DarkWrapper"
import { PasswordRules } from "./PasswordRules"
import { displayFormsErrors } from "../../../utils/errorHandlerUtils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAsync } from "../../../hooks/useAsync"
import { userService } from "../../../services/userService"
import { debounce } from "lodash"

import styles from "./AuthModal.module.css"

export function SignupModal(): JSX.Element {
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
  const { onBlur, ...passwordRest } = register('password')
  const { onChange, ...emailRest } = register('email')

  const handleEmailCheck = useCallback(async () => {
    const val = getValues('email')
    
    if (getFieldState('email').invalid) return

    // We don't reuse the `status` function because we don't want the loading
    // icon to show on screen. This operation should be handled "silently".
    const resp = await userService.getUserStatus({ email: val })
    if (resp.success && resp.data.status === 'TAKEN') {
      handleEmailTaken(setError)
    }
  }, [getFieldState, getValues, setError])

  const debouncedEmailCheck = useMemo(
    () => debounce(handleEmailCheck, 500),
    [handleEmailCheck]
  )

  const onSubmit: SubmitHandler<SignupFormFields> = async (data) => {
    const statusResp = await status(data)
    if (!statusResp.success) {
      displayFormsErrors(statusResp.errors, setError)
      return
    }

    if (statusResp.data.status === 'VERIFYING') {
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
        <DarkWrapper>
          <VerificationModal email={getValues('email')} />
        </DarkWrapper>
      )}

      <div className={styles.authModalContainer}>
        <form className={styles.authForm} onSubmit={handleSubmit(onSubmit)}>
          {/* Username */}
          <div className={styles.authFormControl}>
            <label className={styles.authFormLabel}>Nome Completo<RequiredHint /></label>
            <input className={styles.authFormInput} {...register("username")} type="text" autoComplete="name" />
            {!!errors.username && (
              <span className={styles.authInputError}>{errors.username.message}</span>
            )}
          </div>

          {/* Email address */}
          <div className={styles.authFormControl}>
            <label className={styles.authFormLabel}>Email<RequiredHint /></label>
            <input
              className={styles.authFormInput}
              {...emailRest}
              onChange={(e) => {
                onChange(e)
                debouncedEmailCheck()
              }}
              type="email"
              autoComplete="email"
              placeholder="example@company.com"
            />
            {!!errors.email && (
              <span className={styles.authInputError}>{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className={styles.authFormControl}>
            <label className={styles.authFormLabel}>Nova Senha<RequiredHint /></label>
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

          {/* Bottom/Submit */}
          <div className={styles.authFormFooterContainer}>
            <div className={styles.authFooterContents}>
              <button disabled={isLoading} className={styles.submitButton} type="submit">
                Verificar
                {isLoading && (
                  <div className={styles.loaderContainer}>
                    <div className={`loader ${styles.loader}`}></div>
                  </div>
                )}
              </button>
              <Link draggable="false" className={styles.modalSwitcher} to="/login">
                <span>Já tenho conta</span>
                <FaArrowRight />
              </Link>
            </div>
            {!!errors.root && (
              <span className={styles.authInputError}>{errors.root.message}</span>
            )}
          </div>
        </form>
      </div>
    </>
  )
}

function handleEmailTaken(setError: UseFormSetError<SignupFormFields>): void {
  setError('email', {
    type: 'manual',
    message: 'Já existe um usuário cadastrado com este e-mail'
  })
}