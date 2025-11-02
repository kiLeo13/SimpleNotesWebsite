import type { CheckUserStatusFields, SignupFormFields } from "../types/forms/users"
import type { CheckUserStatusData } from "../types/api/users"
import type { ApiResponse } from "../types/api/api"

import { useState } from "react"
import { userService } from "../services/userService"

export function useSignup() {
  const [isLoading, setIsLoading] = useState(false)

  const signup = async (data: SignupFormFields): Promise<ApiResponse<void>> => {
    setIsLoading(true)

    const result = await userService.signup(data)
    setIsLoading(false)
    return result
  }

  const getUserStatus = async (data: CheckUserStatusFields): Promise<ApiResponse<CheckUserStatusData>> => {
    setIsLoading(true)

    const result = await userService.getUserStatus(data)
    setIsLoading(false)
    return result
  }

  return { signup, getUserStatus, isLoading }
}