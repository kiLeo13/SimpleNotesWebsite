import type { DepartmentData, DepartmentIconType } from "@/types/api/departments"

import type { JSX } from "react"
import { FiPlus } from "react-icons/fi"
import { MdDelete, MdSave } from "react-icons/md"
import { useTranslation } from "react-i18next"

import { BaseModalTextInput } from "@/components/modals/notes/shared/inputs/BaseModalTextInput"
import { ModalLabel } from "@/components/modals/notes/shared/sections/ModalLabel"
import { ModalSection } from "@/components/modals/notes/shared/sections/ModalSection"
import { Button } from "@/components/ui/buttons/Button"
import { getDepartmentIconUrl } from "@/utils/departmentIcons"

import { DepartmentColorPicker } from "./DepartmentColorPicker"
import { IconPicker } from "./IconPicker"
import styles from "./DepartmentDetailsForm.module.css"

type DepartmentDetailsFormProps = {
  mode: "create" | "edit"
  name: string
  iconType: DepartmentIconType
  emoji: string
  iconFile: File | null
  colorRGBA: number | null
  isSaving: boolean
  department?: DepartmentData
  onNameChange: (name: string) => void
  onEmojiChange: (emoji: string) => void
  onFileChange: (file: File | null) => void
  onRemoveIcon: () => void
  onColorChange: (colorRGBA: number | null) => void
  onSubmit: () => void
  onCancel?: () => void
  onDelete?: () => void
}

export function DepartmentDetailsForm({
  mode,
  name,
  iconType,
  emoji,
  iconFile,
  colorRGBA,
  isSaving,
  department,
  onNameChange,
  onEmojiChange,
  onFileChange,
  onRemoveIcon,
  onColorChange,
  onSubmit,
  onCancel,
  onDelete
}: DepartmentDetailsFormProps): JSX.Element {
  const { t } = useTranslation()
  const isCreate = mode === "create"
  const currentImageSrc =
    department?.icon_type === "IMAGE" ? getDepartmentIconUrl(department.icon_value) : undefined

  return (
    <main className={styles.panel}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          {isCreate && <FiPlus size={16} />}
          <h3>
            {isCreate
              ? t("departments.management.create")
              : t("departments.management.details")}
          </h3>
        </div>

        <div className={styles.form}>
          <ModalSection
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

          <ModalSection
            label={<ModalLabel title={t("departments.fields.icon")} />}
            input={
              <IconPicker
                iconType={iconType}
                emoji={emoji}
                selectedFile={iconFile}
                currentImageSrc={currentImageSrc}
                onEmojiChange={onEmojiChange}
                onFileChange={onFileChange}
                onRemoveIcon={onRemoveIcon}
              />
            }
          />

          <ModalSection
            label={<ModalLabel title={t("departments.fields.color")} />}
            input={
              <>
                <span className={styles.colorHint}>
                  {t("departments.fields.colorHint")}
                </span>
                <DepartmentColorPicker
                  value={colorRGBA}
                  onChange={onColorChange}
                />
              </>
            }
          />

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
