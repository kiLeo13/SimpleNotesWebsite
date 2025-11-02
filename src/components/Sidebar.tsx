import type { NoteResponseData } from "../types/api/notes"
import { useEffect, useState, type JSX } from "react"

import { noteService } from "../services/noteService"
import { SidebarNote } from "./notes/SidebarNote"

import styles from "./Sidebar.module.css"

type SidebarProps = {
  isAdmin: boolean
}

export function Sidebar({ isAdmin }: SidebarProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState<NoteResponseData[]>([])

  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true)
      const resp = await noteService.listNotes()

      if (resp.success) {
        setNotes(resp.data.notes)
      }

      setIsLoading(false)
    }
    loadNotes()
  }, [])

  return (
    <nav className={styles.leftMenu}>
      <div className={styles.menuUpperControls}>
        <input className={styles.searchInput} disabled={isLoading} type="text" placeholder="Pesquisar" autoComplete="off" />
        <div className={styles.menuDivider}></div>
        <span className={styles.searchResultCount}>0 resultados encontrados</span>
      </div>
      <div className={styles.menuLowerItems}>
        <div className={styles.sidebarLoaderContainer}>
          {isLoading && <div className="loader"></div>}
        </div>

        {!isLoading && (
          notes.map((n) => {
            return <SidebarNote key={n.id} name={n.name} />
          })
        )}
      </div>
      <div className={styles.menuFooterControls}>
        <div className={styles.sidebarPfp}>L</div>
        {isAdmin && (
          <button className={styles.footerControlButton}>+</button>
        )}
      </div>
    </nav>
  )
}