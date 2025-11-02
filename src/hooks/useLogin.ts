import type { LoginResponseData } from "../types/api/auth"
import type { LoginFormFields } from "../types/schemas/auth"
import type { ApiResponse } from "../types/api/api"

import { userService } from "../services/userService"
import { useState } from "react"

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)

  const login = async (data: LoginFormFields): Promise<ApiResponse<LoginResponseData>> => {
    setIsLoading(true)

    const result = await userService.login(data)
    setIsLoading(false)
    return result
  }

  return { login, isLoading }
}