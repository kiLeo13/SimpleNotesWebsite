import z from "zod"

// API Response Data after transformation (schemas)
export const VoidSchema = z.undefined().or(z.null()).or(z.literal('')).transform(() => undefined)