import type { FullNoteResponseData } from "../../../../types/api/notes"
import type { UserResponseData } from "../../../../types/api/users"
import { useFormContext, type UseFormHandleSubmit } from "react-hook-form"
import { useEffect, useState, type JSX } from "react"
import { VISIBILITY_OPTIONS, type UpdateNoteFormFields } from "../../../../types/forms/notes"

import { userService } from "../../../../services/userService"
import { ModalSection } from "../shared/sections/ModalSection"
import { ModalActionRow } from "../shared/sections/ModalActionRow"
import { ModalLabel } from "../shared/sections/ModalLabel"
import { PiCrownFill } from "react-icons/pi"
import { BaseModalTextInput } from "../shared/inputs/BaseModalTextInput"
import { FaCalendarAlt } from "react-icons/fa"
import { formatLocalTimestamp, getDirtyValues } from "../../../../utils/utils"
import { ModalFooter } from "./ModalFooter"
import { ModalArrayInput } from "../shared/inputs/ModalArrayInput"
import { ModalTextInput } from "../shared/inputs/ModalTextInput"
import { ModalNoteFileView } from "../shared/tiny/ModalNoteFileView"
import { FaEye } from "react-icons/fa6"
import { DarkWrapper } from "../../../DarkWrapper"
import { DeleteNoteModal } from "./DeleteNoteModal"
import { noteService } from "../../../../services/noteService"
import { ModalSelectInput } from "../shared/inputs/ModalSelectInput"
import { useAsync } from "../../../../hooks/useAsync"

import _ from "lodash"

import styles from "./UpdateNoteForm.module.css"

type UpdateNoteFormProps = {
  note: FullNoteResponseData | null
  handleSubmit: UseFormHandleSubmit<UpdateNoteFormFields>
  setIsPatching: (show: boolean) => void
}

export function UpdateNoteForm({ note, handleSubmit, setIsPatching }: UpdateNoteFormProps): JSX.Element {
  const { formState: { isDirty, isValid, dirtyFields } } = useFormContext<UpdateNoteFormFields>()
  const [author, setAuthor] = useState<UserResponseData | null>(null)
  const [showDelete, setShowDelete] = useState(false)
  const [update, isLoading] = useAsync(noteService.updateNote)

  const onSubmit = async (data: UpdateNoteFormFields) => {
    const payload = getDirtyValues(dirtyFields, data)
    if (_.isEmpty(payload)) {
      setIsPatching(false)
      return
    }

    const resp = await update(note!.id, payload)

    if (!resp.success) {
      alert(`Error:\n${JSON.stringify(resp.errors, null, 2)}`)
      return
    }
    setIsPatching(false)
  }

  useEffect(() => {
    const fetchAuthor = async (note: FullNoteResponseData) => {
      const resp = await userService.getUserById(note.created_by_id)

      if (resp.success) {
        setAuthor(resp.data)
      } else {
        alert(`Failed to fetch note author:\n${JSON.stringify(resp.errors, null, 2)}`)
      }
    }

    if (note) fetchAuthor(note)
  }, [note])

  return (
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

      {/* The issue is at not declaring the `visibility` as editable */}

      <ModalActionRow>
        <ModalSection
          label={<ModalLabel icon={<FaEye color="#a085b3ff" />} title="Visibilidade" />}
          input={<ModalSelectInput name="visibility" options={VISIBILITY_OPTIONS} />}
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

      <ModalFooter
        exists={!!note}
        setShowDelete={setShowDelete}
        isDirty={isDirty}
        isValid={isValid}
        isLoading={isLoading}
      />

      {/* The delete confirmation modal */}
      {showDelete && (
        <DarkWrapper>
          <DeleteNoteModal
            note={note!}
            setShowDelete={setShowDelete}
            setIsPatching={setIsPatching}
          />
        </DarkWrapper>
      )}
    </form>
  )
}

function getUpdate(creation?: string, date?: string): string {
  // For a simpler user experience, if the note was never updated,
  // we keep this field empty (shows "-").
  return !date || creation === date ? '-' : formatLocalTimestamp(date)
}

function getCreation(date?: string): string {
  return date ? formatLocalTimestamp(date) : '-'
}