import type { FullNoteResponseData } from "@/types/api/notes"
import type { UserResponseData } from "@/types/api/users"
import { useFormContext, type UseFormHandleSubmit } from "react-hook-form"
import { useEffect, useState, type JSX } from "react"
import { VISIBILITY_OPTIONS, type UpdateNoteFormFields } from "@/types/forms/notes"

import { isEmpty } from "lodash-es"
import { ModalSection } from "../shared/sections/ModalSection"
import { ModalActionRow } from "../shared/sections/ModalActionRow"
import { ModalLabel } from "../shared/sections/ModalLabel"
import { PiCrownFill } from "react-icons/pi"
import { BaseModalTextInput } from "../shared/inputs/BaseModalTextInput"
import { FaCalendarAlt } from "react-icons/fa"
import { ModalFooter } from "./ModalFooter"
import { ModalArrayInput } from "../shared/inputs/ModalArrayInput"
import { ModalTextInput } from "../shared/inputs/ModalTextInput"
import { ModalNoteFileView } from "../shared/tiny/ModalNoteFileView"
import { FaEye } from "react-icons/fa6"
import { DarkWrapper } from "@/components/DarkWrapper"
import { DeleteNoteModal } from "./DeleteNoteModal"
import { ModalSelectInput } from "../shared/inputs/ModalSelectInput"
import { userService } from "@/services/userService"
import { formatLocalTimestamp, getDirtyValues } from "@/utils/utils"
import { useNoteStore } from "@/stores/useNotesStore"
import { useTranslation } from "react-i18next"
import { toasts } from "@/utils/toastUtils"

import styles from "./UpdateNoteForm.module.css"

type UpdateNoteFormProps = {
  note: FullNoteResponseData | null
  handleSubmit: UseFormHandleSubmit<UpdateNoteFormFields>
  setIsPatching: (show: boolean) => void
}

export function UpdateNoteForm({
  note,
  handleSubmit,
  setIsPatching
}: UpdateNoteFormProps): JSX.Element {
  const {
    formState: { isDirty, isValid, dirtyFields }
  } = useFormContext<UpdateNoteFormFields>()
  const { t } = useTranslation()

  // Local UI
  const [author, setAuthor] = useState<UserResponseData | null>(null)
  const [showDelete, setShowDelete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Store Actions
  const updateNoteAndRefresh = useNoteStore((state) => state.updateNoteAndRefresh)
  const viewOptions = [...VISIBILITY_OPTIONS].map((o) => ({
    label: t(o.label),
    value: o.value
  }))

  const onSubmit = async (data: UpdateNoteFormFields) => {
    const payload = getDirtyValues(dirtyFields, data)
    if (isEmpty(payload)) {
      setIsPatching(false)
      return
    }

    setIsLoading(true)
    const success = await updateNoteAndRefresh(note!.id, payload)
    setIsLoading(false)

    if (success) {
      setIsPatching(false)
    }
  }

  useEffect(() => {
    const fetchAuthor = async (note: FullNoteResponseData) => {
      const resp = await userService.getUserById(note.created_by_id)
      if (!resp.success) {
        toasts.apiError(t("errors.noteAuthor"), resp)
        return
      }

      setAuthor(resp.data)
    }

    if (note) fetchAuthor(note)
  }, [note, t])

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <ModalActionRow>
        <ModalSection
          label={
            <ModalLabel
              icon={<PiCrownFill color="#ada96dff" />}
              title={t("updateNoteModal.author")}
            />
          }
          input={<BaseModalTextInput disabled value={author?.username ?? "-"} />}
        />
        <ModalSection
          label={
            <ModalLabel
              icon={<FaCalendarAlt color="#8ca1b4ff" />}
              title={t("updateNoteModal.creationTime")}
            />
          }
          input={<BaseModalTextInput disabled value={getCreation(note?.created_at)} />}
        />
      </ModalActionRow>

      <ModalActionRow>
        <ModalSection
          label={
            <ModalLabel
              icon={<FaEye color="#a085b3ff" />}
              title={t("updateNoteModal.visibility")}
            />
          }
          input={<ModalSelectInput name="visibility" options={viewOptions} />}
        />
        <ModalSection
          label={
            <ModalLabel
              icon={<FaCalendarAlt color="#8ca1b4ff" />}
              title={t("updateNoteModal.lastUpdate")}
            />
          }
          input={
            <BaseModalTextInput disabled value={getUpdate(note?.created_at, note?.updated_at)} />
          }
        />
      </ModalActionRow>

      <ModalActionRow>
        <ModalSection
          label={<ModalLabel title={t("updateNoteModal.content")} required />}
          input={<ModalNoteFileView note={note} />}
        />
      </ModalActionRow>

      <div className={styles.division} />

      <ModalActionRow>
        <ModalSection
          label={<ModalLabel title={t("updateNoteModal.name")} required />}
          input={<ModalTextInput name="name" />}
        />
      </ModalActionRow>

      <ModalActionRow>
        <ModalSection
          label={<ModalLabel title={t("updateNoteModal.tags")} required={false} />}
          input={
            <ModalArrayInput
              name="tags"
              minLength={2}
              maxLength={30}
              placeholder={t("updateNoteModal.tagsPlaceholder")}
            />
          }
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
        <DarkWrapper zIndex={50}>
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
  return !date || creation === date ? "-" : formatLocalTimestamp(date)
}

function getCreation(date?: string): string {
  return date ? formatLocalTimestamp(date) : "-"
}
