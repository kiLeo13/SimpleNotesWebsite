import type { JSX, MouseEventHandler } from "react"
import type { UserResponseData } from "@/types/api/users"

import { CgController } from "react-icons/cg"
import { MdOutlineFileUpload } from "react-icons/md"
import { SidebarProfile } from "./SidebarProfile"
import { DarkWrapper } from "../DarkWrapper"
import { CreateNoteModalForm } from "../modals/notes/creations/CreateNoteModalForm"
import { AlgorithmCalculator } from "../modals/global/AlgorithmCalculator"

import { useState } from "react"

import styles from "./SidebarFooter.module.css"

type SidebarFooterProps = {
  selfUser: UserResponseData | null
}

export function SidebarFooter({ selfUser }: SidebarFooterProps): JSX.Element {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAlgoCalc, setShowAlgoCalc] = useState(false)

  const handleShowUpload: MouseEventHandler<HTMLButtonElement> = () => {
    setShowUploadModal(true)
  }

  const handleShowAlgo = () => {
    setShowAlgoCalc(true)
  }

  return (
    <>
      {showUploadModal && (
        <DarkWrapper>
          <CreateNoteModalForm setShowUploadModal={setShowUploadModal} />
        </DarkWrapper>
      )}

      {showAlgoCalc && (
        <DarkWrapper>
          <AlgorithmCalculator setShowAlgoCalc={setShowAlgoCalc} />
        </DarkWrapper>
      )}

      <div className={styles.footer}>
        <SidebarProfile />

        <div className={styles.buttonsContainer}>
          <button onClick={handleShowAlgo} className={styles.actionButton}>
            <CgController size={"0.7em"} />
          </button>
          {selfUser?.isAdmin && (
            <>
              <button onClick={handleShowUpload} className={styles.actionButton}>
                <MdOutlineFileUpload size={"0.8em"} />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}