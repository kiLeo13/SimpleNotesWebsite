import type { NoteResponseData } from "../../types/api/notes"
import type { UserResponseData } from "../../types/api/users"
import { useEffect, useState, type JSX } from "react"

import { userService } from "../../services/userService"
import { Sidebar } from "../../components/Sidebar"
import { APP_NAME } from "../../App"

import styles from "./MainPage.module.css"

export function MainPage(): JSX.Element {
  const [notes, setNotes] = useState<NoteResponseData[]>([])
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

  return (
    <>
      <title>{`${APP_NAME} - Anotações`}</title>

      <div className={styles.container}>
        <Sidebar selfUser={selfUser} notes={notes} setNotes={setNotes} />

        <main className={styles.mainContent}>
          <div className={styles.emptyBox}>
            <span>:/</span>
          </div>
        </main>
      </div>
    </>
  )
}