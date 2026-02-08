import { z } from "zod"

export function createEvent<T extends string, S extends z.ZodType>(
  type: T,
  schema: S
) {
  return {
    type,
    schema,
    envelope: z.object({
      type: z.literal(type),
      data: schema
    })
  }
}
