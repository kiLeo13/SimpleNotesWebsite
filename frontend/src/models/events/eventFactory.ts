import { z } from "zod"

export interface GatewayEventDef<T extends string, S extends z.ZodTypeAny> {
  type: T
  schema: S
  envelope: z.ZodObject<{ type: z.ZodLiteral<T>; data: S }>
}

export function createEvent<T extends string, S extends z.ZodType>(
  type: T,
  schema: S
): GatewayEventDef<T, S> {
  return {
    type,
    schema,
    envelope: z.object({
      type: z.literal(type),
      data: schema
    })
  }
}
