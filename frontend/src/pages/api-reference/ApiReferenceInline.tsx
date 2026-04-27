import type { JSX } from "react"
import type { InlineTextPart } from "./apiReferenceDocs"

import { resourceSectionId, topicSectionId } from "./apiReferenceIds"

type InlineClassNames = {
  code?: string
  link?: string
}

export function renderInline(
  parts: InlineTextPart[],
  classNames: InlineClassNames = {}
): JSX.Element[] {
  return parts.map((part, index) => {
    if (typeof part === "string") {
      return <span key={index}>{part}</span>
    }

    if (part.resourceId) {
      return (
        <a
          key={index}
          className={classNames.link}
          href={`#${resourceSectionId(part.resourceId)}`}
        >
          {part.label}
        </a>
      )
    }

    if (part.sectionId) {
      return (
        <a
          key={index}
          className={classNames.link}
          href={`#${topicSectionId(part.sectionId)}`}
        >
          {part.label}
        </a>
      )
    }

    if (part.href) {
      return (
        <a
          key={index}
          className={classNames.link}
          href={part.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {part.label}
        </a>
      )
    }

    return (
      <code key={index} className={classNames.code}>
        {part.label}
      </code>
    )
  })
}
