import { useEffect, type JSX } from "react"
import {
  updateNoteSchema,
  type UpdateNoteFormFields
} from "@/types/forms/notes"

import { FormProvider, useForm } from "react-hook-form"
import { ModalHeader } from "./ModalHeader"
import { IoMdClose } from "react-icons/io"
import { UpdateNoteForm } from "./UpdateNoteForm"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNoteStore } from "@/stores/useNotesStore"
import { useTranslation } from "react-i18next"
import { toasts } from "@/utils/toastUtils"

import styles from "./UpdateNoteModal.module.css"

type UpdateNoteModalProps = {
  noteId: number
  setIsPatching: (flag: boolean) => void
}

export function UpdateNoteModal({
  noteId,
  setIsPatching
}: UpdateNoteModalProps): JSX.Element {
  const { t } = useTranslation()

  const getNoteById = useNoteStore((s) => s.getNoteById)
  const note = getNoteById(noteId)

  const methods = useForm<UpdateNoteFormFields>({
    resolver: zodResolver(updateNoteSchema),
    mode: "onChange",
    defaultValues: {
      name: note?.name || "",
      visibility: note?.visibility || "PUBLIC",
      tags: note?.tags || []
    }
  })
  const { handleSubmit, reset } = methods

  useEffect(() => {
    if (!note) {
      toasts.error(t("updateNoteModal.fetchError"))
      setIsPatching(false)
    } else {
      reset({
        name: note.name,
        visibility: note.visibility,
        tags: note.tags || []
      })
    }
  }, [note, reset, setIsPatching, t])

  return (
    <div className={styles.container}>
      <div className={styles.close} onClick={() => setIsPatching(false)}>
        <IoMdClose color="rgba(94, 76, 121, 1)" size={"24px"} />
      </div>

      <ModalHeader note={note} />

      <FormProvider {...methods}>
        <UpdateNoteForm
          note={note}
          handleSubmit={handleSubmit}
          setIsPatching={setIsPatching}
        />
      </FormProvider>
    </div>
  )
}
