import { create } from "zustand"

export type ThemePreference = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

interface ThemeState {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (pref: ThemePreference) => void
}

const STORAGE_KEY = "theme"

function getStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored
    }
  } catch {
    // localStorage unavailable (SSR / test env)
  }
  return "system"
}

function prefersColorSchemeDark(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  } catch {
    return true // default to dark in non-browser environments
  }
}

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "system") {
    return prefersColorSchemeDark() ? "dark" : "light"
  }
  return pref
}

function applyTheme(resolved: ResolvedTheme): void {
  try {
    document.documentElement.setAttribute("data-theme", resolved)
  } catch {
    // document unavailable (SSR / test env)
  }
}

export const useThemeStore = create<ThemeState>()((set) => {
  const initial = getStoredPreference()
  const resolved = resolveTheme(initial)

  // Apply immediately so there's no flash
  applyTheme(resolved)

  return {
    preference: initial,
    resolved,
    setPreference: (pref) => {
      try {
        localStorage.setItem(STORAGE_KEY, pref)
      } catch {
        // localStorage unavailable
      }
      const next = resolveTheme(pref)
      applyTheme(next)
      set({ preference: pref, resolved: next })
    }
  }
})

// Listen for OS theme changes when preference is "system"
try {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

  function handleSystemChange(): void {
    const { preference } = useThemeStore.getState()
    if (preference === "system") {
      const next = resolveTheme("system")
      applyTheme(next)
      useThemeStore.setState({ resolved: next })
    }
  }

  mediaQuery.addEventListener("change", handleSystemChange)
} catch {
  // matchMedia unavailable in test/SSR environments
}
