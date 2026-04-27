import type { JSX } from "react"
import type { InlineTextPart } from "../docs/apiReferenceDocs"

import { Link } from "@tanstack/react-router"
import { topicSectionId } from "../docs/apiReferenceIds"

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
        <Link
          key={index}
          className={classNames.link}
          to="/api/reference/$resourceId"
          params={{ resourceId: part.resourceId }}
          hash={part.hash}
        >
          {part.label}
        </Link>
      )
    }

    if (part.sectionId) {
      return (
        <Link
          key={index}
          className={classNames.link}
          to="/api/reference"
          hash={topicSectionId(part.sectionId)}
        >
          {part.label}
        </Link>
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
