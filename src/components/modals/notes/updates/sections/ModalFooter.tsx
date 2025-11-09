import type { JSX } from "react"
import { FaTrashAlt } from "react-icons/fa"

import styles from "./ModalFooter.module.css"

export function ModalFooter(): JSX.Element {
  return (
    <footer className={styles.footer}>
      <button className={styles.deleteButton}>
        <FaTrashAlt size={"1.1em"} color="rgba(102, 34, 34, 1)" />
      </button>
      
      <button className={styles.saveButton}>Salvar</button>
    </footer>
  )
}