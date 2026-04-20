import type { AuditLogEntryData } from "@/types/api/audit"
import type { UserResponseData } from "@/types/api/users"
import type { AuditTranslate } from "./AuditLogEvent"
import { type AuditFilters, toAuditLogQuery } from "./auditFilters"

import { useCallback, useEffect, useRef, useState } from "react"
import { useUsersStore } from "@/stores/useUsersStore"
import { auditService } from "@/services/auditService"
import { userService } from "@/services/userService"
import { toasts } from "@/utils/toastUtils"

type UseAuditLogsDataArgs = {
  appliedFilters: AuditFilters
  t: AuditTranslate
}

type UseAuditLogsDataResult = {
  entries: AuditLogEntryData[]
  nextBeforeId: string | null
  isLoadingInitial: boolean
  isLoadingMore: boolean
  hasLoadError: boolean
  loadInitialLogs: () => Promise<void>
  loadMoreLogs: () => Promise<void>
  resolveUserLabel: (userId: number | undefined) => string
  resolveActorLabel: (actorUserId: number | undefined) => string
}

export function useAuditLogsData({
  appliedFilters,
  t
}: UseAuditLogsDataArgs): UseAuditLogsDataResult {
  const users = useUsersStore((state) => state.users)
  const ensureUsersLoaded = useUsersStore((state) => state.ensureLoaded)

  const [entries, setEntries] = useState<AuditLogEntryData[]>([])
  const [nextBeforeId, setNextBeforeId] = useState<string | null>(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasLoadError, setHasLoadError] = useState(false)
  const [fetchedUsers, setFetchedUsers] = useState<
    Record<number, UserResponseData | null>
  >({})
  const requestVersionRef = useRef(0)

  const resolveUserLabel = useCallback(
    (userId: number | undefined): string => {
      if (userId == null) {
        return t("modals.audit.system")
      }

      const fromStore = users.find((user) => user.id === userId)
      if (fromStore) {
        return fromStore.username
      }

      const fromFallback = fetchedUsers[userId]
      if (fromFallback) {
        return fromFallback.username
      }

      if (fromFallback === null) {
        return t("modals.audit.unknownActor", { id: userId })
      }

      return t("modals.audit.loadingActor", { id: userId })
    },
    [fetchedUsers, t, users]
  )

  const resolveActorLabel = useCallback(
    (actorUserId: number | undefined): string => resolveUserLabel(actorUserId),
    [resolveUserLabel]
  )

  const loadLogs = useCallback(
    async ({
      reset,
      beforeId
    }: {
      reset: boolean
      beforeId?: string
    }): Promise<void> => {
      const requestVersion = ++requestVersionRef.current

      if (reset) {
        setHasLoadError(false)
        setIsLoadingInitial(true)
      } else {
        setIsLoadingMore(true)
      }

      const resp = await auditService.listAuditLogs({
        ...toAuditLogQuery(appliedFilters),
        beforeId
      })

      if (requestVersion !== requestVersionRef.current) {
        return
      }

      if (reset) {
        setIsLoadingInitial(false)
      } else {
        setIsLoadingMore(false)
      }

      if (!resp.success) {
        if (reset) {
          setEntries([])
          setNextBeforeId(null)
          setHasLoadError(true)
        }

        toasts.apiError(t("errors.auditLogs"), resp)
        return
      }

      setNextBeforeId(resp.data.nextBeforeId ?? null)

      if (reset) {
        setEntries(resp.data.entries)
        return
      }

      setEntries((current) => [
        ...current,
        ...resp.data.entries.filter(
          (entry) => !current.some((existing) => existing.id === entry.id)
        )
      ])
    },
    [appliedFilters, t]
  )

  const loadInitialLogs = useCallback(async (): Promise<void> => {
    await loadLogs({ reset: true })
  }, [loadLogs])

  const loadMoreLogs = useCallback(async (): Promise<void> => {
    if (!nextBeforeId || isLoadingInitial || isLoadingMore) {
      return
    }

    await loadLogs({ reset: false, beforeId: nextBeforeId })
  }, [isLoadingInitial, isLoadingMore, loadLogs, nextBeforeId])

  useEffect(() => void ensureUsersLoaded(), [ensureUsersLoaded])

  useEffect(() => void loadInitialLogs(), [loadInitialLogs])

  useEffect(() => {
    const referencedUserIds = entries.flatMap((entry) => {
      const ids: number[] = []

      if (entry.actorUserId != null) {
        ids.push(entry.actorUserId)
      }

      if (entry.subjectType === "USER") {
        const subjectUserId = Number(entry.subjectId)

        if (Number.isInteger(subjectUserId)) {
          ids.push(subjectUserId)
        }
      }

      return ids
    })

    const missingUserIds = Array.from(new Set(referencedUserIds)).filter(
      (userId) =>
        !users.some((user) => user.id === userId) && !(userId in fetchedUsers)
    )

    if (missingUserIds.length === 0) {
      return
    }

    let cancelled = false

    void Promise.all(
      missingUserIds.map(async (userId) => {
        const resp = await userService.getUserById(userId)
        return [userId, resp.success ? resp.data : null] as const
      })
    ).then((results) => {
      if (cancelled) {
        return
      }

      setFetchedUsers((current) => ({
        ...current,
        ...Object.fromEntries(results)
      }))
    })

    return () => {
      cancelled = true
    }
  }, [entries, fetchedUsers, users])

  return {
    entries,
    nextBeforeId,
    isLoadingInitial,
    isLoadingMore,
    hasLoadError,
    loadInitialLogs,
    loadMoreLogs,
    resolveUserLabel,
    resolveActorLabel
  }
}
