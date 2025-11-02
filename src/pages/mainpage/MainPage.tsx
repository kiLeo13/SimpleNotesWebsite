import type { NoteResponseData } from "../../types/api/notes"
import { useState, type JSX } from "react"
import { Sidebar } from "../../components/Sidebar"
import { APP_NAME } from "../../App"

import styles from "./MainPage.module.css"

type MainPageProps = {
  isAdmin: boolean
}

export function MainPage({ isAdmin }: MainPageProps): JSX.Element {
  const [notes, setNotes] = useState<NoteResponseData[]>([])

  return (
    <>
      <title>{`${APP_NAME} - Anotações`}</title>

      <div className={styles.container}>
        <Sidebar isAdmin={isAdmin} notes={notes} setNotes={setNotes} />
        
        <main className={styles.mainContent}>
          <div className={styles.emptyBox}>
            <span>:/</span>
          </div>
        </main>
      </div>
    </>
  )
}