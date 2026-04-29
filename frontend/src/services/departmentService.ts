import type { ApiResponse } from "@/types/api/api"
import {
  type BulkMoveDepartmentNotesPayload,
  type CreateDepartmentPayload,
  type DepartmentData,
  type ListDepartmentMembershipsResponseData,
  type ListDepartmentsResponseData,
  type UpdateDepartmentPayload,
  departmentSchema,
  listDepartmentMembershipsResponseSchema,
  listDepartmentsResponseSchema
} from "@/types/api/departments"

import { voidSchema } from "@/types/api/api"
import apiClient from "./apiClient"
import { safeApiCall } from "./safeApiCall"

export const DEPARTMENT_ICON_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"]
export const DEPARTMENT_ICON_MAX_SIZE_BYTES = 1024 * 1024

function toDepartmentFormData(
  payload: CreateDepartmentPayload | UpdateDepartmentPayload,
  icon?: File | null
): FormData {
  const form = new FormData()
  form.append("json_payload", JSON.stringify(payload))
  if (icon) {
    form.append("icon", icon, icon.name)
  }
  return form
}

export const departmentService = {
  listDepartments: async (): Promise<
    ApiResponse<ListDepartmentsResponseData>
  > => {
    return safeApiCall(
      () => apiClient.get("/departments"),
      listDepartmentsResponseSchema
    )
  },

  listMemberships: async (): Promise<
    ApiResponse<ListDepartmentMembershipsResponseData>
  > => {
    return safeApiCall(
      () => apiClient.get("/departments/users"),
      listDepartmentMembershipsResponseSchema
    )
  },

  createDepartment: async (
    payload: CreateDepartmentPayload,
    icon?: File | null
  ): Promise<ApiResponse<DepartmentData>> => {
    if (icon) {
      return safeApiCall(
        () => apiClient.postForm("/departments", toDepartmentFormData(payload, icon)),
        departmentSchema
      )
    }

    return safeApiCall(
      () => apiClient.post("/departments", payload),
      departmentSchema
    )
  },

  updateDepartment: async (
    id: string,
    payload: UpdateDepartmentPayload,
    icon?: File | null
  ): Promise<ApiResponse<DepartmentData>> => {
    if (icon) {
      return safeApiCall(
        () => apiClient.patchForm(`/departments/${id}`, toDepartmentFormData(payload, icon)),
        departmentSchema
      )
    }

    return safeApiCall(
      () => apiClient.patch(`/departments/${id}`, payload),
      departmentSchema
    )
  },

  deleteDepartment: async (id: string): Promise<ApiResponse<void>> => {
    return safeApiCall(() => apiClient.delete(`/departments/${id}`), voidSchema)
  },

  addUser: async (
    departmentId: string,
    userId: string
  ): Promise<ApiResponse<void>> => {
    return safeApiCall(
      () => apiClient.put(`/departments/${departmentId}/users/${userId}`),
      voidSchema
    )
  },

  removeUser: async (
    departmentId: string,
    userId: string
  ): Promise<ApiResponse<void>> => {
    return safeApiCall(
      () => apiClient.delete(`/departments/${departmentId}/users/${userId}`),
      voidSchema
    )
  },

  bulkMoveNotes: async (
    departmentId: string,
    payload: BulkMoveDepartmentNotesPayload
  ): Promise<ApiResponse<void>> => {
    return safeApiCall(
      () => apiClient.post(`/departments/${departmentId}/notes/bulk-move`, payload),
      voidSchema
    )
  },

  bulkDeleteNotes: async (departmentId: string): Promise<ApiResponse<void>> => {
    return safeApiCall(
      () => apiClient.post(`/departments/${departmentId}/notes/bulk-delete`),
      voidSchema
    )
  }
}
