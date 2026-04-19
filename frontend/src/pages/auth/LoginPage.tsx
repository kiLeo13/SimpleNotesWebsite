import type { JSX } from "react"

import { LoginModal } from "@/components/modals/auth/LoginModal"

import styles from "./AuthPage.module.css"
import { useTranslation } from "react-i18next"

export const BASE_ROUTE = 'https://d26143aouxq3ma.cloudfront.net/landscapes'

export function LoginPage(): JSX.Element {
  const { t } = useTranslation()
  const route = `${BASE_ROUTE}/introduce.jpg`

  return (
    <>
      <title>{`${t("app.title")} - Login`}</title>

      <div className={styles.container}>
        <div className={styles.authContainer}>
          <LoginModal />
        </div>

        <div className={styles.presentContainer}>
          <img src={route} draggable="false" />
        </div>
      </div>
    </>
  )
}