import type { JSX } from "react"

import styles from "./BoardFrames.module.css"

type ImageBoardFrameProps = {
  url: string
}

export function ImageBoardFrame({ url }: ImageBoardFrameProps): JSX.Element {
  return (
    <img
      className={styles.imageFrame}
      src={url}
    />
  )
}