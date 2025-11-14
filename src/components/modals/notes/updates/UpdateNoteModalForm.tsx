import type { FullNoteResponseData } from "../../../../types/api/notes"
import type { UserResponseData } from "../../../../types/api/users"
import { useEffect, useRef, useState, type JSX } from "react"
import { noteSchema, type NoteFormFields } from "../../../../types/forms/notes"

import { FormProvider, useForm } from "react-hook-form"
import { ModalActionRow } from "../shared/sections/ModalActionRow"
import { ModalSection } from "../shared/sections/ModalSection"
import { noteService } from "../../../../services/noteService"
import { ModalHeader } from "./ModalHeader"
import { DarkWrapper } from "../../../DarkWrapper"
import { ModalFooter } from "./ModalFooter"
import { zodResolver } from "@hookform/resolvers/zod"
import { userService } from "../../../../services/userService"
import { IoMdClose } from "react-icons/io"
import { ModalLabel } from "../shared/sections/ModalLabel"
import { BaseModalTextInput } from "../shared/inputs/BaseModalTextInput"

import styles from "./UpdateNoteModalForm.module.css"

type UpdateNoteModalFormProps = {
  noteId: number
  setIsPatching: (flag: boolean) => void
}

export function UpdateNoteModalForm({ noteId, setIsPatching }: UpdateNoteModalFormProps): JSX.Element {
  const [note, setNote] = useState<FullNoteResponseData | null>(null)
  const [author, setAuthor] = useState<UserResponseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const handleCloseModal = () => setIsPatching(false)
  const methods = useForm<NoteFormFields>({
    resolver: zodResolver(noteSchema)
  })
  
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
    const fetchAuthor = async (note: FullNoteResponseData) => {
      const resp = await userService.getUserById(note.created_by_id)

      if (resp.success) {
        setAuthor(resp.data)
      } else {
        alert(`Failed to fetch note author:\n${JSON.stringify(resp.errors, null, 2)}`)
      }
    }

    const fetchNote = async () => {
      setIsLoading(true)
      const resp = await noteService.fetchNote(noteId)
      setIsLoading(false)

      if (resp.success) {
        setNote(resp.data)
        fetchAuthor(resp.data)
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
        <DarkWrapper portalContainer={modalRef.current} intensity={0.5} blurpx={0}>
          <div className="loader" />
        </DarkWrapper>
      )}

      <div className={styles.close} onClick={handleCloseModal}>
        <IoMdClose color="rgba(94, 76, 121, 1)" size={"24px"} />
      </div>

      <ModalHeader noteId={noteId} note={note} />

      <FormProvider {...methods}>
        <form className={styles.form}>
          <ModalActionRow>
            <ModalSection
              label={<ModalLabel title="Autor" />}
              input={<BaseModalTextInput disabled value={author?.username ?? "--"} />}
            />
            <ModalSection
              label={<ModalLabel title="Criação" />}
              input={<BaseModalTextInput disabled value={author?.username ?? "--"} />}
            />
          </ModalActionRow>

        </form>
      </FormProvider>

      <ModalFooter />
    </div>
  )
}