import type { ConfirmFormFields } from "../types/schemas/auth"
import type { ApiResponse } from "../types/api/api"

import { useState } from "react"
import { authService } from "../services/authService"

export function useConfirm() {
  const [isLoading, setIsLoading] = useState(false)

  const confirm = async (data: ConfirmFormFields): Promise<ApiResponse<void>> => {
    setIsLoading(true)

    const result = await authService.verifyEmail(data)
    setIsLoading(false)
    return result
  }

  return { confirm, isLoading }
}