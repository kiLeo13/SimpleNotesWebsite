import type { JSX } from "react"

import styles from "./BoardFrames.module.css"

type DocumentBoardFrameProps = {
  url: string
}

export function DocumentBoardFrame({ url }: DocumentBoardFrameProps): JSX.Element {
  return (
    <iframe
      className={styles.pdfFrame}
      src={url}
      itemType="application/pdf"
    />
  )
}