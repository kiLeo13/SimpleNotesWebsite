import { useState, type JSX, type ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/buttons/Button"
import { CgDanger } from "react-icons/cg"
import { BaseModalTextInput } from "../notes/shared/inputs/BaseModalTextInput"
import { IoIosWarning } from "react-icons/io"
import { BsFillInfoCircleFill } from "react-icons/bs"
import { MarkdownDisplay } from "@/components/displays/markdowns/MarkdownDisplay"

import styles from "./ConfirmModal.module.css"

export type ConfirmIntent = "danger" | "warning" | "info"
export type ConfirmStrategy = "simple" | "type_to_confirm"

const stdIcons: Record<ConfirmIntent, React.ReactNode> = {
  danger: <CgDanger size={"1.6em"} color="#ff6161ff" />,
  warning: <IoIosWarning size={"1.6em"} color="#ffbd2e" />,
  info: <BsFillInfoCircleFill size={"1.4em"} color="#8c8cf3" />
}

type ConfirmModalProps = {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  icon?: ReactNode

  onConfirm: () => Promise<void> | void
  onClose: () => void

  intent?: ConfirmIntent
  strategy?: ConfirmStrategy

  validationString?: string

  cooldownDuration?: number
}

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  icon,
  onConfirm,
  onClose,
  intent = "warning",
  strategy = "simple",
  validationString = "",
  cooldownDuration = 0
}: ConfirmModalProps): JSX.Element {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [typedValue, setTypedValue] = useState("")

  const isTypeStrategy = strategy === "type_to_confirm"

  const isMatch = isTypeStrategy ? typedValue === validationString : true

  const isButtonDisabled = isTypeStrategy && !isMatch

  const handleConfirmClick = async () => {
    if (isTypeStrategy && !isMatch) return

    setIsLoading(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error("Modal confirmation failed", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container} data-intent={intent}>
      <div className={styles.heading}>
        {icon || stdIcons[intent]}
        <h2 className={styles.title}>{title}</h2>
      </div>

      <div className={styles.body}>
        <MarkdownDisplay content={description} />

        {isTypeStrategy && validationString && (
          <>
            <span className={styles.prompt}>
              {t("commons.typeToConfirm", { val: validationString })}
            </span>
            <BaseModalTextInput
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              autoFocus
              disabled={isLoading}
            />
          </>
        )}
      </div>

      <div className={styles.footer}>
        <Button
          className={styles.cancel}
          onClick={onClose}
          disabled={isLoading}
        >
          {t("commons.cancel")}
        </Button>

        <Button
          className={styles.confirm}
          cooldown={cooldownDuration || 0}
          isLoading={isLoading}
          disabled={isButtonDisabled}
          onClick={handleConfirmClick}
        >
          {confirmLabel || t("common.confirm")}
        </Button>
      </div>
    </div>
  )
}
