import type { JSX } from "react"

import { MarkdownDisplay } from "../../displays/markdowns/MarkdownDisplay"

import styles from "./BoardFrames.module.css"

type TextBoardFrameProps = {
  markdown: string
}

export function TextBoardFrame({ markdown }: TextBoardFrameProps): JSX.Element {
  return <MarkdownDisplay
    className={styles.textFrame}
    content={markdown}
  />
}