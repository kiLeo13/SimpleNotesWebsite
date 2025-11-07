import type { JSX, ReactNode } from "react"

import { clamp, inRange } from "../utils/utils"

import styles from "./DarkWrapper.module.css"
import { createPortal } from "react-dom"

const root = document.getElementById('root')

type DarkWrapperProps = {
  intensity?: number
  animate?: boolean
  children: ReactNode
}

export function DarkWrapper({ intensity = 0.7, animate = true, children }: DarkWrapperProps): JSX.Element {
  if (!inRange(intensity, 0, 1)) {
    console.warn(
      `[DarkWrapper] Warning: 'intensity' must be between 0 and 1. ` +
      `Received ${intensity}. The value will be clamped to the closest valid range.`
    )
  }

  const wrapperClassName = `${styles.wrapper} ${animate ? '' : styles.noAnimation}`.trim()
  const css = { backgroundColor: `rgba(0, 0, 0, ${clamp(intensity, 0, 1)})` }
  return createPortal(
    <div
      className={wrapperClassName}
      style={css}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
    >
      {children}
    </div>,
    root!
  )
}