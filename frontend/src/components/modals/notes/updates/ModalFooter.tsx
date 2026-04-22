import type { JSX } from "react"

import clsx from "clsx"

import { AppTooltip } from "@/components/ui/AppTooltip"
import { Button } from "@/components/ui/buttons/Button"
import { LuSave } from "react-icons/lu"
import { useTranslation } from "react-i18next"

import styles from "./ModalFooter.module.css"

type ModalFooterProps = {
  /**
   * This property tracks whether the note is already in memory (exists).
   * If this value is `false`, then we are likely still waiting for a server response.
   */
  exists: boolean
  /**
   * Tracks whether the user has changed some data in the modal.
   */
  isDirty: boolean
  isValid: boolean
  isLoading: boolean
}

export function ModalFooter({
  exists,
  isDirty,
  isValid,
  isLoading
}: ModalFooterProps): JSX.Element {
  const { t } = useTranslation()

  const canSubmit = exists && isDirty && isValid && !isLoading
  const saveLabel = t("commons.save")

  return (
    <div
      className={styles.footer}
      role="toolbar"
      aria-label={t("updateNoteModal.actions")}
    >
      <AppTooltip label={saveLabel} side="right">
        <Button
          aria-label={saveLabel}
          isLoading={isLoading}
          loaderProps={{ scale: 0.8 }}
          disabled={!canSubmit}
          type="submit"
          className={clsx(styles.button, styles.saveButton)}
        >
          <LuSave size={18} aria-hidden="true" />
        </Button>
      </AppTooltip>
    </div>
  )
}
