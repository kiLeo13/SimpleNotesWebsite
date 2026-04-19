import { useEffect, useRef, useState, type RefObject } from "react";

export function useHover<T extends HTMLElement = HTMLDivElement>(): [RefObject<T | null>, boolean] {
  const [value, setValue] = useState<boolean>(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const handleMouseOver = () => setValue(true)
    const handleMouseOut = () => setValue(false)

    node.addEventListener('mouseenter', handleMouseOver)
    node.addEventListener('mouseleave', handleMouseOut)
    
    return () => {
      node.removeEventListener('mouseenter', handleMouseOver)
      node.removeEventListener('mouseleave', handleMouseOut)
    }
  }, [])

  return [ref, value]
}