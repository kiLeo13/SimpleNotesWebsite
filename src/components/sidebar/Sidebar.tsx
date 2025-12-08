import type { NoteResponseData } from "@/types/api/notes"
import type { UserResponseData } from "@/types/api/users"
import { useEffect, useMemo, useRef, useState, type ChangeEventHandler, type JSX, type KeyboardEventHandler, type MouseEventHandler } from "react"

import _ from "lodash"

import { SidebarNote } from "../notes/SidebarNote"
import { MdOutlineFileUpload } from "react-icons/md"
import { SidebarProfile } from "./SidebarProfile"
import { DarkWrapper } from "../DarkWrapper"
import { CreateNoteModalForm } from "../modals/notes/creations/CreateNoteModalForm"
import { useNoteStore } from "@/stores/useNotesStore"
import { matchSorter } from "match-sorter"

import styles from "./Sidebar.module.css"

type SidebarProps = {
  selfUser: UserResponseData | null
}

export function Sidebar({ selfUser }: SidebarProps): JSX.Element {
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Note store actions and states
  const notes = useNoteStore((state) => state.notes)
  const isLoading = useNoteStore((state) => state.isLoading)
  const fetchNotes = useNoteStore((state) => state.fetchNotes)
  const openNote = useNoteStore((state) => state.openNote)

  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const filteredNotes = toFilteredNotes(search, notes)

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const handleSearch: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value)
  }

  const handleKeyboard: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key.toLowerCase() === "escape") {
      searchRef?.current?.blur()
    }
  }

  const handleShowUpload: MouseEventHandler<HTMLButtonElement> = () => {
    setShowUploadModal(!showUploadModal)
  }

  const handleOpenNote = (n: NoteResponseData) => {
    openNote(n)
  }

  const throttledLoadNotes = useMemo(
    () => _.throttle(fetchNotes, 5000, { leading: true, trailing: false }),
    [fetchNotes]
  )

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase()
      // CTRL + SPACE = Focus the search bar
      if (e.ctrlKey && key === " ") {
        searchRef?.current?.focus()
        e.preventDefault()
      }

      // CTRL + R = Reloads the notes on the sidebar
      if (e.ctrlKey && key === "r") {
        e.preventDefault()
        throttledLoadNotes()
      }
    }
    window.addEventListener("keydown", handleGlobalKeydown)
    return () => window.removeEventListener("keydown", handleGlobalKeydown)
  })

  return (
    <>
      {showUploadModal && (
        <DarkWrapper>
          <CreateNoteModalForm setShowUploadModal={setShowUploadModal} />
        </DarkWrapper>
      )}

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
          <SidebarProfile />
          {selfUser?.isAdmin && (
            <button onClick={handleShowUpload} className={styles.footerControlButton}>
              <MdOutlineFileUpload size={"0.8em"} />
            </button>
          )}
        </div>
      </nav>
    </>
  )
}

function toFilteredNotes(search: string, notes: NoteResponseData[]): NoteResponseData[] {
  if (!search.trim()) {
    return notes
  }

  return matchSorter(notes, search, {
    keys: ['name', 'tags'],
    // Just a tie-breaker
    baseSort: (a, b) => a.item.name.localeCompare(b.item.name)
  })
}

function toPrettyResultCount(count: number): string {
  return count == 1
    ? `1 resultado encontrado`
    : `${count} resultados encontrados`
}