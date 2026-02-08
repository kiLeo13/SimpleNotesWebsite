import type { JSX } from "react"

import clsx from "clsx"

import { LoaderWrapper } from "@/components/loader/LoaderWrapper"

import styles from "./ModalFooter.module.css"

type ModalFooterProps = {
  /**
   * This property tracks whether the note is already in memory (exists).
   * If this value is `false`, then we are likely still waiting for a server response.
   */
  exists: boolean
  /**
   * Tracks whether the user has changed some data in the modal.
   */
  isDirty: boolean
  isValid: boolean
  isLoading: boolean
}

export function ModalFooter({
  exists,
  isDirty,
  isValid,
  isLoading
}: ModalFooterProps): JSX.Element {
  const canSubmit = exists && isDirty && isValid && !isLoading

  return (
    <footer className={styles.footer}>
      <LoaderWrapper isLoading={isLoading} loaderProps={{ scale: 0.8 }}>
        <button
          disabled={!canSubmit}
          type="submit"
          className={clsx(styles.button, styles.saveButton)}
        >
          Salvar
        </button>
      </LoaderWrapper>
    </footer>
  )
}
