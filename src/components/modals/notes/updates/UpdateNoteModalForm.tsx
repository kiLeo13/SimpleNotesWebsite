import type { FullNoteResponseData } from "../../../../types/api/notes"
import { useEffect, useRef, useState, type JSX } from "react"

import { IoMdClose } from "react-icons/io"
import { noteService } from "../../../../services/noteService"
import { ModalHeader } from "./sections/ModalHeader"
import { DarkWrapper } from "../../../DarkWrapper"
import { ModalFooter } from "./sections/ModalFooter"

import styles from "./UpdateNoteModalForm.module.css"

type UpdateNoteModalFormProps = {
  noteId: number
  setIsPatching: (flag: boolean) => void
}

export function UpdateNoteModalForm({ noteId, setIsPatching }: UpdateNoteModalFormProps): JSX.Element {
  const [note, setNote] = useState<FullNoteResponseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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
      setIsLoading(true)
      const resp = await noteService.fetchNote(noteId)
      setIsLoading(false)

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
      {isLoading && (
        <DarkWrapper intensity={0.5} blurpx={0}>
          <div className="loader" />
        </DarkWrapper>
      )}

      <div className={styles.close} onClick={handleCloseModal}>
        <IoMdClose color="rgba(94, 76, 121, 1)" size={"24px"} />
      </div>

      <ModalHeader noteId={noteId} note={note} />

      <div className={styles.form}>

      </div>

      <ModalFooter />
    </div>
  )
}