import type { UserResponseData } from "@/types/api/users"

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DepartmentMembersPanel } from "./DepartmentMembersPanel"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "departments.management.addMember": "Add member",
        "departments.management.allUsersAdded": "All users added",
        "departments.management.members": "Members",
        "departments.management.noMembers": "No members",
        "departments.management.removeMember": "Remove member"
      }

      return translations[key] ?? key
    }
  })
}))

describe("DepartmentMembersPanel", () => {
  it("renders members and delegates removal", () => {
    const onRemoveMember = vi.fn()

    render(
      <DepartmentMembersPanel
        members={[makeUser("user-a", "Ada")]}
        nonMembers={[makeUser("user-b", "Grace")]}
        addMenuOpen={false}
        onAddMenuOpenChange={vi.fn()}
        onAddMember={vi.fn()}
        onRemoveMember={onRemoveMember}
      />
    )

    expect(screen.getByText("Members")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("Ada")).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText("Remove member"))
    expect(onRemoveMember).toHaveBeenCalledWith(expect.objectContaining({ id: "user-a" }))
  })

  it("shows the add-member menu when controlled open", () => {
    const onAddMember = vi.fn()

    render(
      <DepartmentMembersPanel
        members={[]}
        nonMembers={[makeUser("user-b", "Grace")]}
        addMenuOpen
        onAddMenuOpenChange={vi.fn()}
        onAddMember={onAddMember}
        onRemoveMember={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText("Grace"))
    expect(onAddMember).toHaveBeenCalledWith(expect.objectContaining({ id: "user-b" }))
  })
})

function makeUser(id: string, username: string): UserResponseData {
  return {
    id,
    username,
    permissions: 0,
    presence: "OFFLINE",
    isVerified: true,
    suspended: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z"
  }
}
