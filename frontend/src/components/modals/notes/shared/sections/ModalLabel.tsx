import type { ComponentProps, JSX, ReactNode } from "react"

import RequiredHint from "@/components/hints/RequiredHint"
import OptionalHint from "@/components/hints/OptionalHint"

import { AppTooltip } from "@/components/ui/AppTooltip"
import { IoMdInformationCircleOutline } from "react-icons/io"

import styles from "./ModalLabel.module.css"

type ModalLabelProps = ComponentProps<"label"> & {
  title: string
  icon?: ReactNode
  subtitle?: string
  required?: boolean
  hint?: string
}

export function ModalLabel({
  title,
  icon,
  subtitle,
  required,
  hint,
  ...props
}: ModalLabelProps): JSX.Element {
  return (
    <label className={styles.inputLabel} {...props}>
      <span className={styles.labelMain}>
        {icon && icon}

        {title}

        {required === true && <RequiredHint />}
        {required === false && <OptionalHint />}

        {hint && (
          <AppTooltip label={hint}>
            <span className={styles.helpHint}>
              <IoMdInformationCircleOutline />
            </span>
          </AppTooltip>
        )}
      </span>

      {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
    </label>
  )
}
