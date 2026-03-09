import type { ComponentProps, JSX } from "react"
import type { ExtraProps } from "react-markdown"

import { ParagraphTooltip } from "@/components/ui/ParagraphTooltip"

import styles from "./CustomTooltip.module.css"

type CustomTooltipProps = ComponentProps<"span"> &
  ExtraProps & {
    content?: string
  }

export function CustomTooltip({
  content,
  children,
  ...props
}: CustomTooltipProps): JSX.Element {
  return (
    <ParagraphTooltip content={content || ""}>
      <span className={styles.tooltipTrigger} {...props}>
        {children}
      </span>
    </ParagraphTooltip>
  )
}
