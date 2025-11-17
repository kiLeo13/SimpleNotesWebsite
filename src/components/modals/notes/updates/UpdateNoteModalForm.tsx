import type { FullNoteResponseData } from "../../../../types/api/notes"
import type { UserResponseData } from "../../../../types/api/users"
import { useEffect, useRef, useState, type JSX } from "react"
import { updateNoteSchema, type UpdateNoteFormFields } from "../../../../types/forms/notes"

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
import { formatLocalTimestamp } from "../../../../utils/utils"
import { PiCrownFill } from "react-icons/pi"
import { FaCalendarAlt } from "react-icons/fa"
import { FaEye } from "react-icons/fa"
import { ModalArrayInput } from "../shared/inputs/ModalArrayInput"
import { ModalTextInput } from "../shared/inputs/ModalTextInput"
import { ModalNoteFileView } from "../shared/tiny/ModalNoteFileView"

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
  const methods = useForm<UpdateNoteFormFields>({
    resolver: zodResolver(updateNoteSchema),
    defaultValues: {
      name: "",
      tags: []
    }
  })
  const { handleSubmit, reset } = methods

  const onSubmit = async (data: UpdateNoteFormFields) => {
    alert(JSON.stringify(data, null, 2))
  }

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

        reset({
          name: resp.data.name,
          tags: resp.data.tags || []
        })
      } else {
        alert(`Failed to fetch full note and/or metrics:\n${JSON.stringify(resp.errors, null, 2)}`)
        setIsPatching(false)
      }
    }
    fetchNote()
  }, [noteId, setIsPatching, reset])

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
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <ModalActionRow>
            <ModalSection
              label={<ModalLabel
                icon={<PiCrownFill color="#ada96dff" />}
                title="Autor"
              />}
              input={<BaseModalTextInput disabled value={author?.username ?? "-"} />}
            />
            <ModalSection
              label={<ModalLabel icon={<FaCalendarAlt color="#8ca1b4ff" />} title="Criação" />}
              input={<BaseModalTextInput disabled value={getCreation(note?.created_at)} />}
            />
          </ModalActionRow>

          <ModalActionRow>
            <ModalSection
              label={<ModalLabel icon={<FaEye color="#a085b3ff" />} title="Visibilidade" />}
              input={<BaseModalTextInput disabled value={prettyVisibility(note?.visibility)} />}
            />
            <ModalSection
              label={<ModalLabel icon={<FaCalendarAlt color="#8ca1b4ff" />} title="Última Atualização" />}
              input={<BaseModalTextInput disabled value={getUpdate(note?.created_at, note?.updated_at)} />}
            />
          </ModalActionRow>

          <ModalActionRow>
            <ModalSection
              label={<ModalLabel title="Conteúdo" required />}
              input={<ModalNoteFileView note={note} />}
            />
          </ModalActionRow>

          <div className={styles.division} />

          <ModalActionRow>
            <ModalSection
              label={<ModalLabel title="Nome" required />}
              input={<ModalTextInput name="name" />}
            />
          </ModalActionRow>

          <ModalActionRow>
            <ModalSection
              label={<ModalLabel title="Tags" required={false} />}
              input={<ModalArrayInput name="tags" minLength={2} maxLength={30} placeholder="Digite uma tag..." />}
            />
          </ModalActionRow>

          <ModalFooter />
        </form>
      </FormProvider>
    </div>
  )
}

function prettyVisibility(visibility?: string): string {
  if (!visibility) return '-'
  return visibility === "PUBLIC" ? "Público" : "Confidencial"
}

function getUpdate(creation?: string, date?: string): string {
  // For a simpler user experience, if the note was never updated,
  // we keep this field empty (shows "-").
  return !date || creation === date ? '-' : formatLocalTimestamp(date)
}

function getCreation(date?: string): string {
  return date ? formatLocalTimestamp(date) : '-'
}