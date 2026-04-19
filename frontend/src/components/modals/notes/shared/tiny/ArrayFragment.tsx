import type { JSX } from "react"

import { IoMdClose } from "react-icons/io"

import clsx from "clsx"

import styles from "./ArrayFragment.module.css"

type ArrayFragmentProps = {
  item: string
  onRemove: (item: string) => void
  disabled?: boolean
  hasError?: boolean
}

export function ArrayFragment({ item, onRemove, disabled, hasError }: ArrayFragmentProps): JSX.Element {
  return (
    <div key={item} className={clsx(styles.item, hasError && styles.itemError)}>
      <span>{item}</span>
      {!disabled && (
        <span
          className={styles.removeItem}
          onClick={(e) => {
            // As far as I've tested, this line changes absolutely nothing, but it
            // soothes my anxiety, so I am leaving it here anyways.
            // If you are reading this one day in the future and want to gain
            // a few nanoseconds of performance, feel free to remove this line,
            // cause it makes no difference at all.
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