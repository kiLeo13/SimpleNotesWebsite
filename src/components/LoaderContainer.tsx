import type { JSX } from "react"

import clsx from "clsx"

import styles from "./LoaderContainer.module.css"

type LoaderContainerProps = {
  scale?: string
}

export function LoaderContainer({ scale }: LoaderContainerProps): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={clsx("loader", styles.loader)} style={{ scale: scale }} />
    </div>
  )
}