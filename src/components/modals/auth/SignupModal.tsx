import { signupSchema, type SignupFormFields } from "../../../types/auth"
import { useState, type JSX } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"

import RequiredHint from "../../hints/RequiredHint"
import { zodResolver } from "@hookform/resolvers/zod"
import { VerificationModal } from "./steps/verification/VerificationModal"
import { FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"
import { useSignup } from "../../../hooks/useSignup"
import { DarkWrapper } from "../../DarkWrapper"

import styles from "./AuthModal.module.css"

export function SignupModal(): JSX.Element {
  const [isEmailVerifying, setIsEmailVerifying] = useState(false)
  const [email, setEmail] = useState("leonardo.silvavieira@hotmail.com")
  const { signup, isLoading } = useSignup()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<SignupFormFields>({
    resolver: zodResolver(signupSchema)
  })

  const onSubmit: SubmitHandler<SignupFormFields> = async (data) => {
    const response = await signup(data)

    if (!response.success) {
      for (const [field, messages] of Object.entries(response.errors)) {
        const fieldName = field as keyof SignupFormFields | "root"
        setError(fieldName, {
          type: "server",
          message: messages.join(", ")
        })
      }
      return
    }

    // Send user to e-mail confirmation/verification/validation/whatever you wanna call it
    setEmail(data.email)
    setIsEmailVerifying(true)
  }

  return (
    <>
      {!isEmailVerifying && (
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