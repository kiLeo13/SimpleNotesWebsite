import type { UserResponseData } from "@/types/api/users"

import { userService } from "@/services/userService"
import { create } from "zustand"

export type UsersStoreState = "NONE" | "LOADING" | "READY" | "ERROR"

type UsersState = {
  users: UserResponseData[]
  state: UsersStoreState
  _fetchPromise: Promise<void> | null

  ensureLoaded: () => Promise<void>

  addUser: (user: UserResponseData) => void
  updateUser: (user: UserResponseData) => void
  removeUser: (userId: number) => void
  getById: (userId: number) => UserResponseData | null
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  state: "NONE",
  _fetchPromise: null,

  ensureLoaded() {
    const { state, _fetchPromise } = get()

    if (state === "READY") return Promise.resolve()

    if (_fetchPromise) return _fetchPromise

    const promise = (async () => {
      set({ state: "LOADING" })

      try {
        const resp = await userService.getUsers()
        if (resp.success) {
          set((state) => {
            const fetchedIds = new Set(resp.data.users.map((u) => u.id))
            const newWsUsers = state.users.filter((u) => !fetchedIds.has(u.id))

            return {
              users: [...resp.data.users, ...newWsUsers],
              state: "READY"
            }
          })
        } else {
          set({ state: "ERROR" })
        }
      } catch (error) {
        console.error(error)
        set({ state: "ERROR" })
      } finally {
        set({ _fetchPromise: null })
      }
    })()

    set({ _fetchPromise: promise })
    return promise
  },

  addUser: (user) => {
    set((state) => {
      const alreadyExists = state.users.some((u) => u.id === user.id)

      // Prevents duplicate entries caused by race conditions with websocket events
      if (alreadyExists) {
        return state
      }

      return { users: [...state.users, user] }
    })
  },

  updateUser(user) {
    set((state) => ({
      users: state.users.map((u) => (u.id === user.id ? user : u))
    }))
  },

  removeUser(userId) {
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId)
    }))
  },

  getById(userId) {
    const { users } = get()
    return users.find((u) => u.id === userId) || null
  }
}))
