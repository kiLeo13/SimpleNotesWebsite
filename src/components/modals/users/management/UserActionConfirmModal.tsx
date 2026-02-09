import type { JSX } from "react"
import type { UserResponseData } from "@/types/api/users"

import { IoMdClose } from "react-icons/io"
import { CgDanger } from "react-icons/cg"

import styles from "./UserActionConfirmModal.module.css"

type UserActionConfirmModalProps = {
  label: string
  user: UserResponseData
  onClose: () => void
}

export function UserActionConfirmModal({ label, onClose }: UserActionConfirmModalProps): JSX.Element {

  return (
    <div className={styles.container}>
      <div className={styles.close} onClick={onClose}>
        <IoMdClose color="rgba(94, 76, 121, 1)" size={"24px"} />
        {label}
      </div>

      <div className={styles.header}>
        <CgDanger />
      </div>
    </div>
  )
}
