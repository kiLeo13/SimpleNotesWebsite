import { useEffect, useMemo, useState } from "react"

import { apiTopics } from "../docs/apiReferenceDocs"
import {
  buildApiReferenceTopicSectionIds,
  topicSectionId
} from "../docs/apiReferenceIds"

export function useActiveApiReferenceSection() {
  const sectionIds = useMemo(() => buildApiReferenceTopicSectionIds(apiTopics), [])
  const [activeId, setActiveId] = useState(topicSectionId(apiTopics[0]!.id))

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return
    }

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visible?.target.id) {
          setActiveId(visible.target.id)
        }
      },
      {
        rootMargin: "-18% 0px -70% 0px",
        threshold: [0.1, 0.25, 0.5]
      }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [sectionIds])

  return { activeId }
}
