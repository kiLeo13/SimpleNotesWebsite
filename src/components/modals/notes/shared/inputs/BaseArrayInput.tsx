import { useRef, useState, type KeyboardEvent, type JSX, type ChangeEvent } from "react"

import clsx from "clsx"

import { ArrayFragment } from "../tiny/ArrayFragment"

import styles from "./ModalInputs.module.css"

type BaseArrayInputProps = {
  items: string[]
  onAdd: (item: string) => void
  onRemove: (item: string) => void
  errorMessage?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  minLength?: number
  maxLength?: number
}

export function BaseArrayInput({
  items,
  onAdd,
  onRemove,
  errorMessage,
  placeholder,
  disabled,
  className,
  minLength,
  maxLength
}: BaseArrayInputProps): JSX.Element {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleContainerClick = () => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }

  // Empty spaces are strictly disallowed in array elements
  const handleContent = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.replaceAll(' ', ''))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()

      const val = inputValue.trim()
      if (val) {
        onAdd(val)
        setInputValue("")
      }
    }
  }

  return (
    <>
      <div
        className={clsx(styles.input, styles.arrayContainer, errorMessage && styles.invalid, className)}
        onClick={handleContainerClick}
      >
        {items.map((item) => (
          <ArrayFragment key={item} item={item} onRemove={onRemove} disabled={disabled} />
        ))}

        <input
          ref={inputRef}
          value={inputValue}
          onChange={handleContent}
          onKeyDown={handleKeyDown}
          className={styles.arrayInput}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          maxLength={maxLength}
          minLength={minLength}
        />
      </div>

      {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
    </>
  )
}