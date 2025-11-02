import { useState, type JSX } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { loginSchema, type LoginFormFields } from "../../../types/schemas/auth"

import RequiredHint from "../../hints/RequiredHint"
import { hasSession } from "../../../utils/authutils"
import { AlreadyAuthWarn } from "../../warns/AlreadyAuthWarn"
import { zodResolver } from "@hookform/resolvers/zod"
import { FaArrowRight } from "react-icons/fa"
import { useLogin } from "../../../hooks/useLogin"
import { Link, useNavigate } from "react-router-dom"

import styles from "./AuthModal.module.css"

export function LoginModal(): JSX.Element {
  const navigate = useNavigate()
  const [showWarn, setShowWarn] = useState(hasSession)
  const { login, isLoading } = useLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormFields>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit: SubmitHandler<LoginFormFields> = async (data) => {
    const response = await login(data)

    if (!response.success) {
      for (const [field, messages] of Object.entries(response.errors)) {
        const fieldName = field as keyof LoginFormFields | "root"
        setError(fieldName, {
          type: "server",
          message: messages.join(", ")
        })
      }
      return
    }

    localStorage.setItem('access_token', response.data.accessToken)
    localStorage.setItem('id_token', response.data.idToken)
    navigate('/')
  }

  return (
    <>
      {showWarn && <AlreadyAuthWarn setShowWarn={setShowWarn} />}

      <div className={styles.authModalContainer}>
        <form className={styles.authForm} onSubmit={handleSubmit(onSubmit)}>
          {/* Email address */}
          <div className={styles.authFormControl}>
            <label className={styles.authFormLabel}>Email<RequiredHint /></label>
            <input autoFocus={!showWarn} className={styles.authFormInput} {...register("email")} type="email" placeholder="example@company.com" />
            {!!errors.email && (
              <span className={styles.authInputError}>{errors.email?.message}</span>
            )}
          </div>

          {/* Password input (STEP_ID = 2) */}
          <div className={styles.authFormControl}>
            <label className={styles.authFormLabel}>Senha<RequiredHint /></label>
            <input className={styles.authFormInput} {...register("password")} type="password" />
            {!!errors.password && (
              <span className={styles.authInputError}>{errors.password?.message}</span>
            )}
          </div>

          {/* Bottom/Submit */}
          <div className={styles.authFormFooterContainer}>
            <div className={styles.authFooterContents}>
              <button disabled={isLoading} className={styles.submitButton} type="submit">
                Login
                {isLoading && (
                  <div className={styles.loaderContainer}>
                    <div className={`loader ${styles.loader}`}></div>
                  </div>
                )}
              </button>
              <Link draggable="false" className={styles.modalSwitcher} to="/register">
                <span>Criar conta</span>
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