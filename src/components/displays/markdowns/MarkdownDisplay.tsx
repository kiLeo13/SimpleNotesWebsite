import type { ComponentProps, JSX } from "react"

import DOMPurify from "dompurify"
import clsx from "clsx"

import { marked } from "marked"

import styles from "./MarkdownDisplay.module.css"

type MarkdownDisplayProps = ComponentProps<"div"> & {
  content: string
}

export function MarkdownDisplay({ content, ...props }: MarkdownDisplayProps): JSX.Element {
  const dirty = marked(content, { async: false })
  const clean = DOMPurify.sanitize(dirty)
  const { className, ...restProps } = props

  return (
    <div
      className={clsx(styles.md, className)}
      {...restProps}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}