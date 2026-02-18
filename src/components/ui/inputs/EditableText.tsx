import {
  useEffect,
  useRef,
  type ComponentProps,
  type FormEvent,
  type KeyboardEvent,
  type FocusEvent
} from "react"

// Omit "onChange" because standard div onChange is different from what we need here
type EditableTextProps = Omit<
  ComponentProps<"div">,
  "onChange" | "contentEditable"
> & {
  value: string
  editable?: boolean
  onChange: (value: string) => void
  onSave: (value: string) => void
  onCancel?: () => void
}

export function EditableText({
  value,
  editable = false,
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

  // We sync the DOM with the prop only if they are different.
  // This prevents the cursor from jumping to the start while typing.
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value
    }
  }, [value])

  const handleInput = (e: FormEvent<HTMLDivElement>) => {
    const nextText = e.currentTarget.innerText
    onChange(nextText)
  }

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (ignoreNextBlur.current) {
      ignoreNextBlur.current = false
      onBlur?.(e)
      return
    }

    onSave(e.currentTarget.innerText)
    onBlur?.(e)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      ref.current?.blur()
    }

    if (e.key === "Escape") {
      e.preventDefault()
      ignoreNextBlur.current = true

      // Revert the text visually immediately
      if (ref.current) ref.current.innerText = value

      onCancel?.()
      ref.current?.blur()
    }

    onKeyDown?.(e)
  }

  return (
    <div
      ref={ref}
      className={className}
      contentEditable={editable}
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      role={editable ? "textbox" : undefined}
      tabIndex={editable ? 0 : -1}
      {...props}
    />
  )
}
