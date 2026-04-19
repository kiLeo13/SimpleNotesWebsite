import type { ComponentProps, JSX } from "react"

import styles from "./BoardFrames.module.css"

type AudioBoardFrameProps = ComponentProps<"audio"> & {
  url: string
}

export function AudioBoardFrame({ url, ...props }: AudioBoardFrameProps): JSX.Element {
  return (
    <audio
      className={styles.audioFrame}
      controls={true}
      muted={true}
      src={url}
      {...props}
    />
  )
}