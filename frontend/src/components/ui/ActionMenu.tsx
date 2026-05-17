import React, { type JSX } from "react"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import clsx from "clsx"

import { Ripple } from "./effects/Ripple"
import { MdChevronRight, MdCheck } from "react-icons/md"

import styles from "./ActionMenu.module.css"

export interface MenuActionItem {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  subItems?: MenuActionItem[]
  checked?: boolean
}

type ActionMenuProps = {
  children: React.ReactNode
  header?: string
  items: MenuActionItem[]
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  isolateEvents?: boolean
  style?: React.CSSProperties
}

export function ActionMenu({
  children,
  header,
  items,
  side = "bottom",
  align = "start",
  isolateEvents = true,
  style
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
          style={style}
        >
          {header && (
            <>
              <DropdownMenu.Label className={styles.menuLabel}>
                {header}
              </DropdownMenu.Label>
              <DropdownMenu.Separator className={styles.menuSeparator} />
            </>
          )}

          {items.map((item, index) =>
            item.subItems ? (
              <SubMenu key={`${item.label}-${index}`} item={item} isolateEvents={isolateEvents} />
            ) : (
              <DropdownMenu.Item
                key={`${item.label}-${index}`}
                className={clsx(styles.menuItem, item.className)}
                onSelect={item.onClick}
                onClick={isolateEvents ? (e) => e.stopPropagation() : undefined}
                style={item.style}
              >
                <div className={styles.iconWrapper}>{item.icon}</div>
                <span className={styles.itemLabel}>{item.label}</span>
                <Ripple />
              </DropdownMenu.Item>
            )
          )}
          <DropdownMenu.Arrow className={styles.menuArrow} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function SubMenu({
  item,
  isolateEvents
}: {
  item: MenuActionItem
  isolateEvents: boolean
}): JSX.Element {
  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className={clsx(styles.menuItem, styles.subTrigger, item.className)} style={item.style}>
        <div className={styles.iconWrapper}>{item.icon}</div>
        <span className={styles.itemLabel}>{item.label}</span>
        <MdChevronRight className={styles.subChevron} />
      </DropdownMenu.SubTrigger>

      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          className={styles.menuContent}
          sideOffset={6}
          alignOffset={-4}
          collisionPadding={10}
        >
          {item.subItems!.map((sub, i) => (
            <DropdownMenu.Item
              key={`${sub.label}-${i}`}
              className={clsx(styles.menuItem, styles.subItem, sub.className)}
              onSelect={sub.onClick}
              onClick={isolateEvents ? (e) => e.stopPropagation() : undefined}
              style={sub.style}
            >
              <div className={styles.checkSlot}>
                {sub.checked && <MdCheck size="1.1em" />}
              </div>
              <span className={styles.itemLabel}>{sub.label}</span>
              <Ripple />
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  )
}
