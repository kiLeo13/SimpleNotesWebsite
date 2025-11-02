import type { NoteResponseData } from "../types/api/notes"
import { useEffect, useRef, useState, type ChangeEventHandler, type JSX, type KeyboardEventHandler } from "react"

import { noteService } from "../services/noteService"
import { SidebarNote } from "./notes/SidebarNote"

import styles from "./Sidebar.module.css"

type SidebarProps = {
  isAdmin: boolean
  notes: NoteResponseData[]
  setNotes: (notes: NoteResponseData[]) => void
}

export function Sidebar({ isAdmin, notes, setNotes }: SidebarProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const filteredNotes = notes.filter((n) => filterNote(n, search))

  const handleSearch: ChangeEventHandler<HTMLInputElement> = (e) => {
    const val = e.target.value
    setSearch(val)
  }

  const handleKeyboard: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key.toLowerCase() === "escape") {
      searchRef?.current?.blur()
    }
  }

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === " ") {
        searchRef?.current?.focus()
        e.preventDefault()
      }
    }

    window.addEventListener("keydown", handleGlobalKeydown)
    return () => window.removeEventListener("keydown", handleGlobalKeydown)
  })

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
  }, [setNotes])

  return (
    <nav className={styles.leftMenu}>
      <div className={styles.menuUpperControls}>
        <input
          className={styles.searchInput}
          disabled={isLoading}
          type="text"
          placeholder="Pesquisar"
          autoComplete="off"
          ref={searchRef}
          onKeyDown={handleKeyboard}
          onChange={handleSearch}
          value={search}
        />
        <div className={styles.menuDivider}></div>
        <span className={styles.searchResultCount}>{toPrettyResultCount(filteredNotes.length)}</span>
      </div>
      <div className={styles.menuLowerItems}>
        <div className={styles.sidebarLoaderContainer}>
          {isLoading && <div className="loader"></div>}
        </div>

        {!isLoading && (
          filteredNotes.map((n) => {
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

function filterNote(note: NoteResponseData, search: string): boolean {
  const sanitizedSearch = search.trim().toLowerCase()
  const name = note.name.toLowerCase()

  return name.includes(sanitizedSearch) || note.tags.some(tag => tag.toLowerCase().includes(sanitizedSearch))
}

function toPrettyResultCount(count: number): string {
  return count == 1
    ? `1 resultado encontrado`
    : `${count} resultados encontrados`
}