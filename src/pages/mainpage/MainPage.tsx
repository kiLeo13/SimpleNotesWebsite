import type { UserResponseData } from "@/types/api/users"
import { useEffect, useState, type JSX } from "react"

import { userService } from "@/services/userService"
import { Sidebar } from "@/components/sidebar/Sidebar"
import { CreateNoteModalForm } from "@/components/modals/notes/creations/CreateNoteModalForm"
import { DarkWrapper } from "@/components/DarkWrapper"
import { EmptyDisplay } from "@/components/board/EmptyDisplay"
import { ContentBoard } from "@/components/board/ContentBoard"
import { LoaderContainer } from "@/components/LoaderContainer"
import { APP_NAME } from "@/App"

import styles from "./MainPage.module.css"
import { useNoteStore } from "@/stores/useNotesStore"

export function MainPage(): JSX.Element {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selfUser, setSelfUser] = useState<UserResponseData | null>(null)
  
  const shownNote = useNoteStore((state) => state.shownNote)
  const isRendering = useNoteStore((state) => state.isRendering)
  const closeNote = useNoteStore((state) => state.closeNote)

  useEffect(() => {
    const loadSelfUser = async () => {
      const resp = await userService.getSelfUser()

      if (resp.success) {
        setSelfUser(resp.data)
      }
    }
    loadSelfUser()
  }, [])

  useEffect(() => {
    const handleGlobalClose = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase()
      if (key && key === 'escape') {
        const target = e.target as HTMLElement

        // We don't want to close our note if we are typing in an input
        if (isInput(target)) return

        closeNote()
      }
    }
    window.addEventListener('keydown', handleGlobalClose)
    return () => window.removeEventListener('keydown', handleGlobalClose)
  }, [closeNote])

  return (
    <>
      <title>{`${APP_NAME} - Anotações`}</title>

      <div className={styles.container}>
        <Sidebar
          selfUser={selfUser}
          showUploadModal={showUploadModal}
          setShowUploadModal={setShowUploadModal}
        />

        {showUploadModal && (
          <DarkWrapper>
            <CreateNoteModalForm setShowUploadModal={setShowUploadModal} />
          </DarkWrapper>
        )}

        <main className={styles.mainContent}>
          {shownNote ? (
            <ContentBoard note={shownNote} />
          ) : <EmptyDisplay />}

          {isRendering && <LoaderContainer />}
        </main>
      </div>
    </>
  )
}

function isInput(el: HTMLElement): boolean {
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
}