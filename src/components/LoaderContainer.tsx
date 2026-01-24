import type { ComponentProps, JSX } from "react"

import clsx from "clsx"

import styles from "./LoaderContainer.module.css"

type LoaderContainerProps = ComponentProps<"div"> & {
  scale?: string | number
  loaderColor?: string
}

export function LoaderContainer({
  scale,
  loaderColor,
  ...props
}: LoaderContainerProps): JSX.Element {
  const { className, ...rest } = props

  return (
    <div className={clsx(styles.container, className)} {...rest}>
      <div
        className="loader"
        style={{
          scale: scale,
          borderTopColor: loaderColor,
          borderLeftColor: loaderColor
        }}
      />
    </div>
  )
}
