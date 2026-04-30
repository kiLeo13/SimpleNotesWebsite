import React, { useEffect, useState, useMemo, forwardRef, useRef } from "react"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import clsx from "clsx"

import { FiChevronDown, FiCheck, FiSearch } from "react-icons/fi"
import { useTranslation } from "react-i18next"

import styles from "./CustomSelect.module.css"

export type SelectOption = {
  value: string
  label: string
  icon?: React.ReactNode
}

export type CustomSelectProps = {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  hasSearch?: boolean
  className?: string
  disabled?: boolean
  name?: string
  id?: string
  invalid?: boolean
  onBlur?: () => void
  customTrigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  contentClassName?: string
  emptyMessage?: string
}

export const CustomSelect = forwardRef<HTMLButtonElement, CustomSelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder,
      hasSearch = false,
      className,
      disabled = false,
      invalid = false,
      customTrigger,
      open,
      onOpenChange,
      align = "start",
      side,
      sideOffset = 5,
      contentClassName,
      emptyMessage,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation()

    const [searchTerm, setSearchTerm] = useState("")
    const [internalOpen, setInternalOpen] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const isOpen = open !== undefined ? open : internalOpen

    const handleOpenChange = (newOpen: boolean) => {
      setInternalOpen(newOpen)
      onOpenChange?.(newOpen)
    }

    useEffect(() => {
      if (!isOpen || !hasSearch) return

      const timeoutId = window.setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)

      return () => window.clearTimeout(timeoutId)
    }, [hasSearch, isOpen])

    const filteredOptions = useMemo(() => {
      if (!hasSearch || !searchTerm) return options
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }, [options, searchTerm, hasSearch])

    const selectedOption = useMemo(() => {
      return options.find((opt) => opt.value === value)
    }, [options, value])

    const shouldKeepSearchFocus = () =>
      hasSearch && document.activeElement === searchInputRef.current

    const handleSelect = (selectedValue: string) => {
      onChange(selectedValue)
      setSearchTerm("")
      handleOpenChange(false)
    }

    return (
      <DropdownMenu.Root open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenu.Trigger asChild disabled={disabled}>
          {customTrigger ? (
            customTrigger
          ) : (
            <button
              ref={ref}
              className={clsx(
                styles.trigger,
                invalid && styles.invalid,
                className
              )}
              type="button"
              {...props}
            >
              <div className={styles.valueWrapper}>
                {selectedOption ? (
                  <>
                    {selectedOption.icon && (
                      <span className={styles.itemIcon}>
                        {selectedOption.icon}
                      </span>
                    )}
                    <span>{selectedOption.label}</span>
                  </>
                ) : (
                  <span className={styles.placeholder}>{placeholder || ""}</span>
                )}
              </div>
              <FiChevronDown className={styles.chevron} />
            </button>
          )}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={clsx(styles.content, contentClassName)}
            side={side}
            sideOffset={sideOffset}
            align={align}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {hasSearch && (
              <div className={styles.searchWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                  ref={searchInputRef}
                  type="text"
                  className={styles.searchInput}
                  placeholder={t("menus.select.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div className={styles.viewport}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <DropdownMenu.Item
                    key={option.value}
                    className={styles.item}
                    onPointerMove={(event) => {
                      if (shouldKeepSearchFocus()) {
                        event.preventDefault()
                      }
                    }}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div className={styles.itemLeft}>
                      {option.icon && (
                        <span className={styles.itemIcon}>{option.icon}</span>
                      )}
                      <span>{option.label}</span>
                    </div>
                    {value === option.value && (
                      <FiCheck className={styles.checkIcon} />
                    )}
                  </DropdownMenu.Item>
                ))
              ) : (
                <div className={styles.noResults}>
                  {emptyMessage || t("menus.select.noResults")}
                </div>
              )}
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    )
  }
)

CustomSelect.displayName = "CustomSelect"
