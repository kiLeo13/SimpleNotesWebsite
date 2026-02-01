import { useState, type JSX } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { loginSchema, type LoginFormFields } from "@/types/forms/users"

import RequiredHint from "@/components/hints/RequiredHint"

import { AlreadyAuthWarn } from "@/components/warns/AlreadyAuthWarn"
import { FaArrowRight } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { LoaderWrapper } from "@/components/loader/LoaderWrapper"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAsync } from "@/hooks/useAsync"
import { hasSession } from "@/utils/authutils"
import { userService } from "@/services/userService"
import { displayFormsErrors } from "@/utils/errorHandlerUtils"
import { useTranslation } from "react-i18next"

import styles from "./AuthModal.module.css"

export function LoginModal(): JSX.Element {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [showWarn, setShowWarn] = useState(hasSession)
  const [login, isLoading] = useAsync(userService.login)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormFields>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit: SubmitHandler<LoginFormFields> = async (data) => {
    const resp = await login(data)
    if (!resp.success) {
      displayFormsErrors(resp.errors, setError)
      return
    }

    localStorage.setItem("access_token", resp.data.accessToken)
    localStorage.setItem("id_token", resp.data.idToken)
    navigate("/")
  }

  return (
    <>
      {showWarn && <AlreadyAuthWarn setShowWarn={setShowWarn} />}

      <div className={styles.authModalContainer}>
        <form className={styles.authForm} onSubmit={handleSubmit(onSubmit)}>
          {/* Email address */}
          <div className={styles.authFormControl}>
            <label className={styles.authFormLabel}>
              {t("modals.auth.email")}
              <RequiredHint />
            </label>
            <input
              autoFocus={!showWarn}
              className={styles.authFormInput}
              {...register("email")}
              type="email"
              placeholder={t("modals.auth.emailPlh")}
            />
            {!!errors.email && (
              <span className={styles.authInputError}>{errors.email?.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className={styles.authFormControl}>
            <label className={styles.authFormLabel}>
              {t("modals.auth.pwd")}
              <RequiredHint />
            </label>
            <input className={styles.authFormInput} {...register("password")} type="password" />
            {!!errors.password && (
              <span className={styles.authInputError}>{errors.password?.message}</span>
            )}
          </div>

          {/* Bottom/Submit */}
          <div className={styles.authFormFooterContainer}>
            <div className={styles.authFooterContents}>
              <LoaderWrapper isLoading={isLoading} loaderProps={{ scale: 0.8 }}>
                <button disabled={isLoading} className={styles.submitButton} type="submit">
                  {t("modals.auth.login")}
                </button>
              </LoaderWrapper>
              <Link draggable="false" className={styles.modalSwitcher} to="/register">
                <span>{t("modals.auth.newAcc")}</span>
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
