import type { CheckUserStatusFields, SignupFormFields } from "../types/schemas/auth"
import type { CheckUserStatusData } from "../types/api/auth"
import type { ApiResponse } from "../types/api/api"

import { useState } from "react"
import { authService } from "../services/authService"

export function useSignup() {
  const [isLoading, setIsLoading] = useState(false)

  const signup = async (data: SignupFormFields): Promise<ApiResponse<void>> => {
    setIsLoading(true)

    const result = await authService.signup(data)
    setIsLoading(false)
    return result
  }

  const getUserStatus = async (data: CheckUserStatusFields): Promise<ApiResponse<CheckUserStatusData>> => {
    setIsLoading(true)

    const result = await authService.getUserStatus(data)
    setIsLoading(false)
    return result
  }

  return { signup, getUserStatus, isLoading }
}