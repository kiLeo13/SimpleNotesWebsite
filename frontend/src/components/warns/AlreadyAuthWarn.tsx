import { useEffect, useState, type JSX } from "react"

import clsx from "clsx"

import { IoIosWarning } from "react-icons/io"
import { MarkdownDisplay } from "../displays/markdowns/MarkdownDisplay"
import { Link } from "react-router-dom"
import { getTokenRemainingSeconds } from "@/utils/authutils"
import { formatTimeSeconds } from "@/utils/utils"
import { useTranslation } from "react-i18next"

import styles from "./AlreadyAuthWarn.module.css"

type AlreadyAuthWarnProps = {
  setShowWarn: (isLoggedIn: boolean) => void
}

export function AlreadyAuthWarn({ setShowWarn }: AlreadyAuthWarnProps): JSX.Element {
  const { t } = useTranslation()
  const getTokenTime = () => {
    const idToken = localStorage.getItem("id_token")
    return !idToken ? 0 : getTokenRemainingSeconds(idToken)
  }
  const [remainingSeconds, setRemainingSeconds] = useState(getTokenTime)

  useEffect(() => {
    if (remainingSeconds <= 0) return

    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [remainingSeconds])

  const handleConfirmClick = () => setShowWarn(false)
  const prettyRemain = formatTimeSeconds(remainingSeconds)

  return (
    <div className={styles.container}>
      <div className={styles.warningTitle}>
        <IoIosWarning className={styles.warnIcon} />
        {t("modals.auth.warn.title")}
      </div>

      <div className={styles.warnMessageBox}>
        <span>
          {t("modals.auth.warn.subtitle")}
          <br />
          <span className={styles.disclaimer}>{t("modals.auth.warn.subtle")}</span>
        </span>
        <span className={styles.countdown}>
          <MarkdownDisplay content={t("modals.auth.warn.countdown", { time: prettyRemain })} />
        </span>
      </div>
      <div className={styles.division} />
      <div className={styles.warnFooter}>
        <div className={clsx(styles.loginButton, styles.button)} onClick={handleConfirmClick}>
          {t("modals.auth.warn.proceed")}
        </div>
        <Link className={clsx(styles.dropLoginButton, styles.button)} to="/">
          {t("modals.auth.warn.back")}
        </Link>
      </div>
    </div>
  )
}
