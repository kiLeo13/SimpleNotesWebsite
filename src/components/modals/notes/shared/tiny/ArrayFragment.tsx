import type { JSX } from "react"

import { IoMdClose } from "react-icons/io"

import styles from "./ArrayFragment.module.css"

type ArrayFragmentProps = {
  item: string
  onRemove: (item: string) => void
  disabled?: boolean
}

export function ArrayFragment({ item, onRemove, disabled }: ArrayFragmentProps): JSX.Element {
  return (
    <div key={item} className={styles.item}>
      <span>{item}</span>
      {!disabled && (
        <span
          className={styles.removeItem}
          onClick={(e) => {
            e.stopPropagation()
            onRemove(item)
          }}
        >
          <IoMdClose />
        </span>
      )}
    </div>
  )
}