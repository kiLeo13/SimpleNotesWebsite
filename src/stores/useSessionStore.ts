import type { UserResponseData } from "@/types/api/users"

import { create } from "zustand"

type SessionState = {
  user: UserResponseData | null
  updateUser: (updates: Partial<UserResponseData>) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    }))
  }
}))
