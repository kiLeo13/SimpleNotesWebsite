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
import { isNumeric } from "@/utils/utils"
import { useSessionStore } from "@/stores/useSessionStore"
import { useTranslation } from "react-i18next"
import { useWebSocketManager } from "@/hooks/useWebSocketManager"
import { useSearchParams } from "react-router-dom"

import styles from "./MainPage.module.css"

export function MainPage(): JSX.Element {
  const { t } = useTranslation()

  const [searchParams, setSearchParams] = useSearchParams()
  const activeNoteId = searchParams.get("id")

  const setUser = useSessionStore((s) => s.setUser)
  const shownNote = useNoteStore((s) => s.shownNote)
  const isFetchingNote = useNoteStore((s) => s.isFetchingNote)
  const isRendering = useNoteStore((s) => s.isRendering)
  const openNote = useNoteStore((s) => s.openNote)
  const closeNote = useNoteStore((s) => s.closeNote)
  const isVideoNote = shownNote?.content?.endsWith("mp4")

  // Init WebSocket
  useWebSocketManager()

  useEffect(() => {
    async function handleNotesLoad() {
      if (!activeNoteId) {
        closeNote()
        return
      }

      const isNum = isNumeric(activeNoteId)
      if (!isNum) {
        setSearchParams(
          (prev) => {
            prev.delete("id")
            return prev
          },
          { replace: true }
        )
        return
      }

      const parsedId = Number(activeNoteId)
      const resp = await openNote(parsedId)
      if (!resp?.errors) return

      if (resp.statusCode === 404) {
        toasts.error(t("errors.notes.notFound"))
      } else {
        toasts.apiError(t("errors.notes.cantOpen"), resp)
      }

      setSearchParams(
        (prev) => {
          prev.delete("id")
          return prev
        },
        { replace: true }
      )
    }

    handleNotesLoad()
  }, [activeNoteId, openNote, closeNote, setSearchParams, t])

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
      if (key && key === "escape" && !isInput(e.target as HTMLElement)) {
        setSearchParams((prev) => {
          prev.delete("id")
          return prev
        })
      }
    }
    window.addEventListener("keydown", handleGlobalClose)
    return () => window.removeEventListener("keydown", handleGlobalClose)
  }, [setSearchParams])

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
            {/* 4. Logic hierarchy: Fetching Network -> Rendering Content -> Empty */}
            {isFetchingNote ? (
              <LoaderContainer />
            ) : shownNote ? (
              <ContentBoard note={shownNote} />
            ) : (
              <EmptyDisplay />
            )}

            {/* If we have the note data, but a media file is still rendering in the background */}
            {!isFetchingNote && isRendering && !isVideoNote && (
              <LoaderContainer />
            )}
          </main>
        </Panel>
      </Group>
    </>
  )
}

function isInput(el: HTMLElement): boolean {
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA"
}
