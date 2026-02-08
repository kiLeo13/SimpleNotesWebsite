import React, { type JSX } from "react"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import styles from "./ActionMenu.module.css"

export interface MenuActionItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
}

interface ActionMenuProps {
  children: React.ReactNode
  header?: string
  items: MenuActionItem[]
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  isolateEvents?: boolean
}

export function ActionMenu({
  children,
  header,
  items,
  side = "bottom",
  align = "start",
  isolateEvents = true
}: ActionMenuProps): JSX.Element {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={styles.menuContent}
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={10}
        >
          {header && (
            <>
              <DropdownMenu.Label className={styles.menuLabel}>{header}</DropdownMenu.Label>
              <DropdownMenu.Separator className={styles.menuSeparator} />
            </>
          )}

          {items.map((item, index) => (
            <DropdownMenu.Item
              key={`${item.label}-${index}`}
              className={styles.menuItem}
              onSelect={item.onClick}
              onClick={(e) => isolateEvents && e.stopPropagation()}
            >
              <div className={styles.iconWrapper}>{item.icon}</div>
              <span className={styles.itemLabel}>{item.label}</span>
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Arrow className={styles.menuArrow} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
