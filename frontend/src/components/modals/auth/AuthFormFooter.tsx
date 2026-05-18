import type { JSX, ReactNode } from "react"

import { Link } from "@tanstack/react-router"
import { FaArrowRight } from "react-icons/fa"

import { Button } from "@/components/ui/buttons/Button"

import styles from "./AuthModal.module.css"

type AuthFormFooterProps = {
  isLoading: boolean
  submitLabel: string
  switchTo: "/login" | "/register"
  switchLabel: string
  errorMessage?: ReactNode
}

export function AuthFormFooter({
  isLoading,
  submitLabel,
  switchTo,
  switchLabel,
  errorMessage
}: AuthFormFooterProps): JSX.Element {
  return (
    <div className={styles.authFormFooterContainer}>
      <div className={styles.authFooterContents}>
        <Button
          className={styles.submitButton}
          disabled={isLoading}
          isLoading={isLoading}
          loaderProps={{ scale: 0.8 }}
          type="submit"
        >
          {submitLabel}
        </Button>

        <Link draggable="false" className={styles.modalSwitcher} to={switchTo}>
          <span>{switchLabel}</span>
          <FaArrowRight aria-hidden="true" />
        </Link>
      </div>

      {errorMessage && (
        <span className={styles.authInputError}>{errorMessage}</span>
      )}
    </div>
  )
}
