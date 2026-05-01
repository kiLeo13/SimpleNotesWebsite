import type { ChangeEventHandler, JSX, KeyboardEventHandler } from "react"
import type { NoteResponseData } from "@/types/api/notes"
import type { DepartmentData } from "@/types/api/departments"

import { useNavigate } from "@tanstack/react-router"
import { SidebarNote } from "../notes/SidebarNote"
import { SidebarRail } from "./SidebarRail"
import { PiListMagnifyingGlass } from "react-icons/pi"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNoteStore } from "@/stores/useNotesStore"
import { useDepartmentsStore } from "@/stores/useDepartmentsStore"
import { matchSorter } from "match-sorter"
import { throttle } from "lodash-es"
import { useTranslation } from "react-i18next"
import { DepartmentIcon } from "../departments/DepartmentIcon"
import { MdOutlineTag } from "react-icons/md"

import styles from "./Sidebar.module.css"

export function Sidebar(): JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate({ from: "/" })

  const [search, setSearch] = useState("")

  const notes = useNoteStore((s) => s.notes)
  const notesState = useNoteStore((s) => s.state)
  const ensureLoaded = useNoteStore((s) => s.ensureLoaded)
  const reloadNotes = useNoteStore((s) => s.reload)
  const departments = useDepartmentsStore((s) => s.departments)
  const ensureDepartmentsLoaded = useDepartmentsStore((s) => s.ensureLoaded)

  const isLoading = notesState === "LOADING"
  const searchRef = useRef<HTMLInputElement>(null)
  const departmentGroups = toDepartmentGroups(search, notes, departments, t)
  const resultCount = departmentGroups.reduce(
    (total, group) => total + group.notes.length,
    0
  )

  useEffect(() => {
    ensureLoaded()
    ensureDepartmentsLoaded()
  }, [ensureLoaded, ensureDepartmentsLoaded])

  const handleSearch: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value)
  }

  const handleKeyboard: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key.toLowerCase() === "escape") {
      searchRef?.current?.blur()
    }
  }

  const handleOpenNote = (n: NoteResponseData) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        id: n.id
      })
    })
  }

  const throttledLoadNotes = useMemo(
    () => throttle(reloadNotes, 5000, { leading: true, trailing: false }),
    [reloadNotes]
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
    <nav className={styles.sidebarLayout}>
      <SidebarRail />

      <div className={styles.leftMenu}>
        <div className={styles.menuUpperControls}>
          <input
            className={styles.searchInput}
            disabled={isLoading}
            type="text"
            name="noteSearch" // Just to remove browser warnings
            placeholder={t("sidebar.notes.search")}
            autoComplete="off"
            ref={searchRef}
            onKeyDown={handleKeyboard}
            onChange={handleSearch}
            value={search}
          />
          <div className={styles.menuDivider} />
          <span className={styles.noteListHeader}>
            <span className={styles.noteListTitle}>
              {t("sidebar.notes.title")}
            </span>
            <span className={styles.noteListCount}>
              {resultCount === 1
                ? t("sidebar.notes.oneFound")
                : t("sidebar.notes.manyFound", { val: resultCount })}
            </span>
          </span>
        </div>
        <div className={styles.menuLowerItems}>
          <div className={styles.sidebarLoaderContainer}>
            {isLoading && <div className="loader" />}
          </div>

          {resultCount === 0 && !isLoading && (
            <div className={styles.noResultsContainer}>
              <PiListMagnifyingGlass size={"3em"} color="#61586b67" />
              <span className={styles.noResultsText}>
                {t("sidebar.notes.noResults")}
              </span>
            </div>
          )}

          {!isLoading &&
            departmentGroups.map((group) => (
              <div className={styles.departmentGroup} key={group.id}>
                <div className={styles.departmentHeader}>
                  {group.department ? (
                    <DepartmentIcon
                      className={styles.departmentIcon}
                      department={group.department}
                    />
                  ) : (
                    <MdOutlineTag className={styles.departmentIcon} />
                  )}
                  <span className={styles.departmentName}>{group.name}</span>
                  <span className={styles.departmentCount}>
                    {group.notes.length}
                  </span>
                </div>

                {group.notes.map((n) => (
                  <SidebarNote
                    onClick={() => handleOpenNote(n)}
                    key={n.id}
                    note={n}
                  />
                ))}
              </div>
            ))}
        </div>
      </div>
    </nav>
  )
}

type DepartmentGroup = {
  id: string
  name: string
  department: DepartmentData | null
  notes: NoteResponseData[]
}

function toDepartmentGroups(
  search: string,
  notes: NoteResponseData[],
  departments: DepartmentData[],
  t: (key: string) => string
): DepartmentGroup[] {
  const departmentMap = new Map(
    departments.map((department) => [department.id, department])
  )
  const groups = new Map<string, DepartmentGroup>()

  groups.set("general", {
    id: "general",
    name: t("departments.general"),
    department: null,
    notes: []
  })

  for (const department of [...departments].sort((a, b) =>
    a.name.localeCompare(b.name)
  )) {
    groups.set(department.id, {
      id: department.id,
      name: department.name,
      department,
      notes: []
    })
  }

  const visibleNotes = toFilteredNotes(search, notes)
  for (const note of visibleNotes) {
    const groupID = note.department_id || "general"
    const group =
      groups.get(groupID) ||
      groups
        .set(groupID, {
          id: groupID,
          name: t("departments.unknown"),
          department: departmentMap.get(groupID) ?? null,
          notes: []
        })
        .get(groupID)

    group?.notes.push(note)
  }

  const isSearching = search.trim().length > 0
  return [...groups.values()]
    .map((group) => ({
      ...group,
      notes: [...group.notes].sort((a, b) => a.name.localeCompare(b.name))
    }))
    .filter((group) =>
      isSearching
        ? group.notes.length > 0
        : group.department !== null || group.notes.length > 0
    )
}

function toFilteredNotes(
  search: string,
  notes: NoteResponseData[]
): NoteResponseData[] {
  if (!search.trim()) return notes
  return matchSorter(notes, search, {
    keys: ["name", "tags"],
    // Just a tie-breaker
    baseSort: (a, b) => a.item.name.localeCompare(b.item.name)
  })
}
