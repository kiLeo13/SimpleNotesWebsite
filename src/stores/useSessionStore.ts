import type { UserResponseData } from "@/types/api/users"
import { userService } from "@/services/userService"

import { create } from "zustand"

type SessionState = {
  user: UserResponseData | null

  getIdToken: () => string | null
  logout: () => void
  setUser: (user: UserResponseData) => void
  updateUser: (updates: Partial<UserResponseData>) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,

  getIdToken() {
    return localStorage.getItem("id_token")
  },

  // This is a FF (Fire and Forget) method.
  // This function checks nothing about the server response.
  logout: () => userService.logout(),

  setUser: (user) => {
    set({ user: user })
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    }))
  }
}))
