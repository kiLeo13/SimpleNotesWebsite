import { useEffect, useRef, type ComponentProps, type JSX } from "react"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkEmoji from "remark-emoji"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import clsx from "clsx"
import twemoji from "twemoji"

import styles from "./MarkdownDisplay.module.css"

type MarkdownDisplayProps = ComponentProps<"div"> & {
  content: string
}

export function MarkdownDisplay({
  content,
  className,
  ...props
}: MarkdownDisplayProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      twemoji.parse(containerRef.current, {
        folder: "svg",
        ext: ".svg"
      })
    }
  }, [content])

  const schema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      code: [...(defaultSchema.attributes?.code || []), "className"],
      img: [...(defaultSchema.attributes?.img || []), "align", "src", "alt", "width", "height", "className"],
      span: [...(defaultSchema.attributes?.span || []), "style"],
      div: [...(defaultSchema.attributes?.div || []), "style"]
    }
  }

  return (
    <div ref={containerRef} className={clsx(styles.md, className)} {...props}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkEmoji]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeHighlight]}
        components={{
          a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          img: ({ ...props }) => (props.src ? <img {...props} /> : null)
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
