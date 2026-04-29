import type { DepartmentData } from "@/types/api/departments"
import type { JSX } from "react"

import { getDepartmentIconUrl } from "@/utils/departmentIcons"

import styles from "./DepartmentIcon.module.css"

type DepartmentIconProps = {
  department: DepartmentData
  className?: string
}

export function DepartmentIcon({
  department,
  className
}: DepartmentIconProps): JSX.Element {
  if (department.icon_type === "IMAGE") {
    return (
      <img
        className={className ?? styles.icon}
        src={getDepartmentIconUrl(department.icon_value)}
        alt=""
        loading="lazy"
      />
    )
  }

  return (
    <span className={className ?? styles.icon} aria-hidden="true">
      {department.icon_value}
    </span>
  )
}
