import { useEffect, type JSX } from "react"

import {
  Group,
  Panel,
  Separator,
  useDefaultLayout
} from "react-resizable-panels"
import { Sidebar } from "@/components/sidebar/Sidebar"
import { EmptyDisplay } from "@/components/board/EmptyDisplay"
import { ContentBoard } from "@/components/board/ContentBoard"
import { LoaderContainer } from "@/components/LoaderContainer"
import { userService } from "@/services/userService"
import { useNoteStore } from "@/stores/useNotesStore"
import { toasts } from "@/utils/toastUtils"
import { useSessionStore } from "@/stores/useSessionStore"
import { useTranslation } from "react-i18next"
import { useWebSocketManager } from "@/hooks/useWebSocketManager"

import styles from "./MainPage.module.css"

export function MainPage(): JSX.Element {
  const { t } = useTranslation()
  const setUser = useSessionStore((state) => state.setUser)

  const shownNote = useNoteStore((state) => state.shownNote)
  const isRendering = useNoteStore((state) => state.isRendering)
  const closeNote = useNoteStore((state) => state.closeNote)
  const showRenderingLoader =
    isRendering && !shownNote?.content?.endsWith("mp4")

  // Init WebSocket
  useWebSocketManager()

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "notes-layout-persistence",
    storage: localStorage
  })

  useEffect(() => {
    const loadSelfUser = async () => {
      const resp = await userService.getSelfUser()

      if (resp.success) {
        setUser(resp.data)
      } else {
        toasts.apiError("Failed to load self user data", resp)
      }
    }
    loadSelfUser()
  }, [setUser])

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
      <title>{`${t("app.title")} - Anotações`}</title>

      <Group
        orientation="horizontal"
        className={styles.container}
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
        resizeTargetMinimumSize={{ fine: 0, coarse: 0 }}
        disableCursor
      >
        <Panel
          defaultSize={300}
          minSize={250}
          maxSize={400}
          className={styles.sidebarPanel}
        >
          <Sidebar />
        </Panel>

        <Separator className={styles.resizeHandle} />

        <Panel minSize={30}>
          <main className={styles.mainContent}>
            {shownNote ? <ContentBoard note={shownNote} /> : <EmptyDisplay />}

            {showRenderingLoader && <LoaderContainer />}
          </main>
        </Panel>
      </Group>
    </>
  )
}

function isInput(el: HTMLElement): boolean {
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA"
}
