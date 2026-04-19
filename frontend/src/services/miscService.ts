import type { ApiResponse } from "@/types/api/api"
import { companySchema, type CompanyResponse } from "@/types/api/misc"

import apiClient from "./apiClient"

import { safeApiCall } from "./safeApiCall"

export const miscService = {
  findByCNPJ: async (cnpj: string): Promise<ApiResponse<CompanyResponse>> => {
    return safeApiCall(() => apiClient.get(`/misc/cnpj/${cnpj}`), companySchema)
  }
}
