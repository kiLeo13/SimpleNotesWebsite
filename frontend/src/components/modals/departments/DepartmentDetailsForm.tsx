import type { DepartmentData } from "@/types/api/departments"

import type { JSX } from "react"
import { FiPlus } from "react-icons/fi"
import { MdDelete, MdSave } from "react-icons/md"
import { useTranslation } from "react-i18next"

import { DepartmentIcon } from "@/components/departments/DepartmentIcon"
import { BaseModalTextInput } from "@/components/modals/notes/shared/inputs/BaseModalTextInput"
import { ModalLabel } from "@/components/modals/notes/shared/sections/ModalLabel"
import { ModalSection } from "@/components/modals/notes/shared/sections/ModalSection"
import { Button } from "@/components/ui/buttons/Button"

import { IconPicker } from "./IconPicker"
import styles from "./DepartmentDetailsForm.module.css"

type DepartmentDetailsFormProps = {
  mode: "create" | "edit"
  name: string
  emoji: string
  isSaving: boolean
  iconFileName?: string
  department?: DepartmentData
  onNameChange: (name: string) => void
  onEmojiChange: (emoji: string) => void
  onFileChange: (file: File | null) => void
  onSubmit: () => void
  onCancel?: () => void
  onDelete?: () => void
}

export function DepartmentDetailsForm({
  mode,
  name,
  emoji,
  isSaving,
  iconFileName,
  department,
  onNameChange,
  onEmojiChange,
  onFileChange,
  onSubmit,
  onCancel,
  onDelete
}: DepartmentDetailsFormProps): JSX.Element {
  const { t } = useTranslation()
  const isCreate = mode === "create"

  return (
    <main className={styles.panel}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          {isCreate ? (
            <FiPlus size={16} />
          ) : department ? (
            <DepartmentIcon department={department} className={styles.sectionIcon} />
          ) : null}
          <h3>
            {isCreate
              ? t("departments.management.create")
              : t("departments.management.details")}
          </h3>
        </div>

        <div className={styles.form}>
          <div className={styles.iconAndName}>
            <IconPicker
              emoji={emoji}
              onEmojiChange={onEmojiChange}
              onFileChange={onFileChange}
              currentFileName={iconFileName}
            />
            <ModalSection
              className={styles.nameField}
              label={<ModalLabel title={t("departments.fields.name")} required />}
              input={
                <BaseModalTextInput
                  value={name}
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder={
                    isCreate
                      ? t("departments.fields.namePlaceholder")
                      : t("departments.fields.name")
                  }
                />
              }
            />
          </div>

          <div className={styles.actions}>
            <Button
              className={styles.primaryButton}
              disabled={isSaving || !name.trim()}
              isLoading={isSaving}
              onClick={onSubmit}
            >
              {isCreate ? <FiPlus size={16} /> : <MdSave size={16} />}
              {isCreate ? t("departments.actions.create") : t("commons.save")}
            </Button>

            {isCreate ? (
              <Button className={styles.secondaryButton} onClick={onCancel}>
                {t("commons.cancel")}
              </Button>
            ) : (
              <Button className={styles.dangerButton} onClick={onDelete}>
                <MdDelete size={16} />
                {t("commons.delete")}
              </Button>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
