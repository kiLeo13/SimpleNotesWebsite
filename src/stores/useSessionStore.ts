import type { UserResponseData } from "@/types/api/users"
import { userService } from "@/services/userService"

import { create } from "zustand"

type SessionState = {
  user: UserResponseData | null

  getIdToken: () => string | null
  getAccessToken: () => string | null

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
