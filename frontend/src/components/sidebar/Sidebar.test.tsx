import { fireEvent, render, screen } from "@testing-library/react"
import type { NoteResponseData } from "@/types/api/notes"
import type { DepartmentData } from "@/types/api/departments"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Sidebar } from "./Sidebar"
import { useDepartmentsStore } from "@/stores/useDepartmentsStore"
import { useNoteStore } from "@/stores/useNotesStore"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        "departments.general": "General",
        "departments.unknown": "Unknown department",
        "sidebar.notes.manyFound": `${options?.val ?? 0} notes`,
        "sidebar.notes.noResults": "No notes",
        "sidebar.notes.oneFound": "1 note",
        "sidebar.notes.search": "Search notes",
        "sidebar.notes.title": "Notes"
      }

      return translations[key] ?? key
    }
  })
}))

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn()
}))

vi.mock("./SidebarRail", () => ({
  SidebarRail: () => null
}))

vi.mock("../notes/SidebarNote", () => ({
  SidebarNote: ({ note }: { note: NoteResponseData }) => (
    <div>{note.name}</div>
  )
}))

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useNoteStore.setState({
      notes: [
        makeNote("1", "General Policy", null),
        makeNote("2", "Refund Script", "department-a")
      ],
      state: "READY",
      _fetchPromise: null,
      shownNote: null
    })
    useDepartmentsStore.setState({
      departments: [
        makeDepartment("department-a", "Reclame Aqui"),
        makeDepartment("department-b", "Social")
      ],
      memberships: [],
      state: "READY",
      membershipState: "READY",
      _fetchPromise: null,
      _membershipFetchPromise: null
    })
  })

  it("keeps empty department groups visible when not searching", () => {
    render(<Sidebar />)

    expect(screen.getByText("General")).toBeInTheDocument()
    expect(screen.getByText("Reclame Aqui")).toBeInTheDocument()
    expect(screen.getByText("Social")).toBeInTheDocument()
    expect(screen.getByText("General Policy")).toBeInTheDocument()
    expect(screen.getByText("Refund Script")).toBeInTheDocument()
  })

  it("hides only department groups without matches while searching", () => {
    render(<Sidebar />)

    fireEvent.change(screen.getByPlaceholderText("Search notes"), {
      target: { value: "refund" }
    })

    expect(screen.getByText("Reclame Aqui")).toBeInTheDocument()
    expect(screen.getByText("Refund Script")).toBeInTheDocument()
    expect(screen.queryByText("General")).not.toBeInTheDocument()
    expect(screen.queryByText("Social")).not.toBeInTheDocument()
    expect(screen.queryByText("General Policy")).not.toBeInTheDocument()
  })
})

function makeNote(
  id: string,
  name: string,
  departmentID: string | null
): NoteResponseData {
  return {
    id,
    name,
    tags: [],
    visibility: "PUBLIC",
    department_id: departmentID,
    note_type: "MARKDOWN",
    created_by_id: "7",
    content_size: 256,
    created_at: "2026-04-21T10:00:00.000Z",
    updated_at: "2026-04-21T10:00:00.000Z"
  }
}

function makeDepartment(id: string, name: string): DepartmentData {
  return {
    id,
    name,
    icon_type: "EMOJI",
    icon_value: "#",
    created_at: "2026-04-21T10:00:00.000Z",
    updated_at: "2026-04-21T10:00:00.000Z"
  }
}
