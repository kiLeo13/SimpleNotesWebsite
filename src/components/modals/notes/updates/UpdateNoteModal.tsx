import type { FullNoteResponseData } from "@/types/api/notes"
import { useEffect, useState, type JSX } from "react"
import { updateNoteSchema, type UpdateNoteFormFields } from "@/types/forms/notes"

import { FormProvider, useForm } from "react-hook-form"
import { ModalHeader } from "./ModalHeader"
import { DarkWrapper } from "@/components/DarkWrapper"
import { IoMdClose } from "react-icons/io"
import { UpdateNoteForm } from "./UpdateNoteForm"
import { zodResolver } from "@hookform/resolvers/zod"
import { noteService } from "@/services/noteService"
import { useTranslation } from "react-i18next"
import { toasts } from "@/utils/toastUtils"

import styles from "./UpdateNoteModal.module.css"

type UpdateNoteModalProps = {
  noteId: number
  setIsPatching: (flag: boolean) => void
}

export function UpdateNoteModal({ noteId, setIsPatching }: UpdateNoteModalProps): JSX.Element {
  const { t } = useTranslation()

  const [note, setNote] = useState<FullNoteResponseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const handleCloseModal = () => setIsPatching(false)
  const methods = useForm<UpdateNoteFormFields>({
    resolver: zodResolver(updateNoteSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      visibility: "PUBLIC",
      tags: []
    }
  })
  const { handleSubmit, reset } = methods

  useEffect(() => {
    const globalEscapeHandler = (e: KeyboardEvent) => {
      e.stopPropagation()
      if (e.key?.toLowerCase() === "escape") {
        setIsPatching(false)
      }
    }

    window.addEventListener("keydown", globalEscapeHandler)
    return () => window.removeEventListener("keydown", globalEscapeHandler)
  }, [setIsPatching])

  useEffect(() => {
    const fetchNote = async () => {
      setIsLoading(true)
      const resp = await noteService.fetchNote(noteId)
      setIsLoading(false)

      if (resp.success) {
        setNote(resp.data)

        reset({
          name: resp.data.name,
          visibility: resp.data.visibility,
          tags: resp.data.tags || []
        })
      } else {
        toasts.apiError(t("updateNoteModal.fetchError"), resp)
        setIsPatching(false)
      }
    }
    fetchNote()
  }, [noteId, setIsPatching, reset, t])

  return (
    <div className={styles.container}>
      {isLoading && (
        <DarkWrapper>
          <div className="loader" />
        </DarkWrapper>
      )}

      <div className={styles.close} onClick={handleCloseModal}>
        <IoMdClose color="rgba(94, 76, 121, 1)" size={"24px"} />
      </div>

      <ModalHeader noteId={noteId} note={note} />

      <FormProvider {...methods}>
        <UpdateNoteForm note={note} handleSubmit={handleSubmit} setIsPatching={setIsPatching} />
      </FormProvider>
    </div>
  )
}
