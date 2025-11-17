import type { JSX } from "react"

import { FaTrashAlt } from "react-icons/fa"

import styles from "./ModalFooter.module.css"

type ModalFooterProps = {
  setShowDelete: (show: boolean) => void
}

export function ModalFooter({ setShowDelete }: ModalFooterProps): JSX.Element {
  const handleDeleteClick = () => {
    setShowDelete(true)
  }

  return (
    <footer className={styles.footer} onClick={handleDeleteClick}>
      <button className={styles.deleteButton}>
        <FaTrashAlt size={"1.1em"} color="rgba(102, 34, 34, 1)" />
      </button>
      
      <button type="submit" className={styles.saveButton}>Salvar</button>
    </footer>
  )
}