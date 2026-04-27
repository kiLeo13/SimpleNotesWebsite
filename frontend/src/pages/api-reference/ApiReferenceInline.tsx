import type { JSX } from "react"
import type { InlineTextPart } from "./apiReferenceDocs"

import { resourceSectionId, topicSectionId } from "./apiReferenceIds"

export function renderInline(parts: InlineTextPart[]): JSX.Element[] {
  return parts.map((part, index) => {
    if (typeof part === "string") {
      return <span key={index}>{part}</span>
    }

    if (part.resourceId) {
      return (
        <a key={index} href={`#${resourceSectionId(part.resourceId)}`}>
          {part.label}
        </a>
      )
    }

    if (part.sectionId) {
      return (
        <a key={index} href={`#${topicSectionId(part.sectionId)}`}>
          {part.label}
        </a>
      )
    }

    if (part.href) {
      return (
        <a href={part.href} target="_blank" rel="noopener noreferrer">
          {part.label}
        </a>
      )
    }

    return <code key={index}>{part.label}</code>
  })
}
