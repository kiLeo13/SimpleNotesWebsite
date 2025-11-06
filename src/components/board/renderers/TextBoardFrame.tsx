import type { JSX } from "react"

import DOMPurify from "dompurify"
import { marked } from "marked"

import styles from "./BoardFrames.module.css"

type TextBoardFrameProps = {
  markdown: string
}

export function TextBoardFrame({ markdown }: TextBoardFrameProps): JSX.Element {
  const dirty = marked(markdown, { async: false })
  const clean = DOMPurify.sanitize(dirty)

  return (
    <div
      className={styles.textFrame}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}