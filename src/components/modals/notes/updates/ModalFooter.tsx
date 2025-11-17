import type { JSX } from "react"

import { FaTrashAlt } from "react-icons/fa"

import styles from "./ModalFooter.module.css"

type ModalFooterProps = {
  /**
   * This property tracks whether the note is already in memory (exists).
   * If this value is `false`, then we are likely still waiting for a server response.
   */
  exists: boolean
  setShowDelete: (show: boolean) => void
}

export function ModalFooter({ exists, setShowDelete }: ModalFooterProps): JSX.Element {
  const handleDeleteClick = () => {
    setShowDelete(true)
  }

  return (
    <footer className={styles.footer} onClick={handleDeleteClick}>
      <button disabled={!exists} className={styles.deleteButton}>
        <FaTrashAlt size={"1.1em"} color="rgba(102, 34, 34, 1)" />
      </button>
      
      <button disabled={!exists} type="submit" className={styles.saveButton}>Salvar</button>
    </footer>
  )
}