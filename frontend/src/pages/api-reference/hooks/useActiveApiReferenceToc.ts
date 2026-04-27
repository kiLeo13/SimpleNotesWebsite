import { useEffect, useMemo, useState, type RefObject } from "react"

import type { ApiReferenceTocItem } from "../docs/apiReferenceToc"

export function useActiveApiReferenceToc(
  items: ApiReferenceTocItem[],
  scrollRootRef: RefObject<HTMLElement | null>
) {
  const itemIds = useMemo(() => items.map((item) => item.id), [items])
  const itemIdsKey = itemIds.join("|")
  const firstItemId = itemIds[0] ?? ""
  const [activeId, setActiveId] = useState(firstItemId)

  useEffect(() => {
    setActiveId(firstItemId)
  }, [firstItemId, itemIdsKey])

  useEffect(() => {
    const scrollRoot = scrollRootRef.current
    if (!scrollRoot || itemIds.length === 0) return

    let frameId = 0

    const updateActiveId = () => {
      const rootTop = scrollRoot.getBoundingClientRect().top
      const nextActiveId =
        itemIds.reduce((currentActiveId, itemId) => {
          const element = document.getElementById(itemId)
          if (!element) return currentActiveId

          const distanceFromRoot = element.getBoundingClientRect().top - rootTop
          if (distanceFromRoot <= 120) return itemId

          return currentActiveId
        }, firstItemId) || firstItemId

      setActiveId(nextActiveId)
    }

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(updateActiveId)
    }

    scheduleUpdate()

    scrollRoot.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      window.cancelAnimationFrame(frameId)
      scrollRoot.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [firstItemId, itemIds, itemIdsKey, scrollRootRef])

  return activeId
}
