import { useState, type JSX } from "react"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import clsx from "clsx"

import { FaChevronDown } from "react-icons/fa"
import { Button } from "./buttons/Button"
import { BsCheck } from "react-icons/bs"
import { useTranslation } from "react-i18next"

import styles from "./MultiSelectMenu.module.css"

export type MenuOption = {
  id: string | number
  label: string
  icon?: React.ReactNode
  info?: string
  disabled?: boolean
}

type MultiSelectMenuProps = {
  label?: string
  options: MenuOption[]
  values: (string | number)[]
  onChange?: (newValues: (string | number)[]) => void
  onSave?: () => Promise<void> | void
  isLoading?: boolean
  showFooter?: boolean
}

export function MultiSelectMenu({
  label,
  options,
  values,
  onChange,
  onSave,
  isLoading,
  showFooter = true
}: MultiSelectMenuProps): JSX.Element {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const handleToggle = (id: string | number) => {
    const newValues = values.includes(id)
      ? values.filter((v) => v !== id)
      : [...values, id]
    onChange?.(newValues)
  }

  const handleSave = async () => {
    await onSave?.()
    setOpen(false)
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button className={styles.triggerButton}>
          {label}
          <FaChevronDown
            className={clsx(styles.chevron, open && styles.open)}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={styles.content}
          sideOffset={5}
          collisionPadding={5}
          avoidCollisions
          side="left"
          align="start"
        >
          <div className={styles.scrollContainer}>
            {options.map((opt) => {
              const isChecked = values.includes(opt.id)

              return (
                <DropdownMenu.CheckboxItem
                  key={opt.id}
                  className={styles.item}
                  checked={isChecked}
                  disabled={opt.disabled}
                  // Prevent closing on selection
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={() => handleToggle(opt.id)}
                >
                  {/* Label */}
                  <div className={styles.labelContainer}>
                    {opt.icon && (
                      <span className={styles.optIcon}>{opt.icon}</span>
                    )}
                    <span className={styles.itemLabel}>{opt.label}</span>
                  </div>

                  {/* Checkbox */}
                  <div className={styles.checkbox}>
                    <DropdownMenu.ItemIndicator className={styles.indicator}>
                      <BsCheck size={16} strokeWidth={1} />
                    </DropdownMenu.ItemIndicator>
                  </div>
                </DropdownMenu.CheckboxItem>
              )
            })}
          </div>

          {showFooter && (
            <>
              <DropdownMenu.Separator className={styles.separator} />

              <div className={styles.footer}>
                <Button
                  className={styles.saveButton}
                  isLoading={isLoading}
                  disabled={isLoading}
                  onClick={handleSave}
                  loaderProps={{ scale: 0.8 }}
                >
                  {t("menus.users.perms.saveButton")}
                </Button>
              </div>
            </>
          )}

          <DropdownMenu.Arrow className={styles.arrow} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
