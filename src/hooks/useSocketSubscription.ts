import { useEffect, useRef } from "react"
import { z } from "zod"
import { GatewayEvent } from "../models/events/GatewayEvent"
import { socketBus } from "@/services/socketBus"

export function useSocketSubscription<S extends z.ZodTypeAny>(
  event: GatewayEvent<S>,
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
