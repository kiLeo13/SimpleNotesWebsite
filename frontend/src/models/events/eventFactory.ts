import { z } from "zod"

export interface GatewayEventDefinition<T extends string, S extends z.ZodTypeAny> {
  type: T
  schema: S
  envelope: z.ZodObject<{
    type: z.ZodLiteral<T>
    data: S
    event_id: z.ZodOptional<z.ZodString>
  }>
}

export function createEvent<T extends string, S extends z.ZodTypeAny>(
  type: T,
  schema: S
): GatewayEventDefinition<T, S> {
  return {
    type,
    schema,
    envelope: z.object({
      type: z.literal(type),
      data: schema,
      event_id: z.string().optional()
    })
  }
}
