import type { ApiErrorResponse } from "@/types/api/api"
import { toast, type ExternalToast } from "sonner"

import _ from "lodash"

export const toasts = {
  error: (message: string | null, error: ApiErrorResponse, data?: ExternalToast) => {
    const desc = formatToastError(error)

    toast.error(message, {
      description: desc,
      style: {
        color: "#dd7a7aff"
      },
      ...data
    })
  },

  warning: (message: string | null, data?: ExternalToast) => {
    toast.warning(message, {
      style: {
        color: "#b9be66ff"
      },
      ...data
    })
  },

  success: (message: string | null, data?: ExternalToast) => {
    toast.success(message, {
      style: {
        color: "#86dd7aff"
      },
      ...data
    })
  }
}

export function formatToastError(errorResponse: ApiErrorResponse): string {
  const errors = errorResponse.errors

  if (errors.root?.length > 0) {
    return errors.root[0]
  }

  const fieldMessages = Object.entries(errors)
    .map(([field, msgs]) => {
      const fieldName = _.capitalize(field)
      return `• ${fieldName}: ${msgs.join(", ")}`
    })

  if (fieldMessages.length > 0) {
    return fieldMessages.join('\n')
  }
  return "Ocorreu um erro desconhecido."
}