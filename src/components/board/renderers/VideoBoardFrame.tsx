import type { JSX } from "react"

import styles from "./BoardFrames.module.css"

type VideoBoardFrameProps = {
  url: string
}

export function VideoBoardFrame({ url }: VideoBoardFrameProps): JSX.Element {
  return (
    <video
      className={styles.videoFrame}
      muted={true}
      controls={true}
      src={url}
    />
  )
}