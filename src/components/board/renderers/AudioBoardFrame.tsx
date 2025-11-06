import type { JSX } from "react"

import styles from "./BoardFrames.module.css"

type AudioBoardFrameProps = {
  url: string
}

export function AudioBoardFrame({ url }: AudioBoardFrameProps): JSX.Element {
  return (
    <audio
      className={styles.audioFrame}
      controls={true}
      muted={true}
      src={url}
    />
  )
}