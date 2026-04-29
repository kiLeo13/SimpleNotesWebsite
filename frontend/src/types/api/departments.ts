import { z } from "zod"

export const departmentIconTypeSchema = z.enum(["EMOJI", "IMAGE"])
export type DepartmentIconType = z.infer<typeof departmentIconTypeSchema>

export interface CreateDepartmentPayload {
  name: string
  icon_type: DepartmentIconType
  icon_value?: string
}

export interface UpdateDepartmentPayload {
  name?: string
  icon_type?: DepartmentIconType
  icon_value?: string
}

export interface BulkMoveDepartmentNotesPayload {
  target_department_id: string | null
}

export const departmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon_type: departmentIconTypeSchema,
  icon_value: z.string(),
  created_at: z.string(),
  updated_at: z.string()
})

export const departmentMembershipSchema = z.object({
  department_id: z.string(),
  user_id: z.string()
})

export const listDepartmentsResponseSchema = z.object({
  departments: z.array(departmentSchema)
})

export const listDepartmentMembershipsResponseSchema = z.object({
  memberships: z.array(departmentMembershipSchema)
})

export type DepartmentData = z.infer<typeof departmentSchema>
export type DepartmentMembershipData = z.infer<
  typeof departmentMembershipSchema
>
export type ListDepartmentsResponseData = z.infer<
  typeof listDepartmentsResponseSchema
>
export type ListDepartmentMembershipsResponseData = z.infer<
  typeof listDepartmentMembershipsResponseSchema
>
