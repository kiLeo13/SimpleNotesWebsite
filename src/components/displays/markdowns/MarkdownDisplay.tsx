import { useEffect, useRef, type ComponentProps, type JSX } from "react"
import ReactMarkdown, { type Components } from "react-markdown"

import remarkGfm from "remark-gfm"
import remarkEmoji from "remark-emoji"
import remarkDirective from "remark-directive"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import twemoji from "twemoji"
import clsx from "clsx"

import { CustomTooltip } from "./custom/CustomTooltip"
import { NoteReference } from "./custom/NoteReference"
import { remarkCustomDirectives } from "./remarkCustomDirectives"

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
    tagNames: [...(defaultSchema.tagNames || []), "note-ref", "custom-tooltip"],
    attributes: {
      ...defaultSchema.attributes,
      p: [...(defaultSchema.attributes?.p || []), "color", "style"],
      code: [...(defaultSchema.attributes?.code || []), "className"],
      img: [
        ...(defaultSchema.attributes?.img || []),
        "align",
        "src",
        "alt",
        "width",
        "height",
        "className"
      ],
      span: [...(defaultSchema.attributes?.span || []), "style"],
      div: [...(defaultSchema.attributes?.div || []), "style"],
      "note-ref": ["noteid"],
      "custom-tooltip": ["content"]
    }
  }

  return (
    <div ref={containerRef} className={clsx(styles.md, className)} {...props}>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkEmoji,
          remarkDirective, // 1. Register directive syntax
          remarkCustomDirectives // 2. Transform directives to custom AST nodes
        ]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeHighlight]}
        components={
          {
            a: ({ ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            ),
            img: ({ ...props }) => (props.src ? <img {...props} /> : null),

            // Custom components
            "note-ref": NoteReference,
            "custom-tooltip": CustomTooltip

          } as Partial<Components> & Record<string, React.ElementType>
        }
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
