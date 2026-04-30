import type { UserResponseData } from "@/types/api/users"
import type { BulkMoveTarget } from "./DepartmentActionsMenu"
import type {
  BulkMoveDepartmentNotesPayload,
  CreateDepartmentPayload,
  DepartmentData,
  DepartmentMembershipData,
  UpdateDepartmentPayload
} from "@/types/api/departments"

export const DEFAULT_DEPARTMENT_EMOJI = "🏷️"

export function sortDepartments(
  departments: DepartmentData[]
): DepartmentData[] {
  return [...departments].sort((a, b) => a.name.localeCompare(b.name))
}

export function sortUsers(users: UserResponseData[]): UserResponseData[] {
  return [...users].sort((a, b) => a.username.localeCompare(b.username))
}

export function getDepartmentUserPartitions(
  department: DepartmentData | null,
  memberships: DepartmentMembershipData[],
  users: UserResponseData[]
): { members: UserResponseData[]; nonMembers: UserResponseData[] } {
  if (!department) {
    return { members: [], nonMembers: [] }
  }

  const memberUserIds = new Set(
    memberships
      .filter((membership) => membership.department_id === department.id)
      .map((membership) => membership.user_id)
  )

  return {
    members: users.filter((user) => memberUserIds.has(user.id)),
    nonMembers: users.filter((user) => !memberUserIds.has(user.id))
  }
}

export function buildCreateDepartmentPayload(
  name: string,
  emoji: string,
  iconFile: File | null
): CreateDepartmentPayload {
  return {
    name: name.trim(),
    icon_type: iconFile ? "IMAGE" : "EMOJI",
    icon_value: iconFile ? undefined : emoji.trim()
  }
}

export function buildUpdateDepartmentPayload(
  name: string,
  emoji: string,
  iconFile: File | null
): UpdateDepartmentPayload {
  return {
    name: name.trim(),
    ...(iconFile
      ? { icon_type: "IMAGE" as const }
      : emoji.trim()
        ? { icon_type: "EMOJI" as const, icon_value: emoji.trim() }
        : {})
  }
}

export function buildBulkMovePayload(
  targetDepartmentId: string | null
): BulkMoveDepartmentNotesPayload {
  return {
    target_department_id: targetDepartmentId
  }
}

export function getBulkMoveTargets(
  department: DepartmentData,
  departments: DepartmentData[],
  generalName: string
): BulkMoveTarget[] {
  return [
    { id: null, name: generalName },
    ...departments
      .filter((target) => target.id !== department.id)
      .map((target) => ({ id: target.id, name: target.name }))
  ]
}
