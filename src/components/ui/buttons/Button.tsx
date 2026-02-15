import type { ComponentProps, JSX } from "react"
import type { LoaderContainer } from "@/components/LoaderContainer"

import clsx from "clsx"

import { LoaderWrapper } from "@/components/loader/LoaderWrapper"
import { Ripple } from "../effects/Ripple"

import styles from "./Button.module.css"

type LoaderContainerProps = ComponentProps<typeof LoaderContainer>

type RippleProps = ComponentProps<typeof Ripple>

type ButtonProps = ComponentProps<"button"> & {
  isLoading?: boolean
  loaderProps?: LoaderContainerProps
  rippleProps?: RippleProps
}

/**
 * `Button` is a reusable component that renders a button with an optional loading state.
 * It is the main button throughout the app and should be used for all primary actions to ensure consistency in design and behavior.
 *
 * It uses {@link LoaderWrapper} to display a loader when `isLoading` is `true`,
 * and applies a ripple effect on click.
 *
 * The button, loader and ripple can be customized with additional props and styles.
 *
 * @returns {JSX.Element} Button.
 */
export function Button({
  isLoading,
  loaderProps,
  rippleProps,
  ...props
}: ButtonProps): JSX.Element {
  const { children, className, ...rest } = props

  return (
    <LoaderWrapper isLoading={isLoading || false} loaderProps={loaderProps}>
      <button {...rest} className={clsx(styles.button, className)}>
        <Ripple {...rippleProps} />
        {children}
      </button>
    </LoaderWrapper>
  )
}
