import {
  useEffect,
  useState,
  type ComponentProps,
  type JSX,
  type CSSProperties
} from "react"
import type { LoaderContainer } from "@/components/LoaderContainer"

import clsx from "clsx"

import { LoaderWrapper } from "@/components/loader/LoaderWrapper"
import { Ripple } from "../effects/Ripple"

import styles from "./Button.module.css"

type LoaderContainerProps = ComponentProps<typeof LoaderContainer>
type RippleProps = ComponentProps<typeof Ripple>

interface CustomCSS extends CSSProperties {
  "--cooldown-duration"?: string
}

type ButtonProps = ComponentProps<"button"> & {
  isLoading?: boolean
  loaderProps?: LoaderContainerProps
  rippleProps?: RippleProps
  cooldown?: number
}

export function Button({
  isLoading,
  loaderProps,
  rippleProps,
  cooldown = 0,
  className,
  children,
  onClick,
  disabled,
  style,
  ...props
}: ButtonProps): JSX.Element {
  const [isCoolingDown, setIsCoolingDown] = useState(cooldown > 0)

  useEffect(() => {
    if (cooldown <= 0) return

    setIsCoolingDown(true)

    const timerId = window.setTimeout(() => {
      setIsCoolingDown(false)
    }, cooldown)

    return () => window.clearTimeout(timerId)
  }, [cooldown])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    if (isCoolingDown) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    onClick?.(e)
  }

  return (
    <LoaderWrapper isLoading={isLoading || false} loaderProps={loaderProps}>
      <button
        {...props}
        onClick={handleClick}
        disabled={disabled}
        tabIndex={isCoolingDown ? -1 : props.tabIndex}
        style={
          {
            ...style,
            "--cooldown-duration": `${cooldown}ms`
          } as CustomCSS
        }
        className={clsx(
          styles.button,
          isCoolingDown && styles.coolingDown,
          className
        )}
      >
        {isCoolingDown && <span className={styles.cooldownBar} />}
        
        {!isCoolingDown && <Ripple {...rippleProps} />}

        {children}
      </button>
    </LoaderWrapper>
  )
}
