import type { JSX, MouseEventHandler } from "react"
import type { UserResponseData } from "@/types/api/users"

import { CgController } from "react-icons/cg"
import { MdOutlineFileUpload } from "react-icons/md"
import { SidebarProfile } from "./SidebarProfile"

import styles from "./SidebarFooter.module.css"

type SidebarFooterProps = {
  selfUser: UserResponseData | null
  setShowUploadModal: (show: boolean) => void
}

export function SidebarFooter({ selfUser, setShowUploadModal }: SidebarFooterProps): JSX.Element {
  const handleShowUpload: MouseEventHandler<HTMLButtonElement> = () => {
    setShowUploadModal(true)
  }

  return (
    <div className={styles.footer}>
      <SidebarProfile />

      <div className={styles.buttonsContainer}>
        {selfUser?.isAdmin && (
          <>
            <button onClick={handleShowUpload} className={styles.actionButton}>
              <MdOutlineFileUpload size={"0.8em"} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}