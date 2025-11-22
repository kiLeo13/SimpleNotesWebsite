import type { ComponentProps, JSX } from "react"

import clsx from "clsx"

import styles from "./LoaderContainer.module.css"

type LoaderContainerProps = ComponentProps<"div"> & {
  scale?: string
}

export function LoaderContainer({ scale, ...props }: LoaderContainerProps): JSX.Element {
  return (
    <div className={styles.container} {...props}>
      <div className={clsx("loader", styles.loader)} style={{ scale: scale }} />
    </div>
  )
}