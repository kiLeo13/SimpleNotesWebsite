import type { JSX } from "react"

import { SignupModal } from "../../components/modals/auth/SignupModal"
import { APP_NAME } from "../../App"

import styles from "./AuthPage.module.css"

export function SignupPage(): JSX.Element {
  return (
    <>
      <title>{`${APP_NAME} - Registro`}</title>

      <div className={styles.container}>
        <div className={styles.authContainer}>
          <SignupModal />
        </div>

        <div className={styles.presentContainer}>
          <img src="/images/introduce.png" draggable="false" />
        </div>
      </div>
    </>
  )
}