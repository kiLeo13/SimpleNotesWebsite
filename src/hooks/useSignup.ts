import type { SignupFormFields } from "../types/auth"
import type { ApiResponse, SignupResponseData } from "../types/api"

import { useState } from "react"
import { authService } from "../services/authService"

export function useSignup() {
  const [isLoading, setIsLoading] = useState(false)

  const signup = async (data: SignupFormFields): Promise<ApiResponse<SignupResponseData>> => {
    setIsLoading(true)

    const result = await authService.signup(data)
    setIsLoading(false)
    return result
  }

  return { signup, isLoading }
}