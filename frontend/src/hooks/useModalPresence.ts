import { useEffect, useState } from "react"

export const MODAL_EXIT_ANIMATION_MS = 180

export function useDelayedUnmount(
  isMounted: boolean,
  delayMs = MODAL_EXIT_ANIMATION_MS
): boolean {
  const [shouldRender, setShouldRender] = useState(isMounted)

  useEffect(() => {
    if (isMounted) {
      setShouldRender(true)
      return
    }

    if (!shouldRender) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setShouldRender(false)
    }, delayMs)

    return () => window.clearTimeout(timeoutId)
  }, [delayMs, isMounted, shouldRender])

  return isMounted || shouldRender
}

type RetainedPresenceValue<T> = {
  renderedValue: T | null
  shouldRender: boolean
}

export function useRetainedModalValue<T>(
  value: T | null,
  delayMs = MODAL_EXIT_ANIMATION_MS
): RetainedPresenceValue<T> {
  const shouldRender = useDelayedUnmount(value !== null, delayMs)
  const [retainedValue, setRetainedValue] = useState<T | null>(value)

  useEffect(() => {
    if (value !== null) {
      setRetainedValue(value)
    }
  }, [value])

  useEffect(() => {
    if (!shouldRender) {
      setRetainedValue(null)
    }
  }, [shouldRender])

  return {
    renderedValue: value ?? retainedValue,
    shouldRender
  }
}
