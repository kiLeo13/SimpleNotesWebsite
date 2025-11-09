import type { CSSProperties, JSX, ReactNode } from "react"

import clsx from "clsx"

import { clamp, inRange } from "../utils/utils"
import { createPortal } from "react-dom"

import styles from "./DarkWrapper.module.css"

const root = document.getElementById('root')

type DarkWrapperProps = {
  intensity?: number
  blurpx?: number
  animate?: boolean
  portalContainer?: Element | DocumentFragment | null
  children: ReactNode
}

export function DarkWrapper({
  intensity = 0.7,
  blurpx = 2,
  animate = true,
  portalContainer,
  children
}: DarkWrapperProps): JSX.Element {

  if (!inRange(intensity, 0, 1)) {
    console.warn(
      `[DarkWrapper] Warning: 'intensity' must be between 0 and 1. ` +
      `Received ${intensity}. The value will be clamped to the closest valid range.`
    )
  }

  const container = portalContainer ?? root!
  const css: CSSProperties = {
    backdropFilter: `blur(${blurpx}px)`,
    backgroundColor: `rgba(0, 0, 0, ${clamp(intensity, 0, 1)})`
  }
  return createPortal(
    <div
      className={clsx(styles.wrapper, !animate && styles.noAnimation)}
      style={css}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
    >
      {children}
    </div>,
    container
  )
}