import type { JSX } from "react"
import type { UserResponseData } from "@/types/api/users"

import { CgController } from "react-icons/cg"
import { MdOutlineFileUpload } from "react-icons/md"
import { FaGear } from "react-icons/fa6"
import { DarkWrapper } from "../DarkWrapper"
import { CreateNoteModalForm } from "../modals/notes/creations/CreateNoteModalForm"
import { AlgorithmCalculator } from "../modals/global/algorithm/AlgorithmCalculator"
import { FooterButton } from "./FooterButton"
import { useTranslation } from "react-i18next"
import { useState } from "react"

import styles from "./SidebarFooter.module.css"

type SidebarFooterProps = {
  selfUser: UserResponseData | null
}

export function SidebarFooter({ selfUser }: SidebarFooterProps): JSX.Element {
  const { t } = useTranslation()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAlgoCalc, setShowAlgoCalc] = useState(false)

  const handleShowUpload = () => {
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
        <FooterButton onClick={() => {}} label={t("tooltips.labels.settings")}>
          <FaGear size={"0.5em"} />
        </FooterButton>

        <div className={styles.buttonsContainer}>
          <FooterButton onClick={handleShowAlgo} label={t("tooltips.labels.algoCalc")}>
            <CgController size={"0.7em"} />
          </FooterButton>
          {selfUser?.isAdmin && (
            <FooterButton onClick={handleShowUpload} label={t("tooltips.labels.createNote")}>
              <MdOutlineFileUpload size={"0.8em"} />
            </FooterButton>
          )}
        </div>
      </div>
    </>
  )
}
