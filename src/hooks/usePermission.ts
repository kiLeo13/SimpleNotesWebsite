import { Permission } from "@/models/Permission"
import { useSessionStore } from "@/stores/useSessionStore"

export function usePermission(requiredPermission: Permission): boolean {
  const userMask = useSessionStore((state) => state.user?.permissions || 0)

  return Permission.check(userMask, requiredPermission)
}
