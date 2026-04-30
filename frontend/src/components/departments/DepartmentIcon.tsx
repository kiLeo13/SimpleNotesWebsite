import type { DepartmentData } from "@/types/api/departments"
import { useEffect, useRef, type JSX } from "react"

import { getDepartmentIconUrl } from "@/utils/departmentIcons"
import twemoji from "twemoji"

import styles from "./DepartmentIcon.module.css"

type DepartmentIconProps = {
  department: DepartmentData
  className?: string
}

export function DepartmentIcon({
  department,
  className
}: DepartmentIconProps): JSX.Element {
  const emojiRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (department.icon_type === "EMOJI" && emojiRef.current) {
      twemoji.parse(emojiRef.current, {
        folder: "svg",
        ext: ".svg"
      })
    }
  }, [department.icon_type, department.icon_value])

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
    <span ref={emojiRef} className={className ?? styles.icon} aria-hidden="true">
      {department.icon_value}
    </span>
  )
}

