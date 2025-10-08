import type { ApiResponse, LoginResponseData } from "../types/api"
import type { LoginFormFields } from "../types/auth"

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