import { useCallback, useState } from "react"

export function useSupplier<T>(supplier: () => T): [boolean, () => T] {
  const [isLoading, setIsLoading] = useState(false)

  const submit = useCallback(() => {
    setIsLoading(true)
    try {
      return supplier()
    } catch (err) {
      throw new Error(`Supplier threw unexpected error: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }, [supplier])

  return [isLoading, submit]
}