import clsx from "clsx"
import { Link } from "@tanstack/react-router"

import styles from "./ApiReferenceNavLink.module.css"

type ApiReferenceNavLinkProps = {
  active: boolean
  href: string
  label: string
  nested?: boolean
}

export function ApiReferenceNavLink({
  active,
  href,
  label,
  nested = false
}: ApiReferenceNavLinkProps) {
  const className = clsx(
    nested ? styles.nestedNavItem : styles.navItem,
    active && styles.activeNavItem
  )
  const referenceHash = href.match(/^\/api\/reference#(.+)$/)?.[1]
  const referenceDetailId = href.match(/^\/api\/reference\/([^#]+)$/)?.[1]

  if (referenceHash) {
    return (
      <Link className={className} to="/api/reference" hash={referenceHash}>
        {label}
      </Link>
    )
  }

  if (referenceDetailId) {
    return (
      <Link
        className={className}
        to="/api/reference/$resourceId"
        params={{ resourceId: referenceDetailId }}
      >
        {label}
      </Link>
    )
  }

  return (
    <a
      className={className}
      href={href}
    >
      {label}
    </a>
  )
}
