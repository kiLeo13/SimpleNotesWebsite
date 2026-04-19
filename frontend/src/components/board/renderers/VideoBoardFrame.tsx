import type { ComponentProps, JSX } from "react"

import styles from "./BoardFrames.module.css"

type VideoBoardFrameProps = ComponentProps<"video"> & {
  url: string
}

export function VideoBoardFrame({ url, ...props }: VideoBoardFrameProps): JSX.Element {
  return (
    <video
      className={styles.videoFrame}
      muted={true}
      controls={true}
      src={url}
      {...props}
    />
  )
}