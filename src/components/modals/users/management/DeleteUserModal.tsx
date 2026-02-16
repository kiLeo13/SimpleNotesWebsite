import type { JSX } from "react"
import type { UserResponseData } from "@/types/api/users"

import { ConfirmModal } from "@/components/modals/shared/ConfirmModal"
import { userService } from "@/services/userService"
import { toasts } from "@/utils/toastUtils"
import { useTranslation } from "react-i18next"

type DeleteUserModalProps = {
  user: UserResponseData
  onClose: () => void
}

export function DeleteUserModal({
  user,
  onClose
}: DeleteUserModalProps): JSX.Element {
  const { t } = useTranslation()

  const handleDelete = async () => {
    const resp = await userService.deleteUser(user.id)
    if (resp.success) {
      toasts.success(t("menus.users.actions.delete.success"))
      onClose()
    } else {
      toasts.apiError("Error", resp)
    }
  }

  return (
    <ConfirmModal
      title={t("menus.users.actions.delete.label")}
      description={t("menus.users.actions.delete.ask", { user: user.username })}
      confirmLabel={t("commons.delete")}
      intent="danger"
      strategy="type_to_confirm"
      validationString={user.username}
      onConfirm={handleDelete}
      onClose={onClose}
    />
  )
}
