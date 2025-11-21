import { signupSchema, type SignupFormFields } from "../../../types/forms/users"
import { useState, type JSX } from "react"
import { useForm, type SubmitHandler, type UseFormSetError } from "react-hook-form"

import RequiredHint from "../../hints/RequiredHint"

import { zodResolver } from "@hookform/resolvers/zod"
import { VerificationModal } from "./steps/verification/VerificationModal"
import { FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"
import { useSignup } from "../../../hooks/useSignup"
import { DarkWrapper } from "../../DarkWrapper"
import { displayFormsErrors } from "../../../utils/errorHandlerUtils"
import { PasswordRules } from "./PasswordRules"

import styles from "./AuthModal.module.css"

export function SignupModal(): JSX.Element {
  const [isEmailVerifying, setIsEmailVerifying] = useState(false)
  const [showPwdChecks, setShowPwdChecks] = useState(false)
  const { signup, getUserStatus, isLoading } = useSignup()
  const {
    register,
    handleSubmit,
    setError,
    control,
    getValues,
    formState: { errors }
  } = useForm<SignupFormFields>({
    mode: "onChange",
    resolver: zodResolver(signupSchema)
  })
  const { onBlur, ...passwordRest } = register('password')

  const onSubmit: SubmitHandler<SignupFormFields> = async (data) => {
    const statusResp = await getUserStatus(data)
    if (!statusResp.success) {
      displayFormsErrors(statusResp.errors, setError)
      return
    }

    switch (statusResp.data.status) {
      case 'TAKEN': {
        handleEmailTaken(setError)
        return
      }
      case 'VERIFYING': {
        setIsEmailVerifying(true)
        return
      }
    }

    const resp = await signup(data)
    if (!resp.success) {
      displayFormsErrors(resp.errors, setError)
      return
    }

    // Send user to e-mail confirmation/verification/validation/whatever you wanna call it
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
            <input className={styles.authFormInput} {...register("email")} type="email" autoComplete="email" placeholder="example@company.com" />
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
    message: 'Já existe um usuário cadastrado com este e-mail.'
  })
}