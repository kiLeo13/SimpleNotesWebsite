import { useState, useCallback, useRef } from "react"

export function useAsync<A extends unknown[], R>(
  action: (...args: A) => Promise<R>
): [
  (...args: A) => Promise<R>,
  boolean
] {
  const [isLoading, setIsLoading] = useState(false)
  const actionRef = useRef(action)
  actionRef.current = action

  const trigger = useCallback(
    async (...args: A) => {
      setIsLoading(true)
      const resp = await actionRef.current(...args)
      setIsLoading(false)
      return resp
    },
    []
  )

  return [trigger, isLoading]
}