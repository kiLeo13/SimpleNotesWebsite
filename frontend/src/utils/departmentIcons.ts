import type { DepartmentData } from "@/types/api/departments"

const DEPARTMENT_ICONS_BASE_URL =
  "https://d26143aouxq3ma.cloudfront.net/department-icons"

export function getDepartmentIconUrl(iconValue: string): string {
  return `${DEPARTMENT_ICONS_BASE_URL}/${iconValue}`
}

export function getDepartmentIconLabel(department: DepartmentData): string {
  return department.icon_type === "EMOJI" ? department.icon_value : department.name
}
