import { useState, type JSX } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { loginFormSchema, type LoginFormFields } from "@/types/forms/users"
import { useNavigate } from "@tanstack/react-router"

import { AlreadyAuthWarn } from "@/components/warns/AlreadyAuthWarn"
import { DarkWrapper } from "@/components/DarkWrapper"
import { zodResolver } from "@hookform/resolvers/zod"
import { hasSession } from "@/utils/authutils"
import { displayFormsErrors } from "@/utils/errorHandlerUtils"
import { useSessionStore } from "@/stores/useSessionStore"
import { useTranslation } from "react-i18next"

import { AuthFormFooter } from "./AuthFormFooter"
import { AuthTextField } from "./AuthTextField"
import styles from "./AuthModal.module.css"

export function LoginModal(): JSX.Element {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const login = useSessionStore((s) => s.login)

  const [showWarn, setShowWarn] = useState(hasSession)
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginFormFields>({
    resolver: zodResolver(loginFormSchema)
  })

  const onSubmit: SubmitHandler<LoginFormFields> = async (data) => {
    setIsLoading(true)
    const resp = await login(data)
    setIsLoading(false)
    if (!resp.success) {
      displayFormsErrors(resp.errors, setError)
      return
    }

    void navigate({ to: "/" })
  }

  return (
    <>
      <DarkWrapper
        open={showWarn}
        onOpenChange={setShowWarn}
        animationPreset="pop"
      >
        <AlreadyAuthWarn setShowWarn={setShowWarn} />
      </DarkWrapper>

      <div className={styles.authModalContainer}>
        <form className={styles.authForm} onSubmit={handleSubmit(onSubmit)}>
          <AuthTextField
            id="login-email"
            autoFocus={!showWarn}
            errorMessage={errors.email?.message}
            label={t("modals.auth.email")}
            placeholder={t("modals.auth.emailPlh")}
            type="email"
            {...register("email")}
          />

          <AuthTextField
            id="login-password"
            errorMessage={errors.password?.message}
            label={t("modals.auth.pwd")}
            type="password"
            {...register("password")}
          />

          <AuthFormFooter
            errorMessage={errors.root?.message}
            isLoading={isLoading}
            submitLabel={t("modals.auth.login")}
            switchLabel={t("modals.auth.newAcc")}
            switchTo="/register"
          />
        </form>
      </div>
    </>
  )
}
