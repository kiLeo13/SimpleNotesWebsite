import { useEffect, useRef, useState, type JSX } from "react"

import RequiredHint from "@/components/hints/RequiredHint"

import { Button } from "@/components/ui/buttons/Button"
import { isOnlyDigit } from "@/utils/utils"
import { useAsync } from "@/hooks/useAsync"
import { userService } from "@/services/userService"
import { useSessionStore } from "@/stores/useSessionStore"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { isNumber } from "lodash-es"
import { toasts } from "@/utils/toastUtils"

import authStyles from "../../AuthModal.module.css"
import styles from "./VerificationModal.module.css"

type VerificationModalProps = {
  email: string
  password: string
}

export function VerificationModal({
  email,
  password
}: VerificationModalProps): JSX.Element {
  const { t } = useTranslation()
  const [code, setCode] = useState("")
  const [verify, isLoading] = useAsync(userService.verifyEmail)

  const navigate = useNavigate()
  const login = useSessionStore((s) => s.login)
  const codeInRef = useRef<HTMLInputElement>(null)
  const isValid = isNumber(code) || code.length === 6

  useEffect(() => {
    codeInRef?.current?.focus()
  }, [])

  const codeTypeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim()
    if (val.length <= 6 && (val === "" || isOnlyDigit(val))) {
      setCode(val)
    }
  }

  const verifyHandler = async (e: React.FormEvent) => {
    e.preventDefault()
    const resp = await verify({ code: code, email: email })

    if (!resp.success) {
      toasts.apiError(t("errors.verifyEmail"), resp)
      return
    }

    const loginResp = await login({ email: email, password: password })
    if (!loginResp.success) {
      toasts.apiError(t("errors.verifyEmail"), loginResp)
      return
    }

    navigate("/")
  }

  return (
    <div className={styles.modalWrapper}>
      <header className={styles.verifyHeader}>
        <h2 className={styles.verifyTitle}>{t("modals.verify.title")}</h2>
        <p className={styles.verifySubtitle}>{t("modals.verify.subtitle")}</p>
      </header>
      <div className={styles.division}></div>
      <form className={styles.verifyForm} onSubmit={verifyHandler}>
        <div className={styles.verifyFormControl}>
          <label className={styles.verifyFormLabel} htmlFor="email-input">
            {t("modals.verify.email")}
            <RequiredHint />
          </label>
          <input
            disabled
            className={styles.verifyFormInput}
            id="email-input"
            type="email"
            value={email}
          />
        </div>
        <div className={styles.verifyFormControl}>
          <label className={styles.verifyFormLabel} htmlFor="code-input">
            {t("modals.verify.code")}
            <RequiredHint />
          </label>
          <input
            className={styles.verifyFormInput}
            ref={codeInRef}
            id="code-input"
            type="text"
            onChange={codeTypeHandler}
            value={code}
          />
        </div>
        <footer className={styles.verifyFooter}>
          <Button
            className={authStyles.submitButton}
            disabled={isLoading || !isValid}
            isLoading={isLoading}
            type="submit"
            loaderProps={{
              scale: 0.7
            }}
          >
            {t("modals.verify.confirm")}
          </Button>
        </footer>
      </form>
    </div>
  )
}
