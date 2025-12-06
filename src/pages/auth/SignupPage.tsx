import type { JSX } from "react"

import { SignupModal } from "@/components/modals/auth/SignupModal"
import { APP_NAME } from "@/App"

import styles from "./AuthPage.module.css"

const BASE_ROUTE = 'https://d26143aouxq3ma.cloudfront.net/landscapes'

export function SignupPage(): JSX.Element {
  const route = `${BASE_ROUTE}/introduce.jpg`

  return (
    <>
      <title>{`${APP_NAME} - Registro`}</title>

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