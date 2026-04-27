import type { ApiExample } from "./apiReferenceDocs"

import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"

import styles from "./ApiReferenceCodeBlock.module.css"

export function CodeBlock({ example }: { example: ApiExample }) {
  const markdown = `\`\`\`${example.language ?? "json"}\n${example.code.trimEnd()}\n\`\`\``

  return (
    <figure className={styles.codeBlock}>
      {example.label && <figcaption>{example.label}</figcaption>}
      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
        {markdown}
      </ReactMarkdown>
    </figure>
  )
}
