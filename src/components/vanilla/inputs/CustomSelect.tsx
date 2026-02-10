import React, { useState, useMemo, forwardRef } from "react"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import clsx from "clsx"

import { FiChevronDown, FiCheck, FiSearch } from "react-icons/fi"

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
  onBlur?: () => void
}

export const CustomSelect = forwardRef<HTMLButtonElement, CustomSelectProps>(({
  options,
  value,
  onChange,
  placeholder,
  hasSearch = false,
  className,
  disabled = false,
  ...props
}, ref) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const filteredOptions = useMemo(() => {
    if (!hasSearch || !searchTerm) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm, hasSearch])
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value)
  }, [options, value])
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setSearchTerm("")
    setIsOpen(false)
  }
  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          ref={ref}
          className={clsx(styles.trigger, className)}
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
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={styles.content}
          sideOffset={5}
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {hasSearch && (
            <div className={styles.searchWrapper}>
              <FiSearch className={styles.searchIcon} />
              <input
                autoFocus
                type="text"
                className={styles.searchInput}
                placeholder="Search..."
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
              <div className={styles.noResults}>No results found.</div>
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
})

CustomSelect.displayName = "CustomSelect"
