import { signupSchema, type SignupFormFields } from "../../../types/schemas/auth"
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

import styles from "./AuthModal.module.css"

export function SignupModal(): JSX.Element {
  const [isEmailVerifying, setIsEmailVerifying] = useState(false)
  const [email, setEmail] = useState('') // Used only to pass to VerificationModal
  const { signup, getUserStatus, isLoading } = useSignup()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<SignupFormFields>({
    resolver: zodResolver(signupSchema)
  })

  const onSubmit: SubmitHandler<SignupFormFields> = async (data) => {
    const userStatusResponse = await getUserStatus(data)
    if (!userStatusResponse.success) {
      displayFormsErrors(userStatusResponse.errors, setError)
      return
    }

    setEmail(data.email)
    const status = userStatusResponse.data.status
    switch (status) {
      case 'TAKEN': {
        handleEmailTaken(setError)
        return
      }
      case 'VERIFYING': {
        setIsEmailVerifying(true)
        return
      }
    }

    const response = await signup(data)
    if (!response.success) {
      displayFormsErrors(response.errors, setError)
      return
    }

    // Send user to e-mail confirmation/verification/validation/whatever you wanna call it
    setIsEmailVerifying(true)
  }

  return (
    <>
      {isEmailVerifying && (
        <DarkWrapper>
          <VerificationModal email={email} />
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
            <input className={styles.authFormInput} {...register("password")} type="password" />
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