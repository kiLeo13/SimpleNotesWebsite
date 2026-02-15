import type { ComponentProps, JSX } from "react"
import type { LoaderContainer } from "@/components/LoaderContainer"

import clsx from "clsx"

import { LoaderWrapper } from "@/components/loader/LoaderWrapper"
import { Ripple } from "../effects/Ripple"

import styles from "./Button.module.css"

type LoaderContainerProps = ComponentProps<typeof LoaderContainer>

type ButtonProps = ComponentProps<"button"> & {
  isLoading?: boolean
  loaderProps?: LoaderContainerProps
}

export function Button({
  isLoading,
  loaderProps,
  ...props
}: ButtonProps): JSX.Element {
  const { children, className, ...rest } = props

  return (
    <LoaderWrapper isLoading={isLoading || false} loaderProps={loaderProps}>
      <button {...rest} className={clsx(styles.button, className)}>
        <Ripple />
        {children}
      </button>
    </LoaderWrapper>
  )
}
