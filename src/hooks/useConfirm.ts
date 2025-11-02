import type { ConfirmFormFields } from "../types/forms/users"
import type { ApiResponse } from "../types/api/api"

import { useState } from "react"
import { userService } from "../services/userService"

export function useConfirm() {
  const [isLoading, setIsLoading] = useState(false)

  const confirm = async (data: ConfirmFormFields): Promise<ApiResponse<void>> => {
    setIsLoading(true)

    const result = await userService.verifyEmail(data)
    setIsLoading(false)
    return result
  }

  return { confirm, isLoading }
}