import type { JSX } from "react"
import type { UserResponseData } from "@/types/api/users"

import { ConfirmModal } from "@/components/modals/shared/ConfirmModal"
import { userService } from "@/services/userService"
import { toasts } from "@/utils/toastUtils"
import { FiRotateCcw } from "react-icons/fi"
import { useTranslation } from "react-i18next"

type SuspendUserModalProps = {
  user: UserResponseData
  onClose: () => void
}

export function SuspendUserModal({
  user,
  onClose
}: SuspendUserModalProps): JSX.Element {
  const { t } = useTranslation()

  const isSuspended = user.suspended

  const handleToggleSuspension = async () => {
    const newState = !isSuspended
    const resp = await userService.updateUser(user.id, { suspended: newState })

    if (resp.success) {
      user.suspended = newState
      toasts.success(
        newState
          ? t("menus.users.actions.suspend.success")
          : t("menus.users.actions.unsuspend.success")
      )
      onClose()
    } else {
      toasts.apiError(t("menus.users.actions.error"), resp)
      throw new Error("Failed")
    }
  }

  return (
    <ConfirmModal
      title={
        isSuspended
          ? t("menus.users.actions.unsuspend.label")
          : t("menus.users.actions.suspend.label")
      }
      description={
        isSuspended
          ? t("menus.users.actions.unsuspend.ask", { user: user.username })
          : t("menus.users.actions.suspend.ask", { user: user.username })
      }
      confirmLabel={
        isSuspended
          ? t("menus.users.actions.unsuspend.button")
          : t("menus.users.actions.suspend.button")
      }
      icon={isSuspended && <FiRotateCcw size="1.4em" color="#ffc955" />}
      intent={isSuspended ? "warning" : "danger"}
      strategy="simple"
      cooldownDuration={3000}
      onConfirm={handleToggleSuspension}
      onClose={onClose}
    />
  )
}
