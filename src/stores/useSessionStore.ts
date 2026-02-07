import type { UserResponseData } from "@/types/api/users"

import { create } from "zustand"

type SessionState = {
  user: UserResponseData | null

  getIdToken: () => string | null
  setUser: (user: UserResponseData) => void
  updateUser: (updates: Partial<UserResponseData>) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,

  getIdToken() {
    return localStorage.getItem("id_token")
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
