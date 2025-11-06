import type { FullNoteResponseData, NoteResponseData } from "../../types/api/notes"
import type { UserResponseData } from "../../types/api/users"
import { useEffect, useState, type JSX } from "react"

import { userService } from "../../services/userService"
import { Sidebar } from "../../components/Sidebar"
import { CreateNoteModalForm } from "../../components/modals/notes/CreateNoteModalForm"
import { DarkWrapper } from "../../components/DarkWrapper"
import { APP_NAME } from "../../App"
import { EmptyDisplay } from "../../components/board/EmptyDisplay"
import { ContentBoard } from "../../components/board/ContentBoard"

import styles from "./MainPage.module.css"

export function MainPage(): JSX.Element {
  const [notes, setNotes] = useState<NoteResponseData[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [shownNote, setShownNote] = useState<FullNoteResponseData | null>(null)
  const [selfUser, setSelfUser] = useState<UserResponseData | null>(null)

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
      
        // We don't want to close our note if we are typing
        if (isInput(target)) return

        setShownNote(null)
      }
    }
    window.addEventListener('keydown', handleGlobalClose)
    return () => window.removeEventListener('keydown', handleGlobalClose)
  }, [])

  return (
    <>
      <title>{`${APP_NAME} - Anotações`}</title>

      <div className={styles.container}>
        <Sidebar
          selfUser={selfUser}
          notes={notes}
          showUploadModal={showUploadModal}
          shownNote={shownNote}
          setNotes={setNotes}
          setShowUploadModal={setShowUploadModal}
          setShownNote={setShownNote}
        />

        {showUploadModal && (
          <DarkWrapper>
            <CreateNoteModalForm setShownNote={setShownNote} setShowUploadModal={setShowUploadModal} />
          </DarkWrapper>
        )}

        <main className={styles.mainContent}>
          {!shownNote ? (
            <EmptyDisplay />
          ) : (
            <ContentBoard note={shownNote} />
          )}
        </main>
      </div>
    </>
  )
}

function isInput(el: HTMLElement): boolean {
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
}