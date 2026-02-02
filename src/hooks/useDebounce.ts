import { useEffect, useState } from "react"

/**
 * A hook that delays updating a value until after a specified delay has passed.
 * Useful for preventing expensive operations (like Mermaid rendering or API calls)
 * from running on every keystroke.
 * 
 * @template T - The type of the value being debounced.
 * @param {T} value - The input value to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {T} The debounced value.
 * @example
 * const [text, setText] = useState("");
 * const debouncedText = useDebounce(text, 500);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
