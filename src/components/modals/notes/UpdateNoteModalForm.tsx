import { useEffect, useRef, useState, type JSX } from "react"

import { IoMdClose } from "react-icons/io"
import { ModalActionRow } from "./creations/sections/ModalActionRow"

import { FaTrashAlt } from "react-icons/fa"
import { ModalLabel } from "./creations/sections/ModalLabel"
import type { FullNoteResponseData } from "../../../types/api/notes"
import { noteService } from "../../../services/noteService"
import { ModalTextInput } from "./creations/sections/inputs/ModalTextInput"

import styles from "./UpdateNoteModalForm.module.css"

type UpdateNoteModalFormProps = {
  noteId: number
  setIsPatching: (flag: boolean) => void
}

export function UpdateNoteModalForm({ noteId, setIsPatching }: UpdateNoteModalFormProps): JSX.Element {
  const [note, setNote] = useState<FullNoteResponseData | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const handleCloseModal = () => setIsPatching(false)

  useEffect(() => {
    const globalEscapeHandler = (e: KeyboardEvent) => {
      e.stopPropagation()
      if (e.key?.toLowerCase() === 'escape') {
        setIsPatching(false)
      }
    }

    window.addEventListener('keydown', globalEscapeHandler)
    return () => window.removeEventListener('keydown', globalEscapeHandler)
  }, [setIsPatching])

  useEffect(() => {
    const fetchNote = async () => {
      const resp = await noteService.fetchNote(noteId)

      if (resp.success) {
        setNote(resp.data)
      } else {
        alert(`Failed to fetch full note and/or metrics:\n${JSON.stringify(resp.errors, null, 2)}`)
        setIsPatching(false)
      }
    }
    fetchNote()
  }, [noteId, setIsPatching])

  return (
    <div ref={modalRef} className={styles.container}>
      <div className={styles.close} onClick={handleCloseModal}>
        <IoMdClose color="rgba(94, 76, 121, 1)" size={"24px"} />
      </div>

      <h2 className={styles.title}>{`Editar Nota n° ${noteId}`}</h2>

      <div className={styles.form}>

      </div>

      <footer className={styles.footer}>
        <button className={styles.deleteButton}>
          <FaTrashAlt size={"1.1em"} color="rgba(102, 34, 34, 1)" />
        </button>
        <button className={styles.saveButton}>Salvar</button>
      </footer>
    </div>
  )
}