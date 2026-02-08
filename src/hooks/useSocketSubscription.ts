import { useEffect, useRef } from "react"
import { z } from "zod"
import { socketBus } from "@/services/socketBus"
import type { GatewayEventDef } from "@/models/events/eventFactory"

export function useSocketSubscription<S extends z.ZodTypeAny>(
  event: GatewayEventDef<string, S>,
  callback: (data: z.infer<S>) => void
) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const unsubscribe = socketBus.on(event.type, (payload: unknown) => {
      const result = event.schema.safeParse(payload)

      if (result.success) {
        savedCallback.current(result.data)
      } else {
        console.warn(`Socket event '${event.type}' schema mismatch:`, result.error.flatten())
      }
    })

    return () => {
      unsubscribe()
    }
  }, [event])
}
