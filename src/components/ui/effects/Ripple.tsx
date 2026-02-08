import { useState, useLayoutEffect, useRef } from "react"

import styles from "./Ripple.module.css"

interface RippleState {
  x: number
  y: number
  size: number
  id: number
}

interface RippleProps {
  color?: string
  duration?: number
}

export function Ripple({ color, duration = 600 }: RippleProps) {
  const [ripples, setRipples] = useState<RippleState[]>([])
  const ref = useRef<HTMLDivElement>(null)

  // We use useLayoutEffect to ensure we attach listeners before painting
  // if the component is conditionally rendered.
  useLayoutEffect(() => {
    const container = ref.current
    if (!container) return

    const parent = container.parentElement
    if (!parent) {
      console.warn("Ripple component missing parent element")
      return
    }

    const handleMouseDown = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect()

      // Calculate the size (diameter) to cover the parent
      const size = Math.max(rect.width, rect.height)

      // Calculate exact cursor position relative to parent
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      const newRipple = { x, y, size, id: Date.now() }
      setRipples((prev) => [...prev, newRipple])
    }

    // Attach listener to the parent automatically
    parent.addEventListener("mousedown", handleMouseDown)
    return () => parent.removeEventListener("mousedown", handleMouseDown)
  }, [])

  // Clean old ripples
  useLayoutEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1))
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [ripples, duration])

  return (
    <div ref={ref} className={styles.container}>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={styles.ripple}
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
            animationDuration: `${duration}ms`
          }}
        />
      ))}
    </div>
  )
}
