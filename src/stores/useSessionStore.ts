import type { ApiResponse } from "@/types/api/api"
import type {
  LoginRequestPayload,
  LoginResponseData,
  UserResponseData
} from "@/types/api/users"

import { userService } from "@/services/userService"
import { create } from "zustand"

type SessionState = {
  user: UserResponseData | null

  getIdToken: () => string | null
  getAccessToken: () => string | null

  login: (data: LoginRequestPayload) => Promise<ApiResponse<LoginResponseData>>
  logout: () => void
  setUser: (user: UserResponseData) => void
  updateUser: (updates: Partial<UserResponseData>) => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  user: null,

  getIdToken() {
    return localStorage.getItem("id_token")
  },

  getAccessToken() {
    return localStorage.getItem("access_token")
  },

  async login(data) {
    const resp = await userService.login(data)
    if (resp.success) {
      localStorage.setItem("access_token", resp.data.accessToken)
      localStorage.setItem("id_token", resp.data.idToken)
    }
    return resp
  },

  /**
   * Fire-and-forget logout.
   *
   * Sends a logout request if an `accessToken` exists.
   * Does not check the response or handle errors.
   * Silently returns if no token is available.
   */
  logout: () => {
    const accessToken = get().getAccessToken()
    if (!accessToken) return

    userService.logout({ access_token: accessToken })
  },

  setUser: (user) => {
    set({ user: user })
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    }))
  }
}))
