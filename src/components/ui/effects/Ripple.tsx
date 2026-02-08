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

export function Ripple({ color = "#d8baff33", duration = 600 }: RippleProps) {
  const [ripples, setRipples] = useState<RippleState[]>([])
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeouts = useRef<number[]>([])

  useLayoutEffect(() => {
    const container = triggerRef.current
    if (!container) return

    const parent = container.parentElement
    if (!parent) return

    const handleMouseDown = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      const newId = Date.now()

      setRipples((prev) => [...prev, { x, y, size, id: newId }])

      const timerId = window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newId))

        timeouts.current = timeouts.current.filter((id) => id !== timerId)
      }, duration)

      timeouts.current.push(timerId)
    }

    parent.addEventListener("mousedown", handleMouseDown)

    return () => {
      parent.removeEventListener("mousedown", handleMouseDown)

      timeouts.current.forEach(clearTimeout)
      timeouts.current = []
    }
  }, [duration])

  return (
    <div ref={triggerRef} className={styles.container}>
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
