import { useEffect, useMemo, useState } from "react"

import { apiResources, apiTopics } from "./apiReferenceDocs"
import {
  buildApiReferenceSectionIds,
  categoryForSection,
  topicSectionId,
  type NavCategory
} from "./apiReferenceIds"

export function useActiveApiReferenceSection() {
  const sectionIds = useMemo(
    () => buildApiReferenceSectionIds(apiTopics, apiResources),
    []
  )
  const [activeId, setActiveId] = useState(topicSectionId(apiTopics[0]!.id))
  const [openCategories, setOpenCategories] = useState<
    Record<NavCategory, boolean>
  >({
    reference: true,
    resources: false
  })

  const activeCategory = categoryForSection(activeId)

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

  useEffect(() => {
    setOpenCategories((current) => {
      const next = {
        reference: activeCategory === "reference",
        resources: activeCategory === "resources"
      }

      if (
        current.reference === next.reference &&
        current.resources === next.resources
      ) {
        return current
      }

      return next
    })
  }, [activeCategory])

  const toggleCategory = (category: NavCategory) => {
    setOpenCategories((current) => ({
      ...current,
      [category]: !current[category]
    }))
  }

  return {
    activeId,
    openCategories,
    toggleCategory
  }
}
