import type { ComponentProps, JSX } from "react"

import clsx from "clsx"

import { LoaderContainer } from "../LoaderContainer"

import styles from "./LoaderWrapper.module.css"

type LoaderContainerProps = ComponentProps<typeof LoaderContainer>

type LoaderWrapperProps = ComponentProps<"div"> & {
  isLoading: boolean
  loaderProps?: LoaderContainerProps
}

export function LoaderWrapper({
  isLoading,
  children,
  loaderProps,
  className,
  ...props
}: LoaderWrapperProps): JSX.Element {
  return (
    <div className={clsx(styles.loadLayer, className)} {...props}>
      {isLoading && <LoaderContainer {...loaderProps} />}
      {children}
    </div>
  )
}
