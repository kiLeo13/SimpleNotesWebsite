import type { FullNoteResponseData, NoteResponseData } from "../../types/api/notes"
import type { UserResponseData } from "../../types/api/users"
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEventHandler, type JSX, type KeyboardEventHandler, type MouseEventHandler } from "react"

import { throttle } from "lodash"
import { noteService } from "../../services/noteService"
import { SidebarNote } from "../notes/SidebarNote"
import { MdOutlineFileUpload } from "react-icons/md"

import styles from "./Sidebar.module.css"

type SidebarProps = {
  selfUser: UserResponseData | null
  notes: NoteResponseData[]
  showUploadModal: boolean
  shownNote: NoteResponseData | null,
  setNotes: (notes: NoteResponseData[]) => void
  setShowUploadModal: (show: boolean) => void
  setShownNote: (note: FullNoteResponseData) => void
}

export function Sidebar({
  selfUser,
  notes,
  showUploadModal,
  setNotes,
  shownNote,
  setShowUploadModal,
  setShownNote
}: SidebarProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const filteredNotes = notes
    .filter((n) => filterNote(n, search))
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

  const loadNotes = useCallback(async () => {
    setIsLoading(true)
    const resp = await noteService.listNotes()

    if (resp.success) {
      setNotes(resp.data.notes)
    }
    setIsLoading(false)
  }, [setNotes])

  const handleSearch: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value)
  }

  const handleKeyboard: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key.toLowerCase() === "escape") {
      searchRef?.current?.blur()
    }
  }

  const handleOpenNote = async (n: NoteResponseData) => {
    // Are trying to open the same note?
    if (shownNote?.id === n.id) return

    if (n.note_type === 'REFERENCE') {
      setShownNote(n)
    } else {
      const resp = await noteService.fetchNote(n.id)

      if (resp.success) {
        setShownNote(resp.data)
      } else {
        alert(`Erro: ${JSON.stringify(resp.errors, null, 2)}`)
      }
    }
  }

  const handleShowUpload: MouseEventHandler<HTMLButtonElement> = () => {
    setShowUploadModal(!showUploadModal)
  }

  const throttledLoadNotes = useMemo(
    () => throttle(loadNotes, 5000, { leading: true, trailing: false }),
    [loadNotes]
  )

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase()
      if (e.ctrlKey && key === " ") {
        searchRef?.current?.focus()
        e.preventDefault()
      }

      if (e.ctrlKey && key === "r") {
        e.preventDefault()
        throttledLoadNotes()
      }
    }
    window.addEventListener("keydown", handleGlobalKeydown)
    return () => window.removeEventListener("keydown", handleGlobalKeydown)
  })

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

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
        <div className={styles.menuDivider} />
        <span className={styles.searchResultCount}>{toPrettyResultCount(filteredNotes.length)}</span>
      </div>
      <div className={styles.menuLowerItems}>
        <div className={styles.sidebarLoaderContainer}>
          {isLoading && <div className="loader" />}
        </div>

        {!isLoading && (
          filteredNotes.map((n) => {
            return <SidebarNote
              onClick={() => handleOpenNote(n)}
              key={n.id}
              note={n}
              isAdmin={selfUser?.isAdmin || false}
            />
          })
        )}
      </div>
      <div className={styles.menuFooterControls}>
        <div className={styles.profile}>
          <div className={styles.sidebarPfp}>L</div>
          <span className={styles.username}>{selfUser?.username}</span>
        </div>
        {selfUser?.isAdmin && (
          <button onClick={handleShowUpload} className={styles.footerControlButton}>
            <MdOutlineFileUpload size={"0.8em"} />
          </button>
        )}
      </div>
    </nav>
  )
}

function filterNote(note: NoteResponseData, search: string): boolean {
  const sanitizedSearch = search.trim().toLowerCase()
  const name = note.name.toLowerCase()

  return name.includes(sanitizedSearch) || note.tags.some(tag => tag.includes(sanitizedSearch))
}

function toPrettyResultCount(count: number): string {
  return count == 1
    ? `1 resultado encontrado`
    : `${count} resultados encontrados`
}