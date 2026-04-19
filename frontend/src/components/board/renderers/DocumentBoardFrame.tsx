import type { ComponentProps, JSX } from "react"

import styles from "./BoardFrames.module.css"

type DocumentBoardFrameProps = ComponentProps<"iframe"> & {
  url: string
}

export function DocumentBoardFrame({ url, ...props }: DocumentBoardFrameProps): JSX.Element {
  return (
    <iframe
      className={styles.pdfFrame}
      src={url}
      itemType="application/pdf"
      {...props}
    />
  )
}