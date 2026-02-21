import {
  useRef,
  useState,
  type KeyboardEvent,
  type JSX,
  type ChangeEvent,
  type CSSProperties
} from "react"

import clsx from "clsx"

import { ArrayFragment } from "../tiny/ArrayFragment"

import styles from "./ModalInputs.module.css"

type BaseArrayInputProps = {
  items: string[]
  onAdd: (item: string) => void
  onRemove: (item: string) => void
  invalidItems?: string[]
  errorMessage?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  minLength?: number
  maxLength?: number
  style?: CSSProperties
}

export function BaseArrayInput({
  items,
  onAdd,
  onRemove,
  invalidItems,
  errorMessage,
  placeholder,
  disabled,
  className,
  minLength,
  maxLength,
  style
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
    setInputValue(e.target.value.replaceAll(" ", ""))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
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
    <div className={clsx(styles.wrapper, className)}>
      <div
        className={clsx(
          styles.input,
          styles.arrayContainer,
          errorMessage && styles.invalid
        )}
        onClick={handleContainerClick}
        style={style}
      >
        {items.map((item) => (
          <ArrayFragment
            key={item}
            item={item}
            onRemove={onRemove}
            disabled={disabled}
            hasError={invalidItems?.includes(item)}
          />
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

      {errorMessage && (
        <span className={styles.errorMessage}>{errorMessage}</span>
      )}
    </div>
  )
}
