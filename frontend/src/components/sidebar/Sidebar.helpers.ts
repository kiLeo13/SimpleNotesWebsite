import type { DepartmentData } from "@/types/api/departments"
import type { NoteResponseData } from "@/types/api/notes"

import { matchSorter } from "match-sorter"
import { noteService } from "@/services/noteService"
import { toasts } from "@/utils/toastUtils"

export const GENERAL_DEPARTMENT_ID = "general"

export type DepartmentGroup = {
  id: string
  name: string
  department: DepartmentData | null
  notes: NoteResponseData[]
}

export async function moveNoteToGroup(
  note: NoteResponseData,
  group: DepartmentGroup,
  updateNote: (note: NoteResponseData) => void,
  t: (key: string) => string
): Promise<void> {
  const targetDepartmentID = toGroupDepartmentID(group)
  if (note.department_id === targetDepartmentID) return

  const resp = await noteService.updateNote(note.id, {
    department_id: targetDepartmentID
  })

  if (resp.success) {
    updateNote(resp.data)
    return
  }

  toasts.apiError(t("sidebar.notes.toasts.moveError"), resp)
}

export function toDepartmentGroups(
  search: string,
  notes: NoteResponseData[],
  departments: DepartmentData[],
  t: (key: string) => string
): DepartmentGroup[] {
  const departmentMap = new Map(
    departments.map((department) => [department.id, department])
  )
  const groups = new Map<string, DepartmentGroup>()

  groups.set(GENERAL_DEPARTMENT_ID, {
    id: GENERAL_DEPARTMENT_ID,
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
    const groupID = note.department_id || GENERAL_DEPARTMENT_ID
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

function toGroupDepartmentID(group: DepartmentGroup): string | null {
  return group.id === GENERAL_DEPARTMENT_ID ? null : group.id
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
