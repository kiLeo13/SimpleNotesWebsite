import type { JSX } from "react"

import { SignupModal } from "@/components/modals/auth/SignupModal"

import styles from "./AuthPage.module.css"
import { useTranslation } from "react-i18next"

const BASE_ROUTE = 'https://d26143aouxq3ma.cloudfront.net/landscapes'

export function SignupPage(): JSX.Element {
  const { t } = useTranslation()
  const route = `${BASE_ROUTE}/introduce.jpg`

  return (
    <>
      <title>{`${t("app.title")} - Registro`}</title>

      <div className={styles.container}>
        <div className={styles.authContainer}>
          <SignupModal />
        </div>

        <div className={styles.presentContainer}>
          <img src={route} draggable="false" />
        </div>
      </div>
    </>
  )
}