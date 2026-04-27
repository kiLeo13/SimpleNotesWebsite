import type { ApiExample } from "../docs/apiReferenceDocs"

import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"

import { ApiReferenceCode } from "./ApiReferenceCode"
import { ApiReferenceCodePre } from "./ApiReferenceCodePre"

import styles from "./ApiReferenceCodeBlock.module.css"

export function ApiReferenceCodeBlock({ example }: { example: ApiExample }) {
  const markdown = `\`\`\`${example.language ?? "json"}\n${example.code.trimEnd()}\n\`\`\``

  return (
    <figure className={styles.codeBlock}>
      {example.label ? (
        <figcaption className={styles.caption}>{example.label}</figcaption>
      ) : null}
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: ApiReferenceCode,
          pre: ApiReferenceCodePre
        }}
      >
        {markdown}
      </ReactMarkdown>
    </figure>
  )
}
