import type { LoginResponseData } from "../types/api/auth"
import type { LoginFormFields } from "../types/schemas/auth"
import type { ApiResponse } from "../types/api/api"

import { authService } from "../services/authService"
import { useState } from "react"

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)

  const login = async (data: LoginFormFields): Promise<ApiResponse<LoginResponseData>> => {
    setIsLoading(true)

    const result = await authService.login(data)
    setIsLoading(false)
    return result
  }

  return { login, isLoading }
}