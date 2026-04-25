import { voidSchema, type ApiResponse } from "../types/api/api"

import {
  checkUserStatusResponseSchema,
  listUsersResponseSchema,
  loginResponseSchema,
  userResponseSchema,
  type CheckUserStatusData,
  type CheckUserStatusPayload,
  type ConfirmRequestPayload,
  type LoginRequestPayload,
  type LoginResponseData,
  type SignupRequestPayload,
  type UserResponseData,
  type ListUsersResponseData,
  type UpdateUserRequestPayload,
  type LogoutRequestPayload
} from "../types/api/users"

import apiClient from "./apiClient"

import { safeApiCall } from "./safeApiCall"

export const userService = {
  /**
   * Logs a user in.
   *
   * @param payload The login request payload.
   * @returns The API response. If successful, it contains the apropriate tokens.
   */
  login: async (payload: LoginRequestPayload): Promise<ApiResponse<LoginResponseData>> => {
    return safeApiCall(() => apiClient.post("/users/login", payload), loginResponseSchema)
  },

  /**
   * Creates a new user account.
   *
   * @param payload The signup request payload.
   * @returns The API response. If successful, an empty response is returned.
   */
  signup: async (payload: SignupRequestPayload): Promise<ApiResponse<void>> => {
    return safeApiCall(() => apiClient.post("/users", payload))
  },

  /**
   * Verifies a user's email using the confirmation code.
   *
   * @param payload The confirmation request payload.
   * @returns The API response. If successful, an empty response is returned.
   */
  verifyEmail: async (payload: ConfirmRequestPayload): Promise<ApiResponse<void>> => {
    return safeApiCall(() => apiClient.post("/users/confirms", payload))
  },

  /**
   * Checks the status of a user by email.
   *
   * @param payload The email of the user to check the status.
   * @returns The API response. If successful, it contains the user's status.
   */
  getUserStatus: async (
    payload: CheckUserStatusPayload
  ): Promise<ApiResponse<CheckUserStatusData>> => {
    return safeApiCall(
      () => apiClient.post("/users/check-email", payload),
      checkUserStatusResponseSchema
    )
  },

  getUsers: async (): Promise<ApiResponse<ListUsersResponseData>> => {
    return safeApiCall(() => apiClient.get("/users"), listUsersResponseSchema)
  },

  getUserById: async (id: string): Promise<ApiResponse<UserResponseData>> => {
    return safeApiCall(() => apiClient.get(`/users/${id}`), userResponseSchema)
  },

  logout: async (payload: LogoutRequestPayload): Promise<ApiResponse<void>> => {
    return safeApiCall(() => apiClient.post("/users/logout", payload), voidSchema)
  },

  updateUser: async (
    id: string,
    payload: UpdateUserRequestPayload
  ): Promise<ApiResponse<UserResponseData>> => {
    return safeApiCall(() => apiClient.patch(`/users/${id}`, payload), userResponseSchema)
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    return safeApiCall(() => apiClient.delete(`/users/${id}`), voidSchema)
  },

  getSelfUser: async (): Promise<ApiResponse<UserResponseData>> => {
    return safeApiCall(() => apiClient.get("/users/@me"), userResponseSchema)
  }
}
