import type { JSX } from "react"

import clsx from "clsx"

import { FaTrashAlt } from "react-icons/fa"
import { Permission } from "@/models/Permission"
import { LoaderWrapper } from "@/components/loader/LoaderWrapper"
import { usePermission } from "@/hooks/usePermission"

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
  setShowDelete: (show: boolean) => void
}

export function ModalFooter({
  exists,
  isDirty,
  isValid,
  isLoading,
  setShowDelete
}: ModalFooterProps): JSX.Element {
  const canSubmit = exists && isDirty && isValid && !isLoading
  const canDelete = usePermission(Permission.DeleteNotes)
  const handleDeleteClick = () => {
    setShowDelete(true)
  }

  return (
    <footer className={styles.footer}>
      {canDelete && (
        <button
          disabled={!exists}
          type="button"
          className={clsx(styles.button, styles.deleteButton)}
          onClick={handleDeleteClick}
        >
          <FaTrashAlt size={"1.1em"} color="rgba(102, 34, 34, 1)" />
        </button>
      )}

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
