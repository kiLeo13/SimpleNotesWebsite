import z from "zod"

// --------------------------------------------------
// API Responses
// --------------------------------------------------
const regStatusSchema = z.enum([
  "ACTIVE",
  "CLOSED",
  "SUSPENDED",
  "UNFIT",
  "UNKNOWN"
])

const companyPartnerSchema = z
  .object({
    name: z.string(),
    role: z.string(),
    role_code: z.int(),
    age_range: z.string() // Well, :shrug:
  })
  .transform((p) => ({
    name: p.name,
    role: p.role,
    roleCode: p.role_code,
    ageRange: p.age_range
  }))

export const companySchema = z
  .object({
    cnpj: z.string(),
    legal_name: z.string(),
    trade_name: z.string().optional(),
    legal_nature: z.string(),
    registration_status: regStatusSchema,
    qsa: z.array(companyPartnerSchema),
    cached: z.boolean()
  })
  .transform((c) => ({
    cnpj: c.cnpj,
    legalName: c.legal_name,
    tradeName: c.trade_name,
    legalNature: c.legal_nature,
    regStatus: c.registration_status,
    partners: c.qsa,
    cached: c.cached
  }))

// Exports
export type CompanyResponse = z.infer<typeof companySchema>
