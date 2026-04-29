import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useDepartmentsStore } from "@/stores/useDepartmentsStore"

export function useDepartmentOptions() {
  const { t } = useTranslation()
  const departments = useDepartmentsStore((state) => state.departments)
  const ensureLoaded = useDepartmentsStore((state) => state.ensureLoaded)

  useEffect(() => {
    ensureLoaded()
  }, [ensureLoaded])

  return useMemo(() => {
    return [
      { label: t("departments.general"), value: "" },
      ...[...departments]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((department) => ({
          label: department.name,
          value: department.id
        }))
    ]
  }, [departments, t])
}
