import { useEffect, type JSX } from "react"

import { APP_NAME } from "@/App"
import { Sidebar } from "@/components/sidebar/Sidebar"
import { EmptyDisplay } from "@/components/board/EmptyDisplay"
import { ContentBoard } from "@/components/board/ContentBoard"
import { LoaderContainer } from "@/components/LoaderContainer"
import { userService } from "@/services/userService"
import { useNoteStore } from "@/stores/useNotesStore"
import { toasts } from "@/utils/toastUtils"
import { useSessionStore } from "@/stores/useSessionStore"

import styles from "./MainPage.module.css"

export function MainPage(): JSX.Element {
  const updateSelfUser = useSessionStore((state) => state.updateUser)

  const shownNote = useNoteStore((state) => state.shownNote)
  const isRendering = useNoteStore((state) => state.isRendering)
  const closeNote = useNoteStore((state) => state.closeNote)
  const showRenderingLoader = isRendering && !shownNote?.content?.endsWith("mp4")

  useEffect(() => {
    const loadSelfUser = async () => {
      const resp = await userService.getSelfUser()

      if (resp.success) {
        updateSelfUser(resp.data)
      } else {
        toasts.apiError("Failed to load self user data", resp)
      }
    }
    loadSelfUser()
  }, [updateSelfUser])

  useEffect(() => {
    const handleGlobalClose = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase()
      if (key && key === "escape") {
        const target = e.target as HTMLElement

        // We don't want to close our note if we are typing in an input
        if (isInput(target)) return

        closeNote()
      }
    }
    window.addEventListener("keydown", handleGlobalClose)
    return () => window.removeEventListener("keydown", handleGlobalClose)
  }, [closeNote])

  return (
    <>
      <title>{`${APP_NAME} - Anotações`}</title>

      <div className={styles.container}>
        <Sidebar />

        <main className={styles.mainContent}>
          {shownNote ? <ContentBoard note={shownNote} /> : <EmptyDisplay />}

          {showRenderingLoader && <LoaderContainer />}
        </main>
      </div>
    </>
  )
}

function isInput(el: HTMLElement): boolean {
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA"
}
