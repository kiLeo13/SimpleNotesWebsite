import type { ConfirmFormFields } from "../types/auth"
import type { ApiResponse, ConfirmResponseData } from "../types/api"

import { useState } from "react"
import { authService } from "../services/authService"

export function useConfirm() {
  const [isLoading, setIsLoading] = useState(false)

  const confirm = async (data: ConfirmFormFields): Promise<ApiResponse<ConfirmResponseData>> => {
    setIsLoading(true)

    const result = await authService.verifyEmail(data)
    setIsLoading(false)
    return result
  }

  return { confirm, isLoading }
}