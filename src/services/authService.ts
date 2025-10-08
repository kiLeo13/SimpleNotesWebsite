import { LoginResponseSchema, SignupResponseSchema, type ApiResponse, type LoginRequestPayload, type LoginResponseData, type SignupRequestPayload, type SignupResponseData } from "../types/api"

import apiClient from "./apiClient"
import { safeApiCall } from "./safeApiCall"

export const authService = {
  /**
   * Logs in a user.
   */
  login: async (payload: LoginRequestPayload): Promise<ApiResponse<LoginResponseData>> => {
    return safeApiCall(
      () => apiClient.post('/users/login', payload),
      LoginResponseSchema
    )
  },

  signup: async (payload: SignupRequestPayload): Promise<ApiResponse<SignupResponseData>> => {
    return safeApiCall(
      () => apiClient.post('/users', payload),
      SignupResponseSchema
    )
  }
}