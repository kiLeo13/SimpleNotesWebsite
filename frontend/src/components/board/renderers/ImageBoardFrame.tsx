import type { ComponentProps, JSX } from "react"

import styles from "./BoardFrames.module.css"

type ImageBoardFrameProps = ComponentProps<"img"> & {
  url: string
}

export function ImageBoardFrame({ url, ...props }: ImageBoardFrameProps): JSX.Element {
  return (
    <img
      className={styles.imageFrame}
      src={url}
      {...props}
    />
  )
}