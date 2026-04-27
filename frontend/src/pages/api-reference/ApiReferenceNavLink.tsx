import clsx from "clsx"

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
  return (
    <a
      className={clsx(
        nested ? styles.nestedNavItem : styles.navItem,
        active && styles.activeNavItem
      )}
      href={href}
    >
      {label}
    </a>
  )
}
