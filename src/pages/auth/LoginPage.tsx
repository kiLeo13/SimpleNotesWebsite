import type { JSX } from "react"

import { LoginModal } from "../../components/modals/auth/LoginModal"
import { APP_NAME } from "../../App"

import styles from "./AuthPage.module.css"

export const BASE_ROUTE = 'https://d26143aouxq3ma.cloudfront.net/landscapes'

export function LoginPage(): JSX.Element {
  const route = `${BASE_ROUTE}/introduce.jpg`

  return (
    <>
      <title>{`${APP_NAME} - Login`}</title>

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