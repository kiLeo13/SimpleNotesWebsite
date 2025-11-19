import type { JSX } from "react"

import { FaTrashAlt } from "react-icons/fa"

import clsx from "clsx"

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
  isLoading: boolean
  setShowDelete: (show: boolean) => void
}

export function ModalFooter({ exists, isDirty, isLoading, setShowDelete }: ModalFooterProps): JSX.Element {
  const canSubmit = exists && isDirty && !isLoading
  const handleDeleteClick = () => {
    setShowDelete(true)
  }

  return (
    <footer className={styles.footer}>
      <button disabled={!exists} type="button" className={styles.deleteButton} onClick={handleDeleteClick}>
        <FaTrashAlt size={"1.1em"} color="rgba(102, 34, 34, 1)" />
      </button>

      <button disabled={!canSubmit} type="submit" className={styles.saveButton}>
        Salvar
        {isLoading && (
          <div className={styles.loaderContainer}>
            <div className={clsx("loader", styles.buttonLoader)}></div>
          </div>
        )}
      </button>
    </footer>
  )
}