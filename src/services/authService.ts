import {
  ConfirmResponseSchema,
  LoginResponseSchema,
  SignupResponseSchema,

  type ApiResponse,
  type ConfirmRequestPayload,
  type ConfirmResponseData,
  type LoginRequestPayload,
  type LoginResponseData,
  type SignupRequestPayload,
  type SignupResponseData
} from "../types/api"

import apiClient from "./apiClient"

import { safeApiCall } from "./safeApiCall"

export const authService = {
  /**
   * Logs a user in.
   * 
   * @param payload The login request payload.
   * @returns The API response. If successful, it contains the apropriate tokens.
   */
  login: async (payload: LoginRequestPayload): Promise<ApiResponse<LoginResponseData>> => {
    return safeApiCall(
      () => apiClient.post('/users/login', payload),
      LoginResponseSchema
    )
  },

  /**
   * Creates a new user account.
   * 
   * @param payload The signup request payload.
   * @returns The API response. If successful, an empty response is returned.
   */
  signup: async (payload: SignupRequestPayload): Promise<ApiResponse<SignupResponseData>> => {
    return safeApiCall(
      () => apiClient.post('/users', payload),
      SignupResponseSchema
    )
  },

  /**
   * Verifies a user's email using the confirmation code.
   * 
   * @param payload The confirmation request payload.
   * @returns The API response. If successful, an empty response is returned.
   */
  verifyEmail: async (payload: ConfirmRequestPayload): Promise<ApiResponse<ConfirmResponseData>> => {
    return safeApiCall(
      () => apiClient.post('/users/confirms', payload),
      ConfirmResponseSchema
    )
  }
}