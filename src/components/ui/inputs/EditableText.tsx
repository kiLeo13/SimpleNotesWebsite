import {
  useEffect,
  useRef,
  type ComponentProps,
  type FormEvent,
  type KeyboardEvent,
  type FocusEvent,
  type ClipboardEvent
} from "react"
import clsx from "clsx"

type EditableTextProps = Omit<
  ComponentProps<"div">,
  "onChange" | "contentEditable" | "onPaste"
> & {
  value: string
  editable?: boolean
  minLength?: number
  maxLength?: number
  onChange: (value: string) => void
  onSave: (value: string) => void
  onCancel?: () => void
}

export function EditableText({
  value,
  editable = false,
  minLength = 0,
  maxLength,
  onChange,
  onSave,
  onCancel,
  onBlur,
  onKeyDown,
  className,
  ...props
}: EditableTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const ignoreNextBlur = useRef(false)

  const isValid = (() => {
    const len = value.trim().length
    if (!!maxLength && len > maxLength) return false
    if (!!minLength && len < minLength) return false
    return true
  })()

  // Sync the DOM with the prop only if they are different.
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value
    }
  }, [value])

  const handleInput = (e: FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerText)
  }

  // Intercept paste to force plain text only
  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    let text = e.clipboardData.getData("text/plain")

    if (maxLength) {
      const currentText = ref.current?.innerText || ""
      const selectionLength = window.getSelection()?.toString().length || 0
      const spaceLeft = maxLength - currentText.length + selectionLength

      if (spaceLeft <= 0) return
      text = text.slice(0, spaceLeft)
    }

    document.execCommand("insertText", false, text)
  }

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (ignoreNextBlur.current) {
      ignoreNextBlur.current = false
      onBlur?.(e)
      return
    }

    if (isValid) {
      onSave(e.currentTarget.innerText)
    } else {
      // If invalid, we revert the visual state via onCancel
      onCancel?.()
    }
    onBlur?.(e)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (isValid) {
        ref.current?.blur()
      } else {
        ignoreNextBlur.current = true
        onCancel?.()
        ref.current?.blur()
      }
    }

    if (e.key === "Escape") {
      e.preventDefault()
      ignoreNextBlur.current = true
      if (ref.current) ref.current.innerText = value
      onCancel?.()
      ref.current?.blur()
    }

    if (maxLength) {
      const isControlKey =
        e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey
      const hasSelection = window.getSelection()?.toString().length !== 0
      const currentLength = ref.current?.innerText.length || 0

      if (!isControlKey && !hasSelection && currentLength >= maxLength) {
        e.preventDefault()
      }
    }

    onKeyDown?.(e)
  }

  return (
    <div
      ref={ref}
      className={clsx(className, !isValid && "invalid")}
      contentEditable={editable}
      suppressContentEditableWarning
      onInput={handleInput}
      onPaste={handlePaste}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      role={editable ? "textbox" : undefined}
      tabIndex={editable ? 0 : -1}
      {...props}
    />
  )
}
