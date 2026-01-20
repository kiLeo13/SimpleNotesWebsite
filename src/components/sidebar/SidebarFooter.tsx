import type { JSX } from "react"
import type { UserResponseData } from "@/types/api/users"
import { ActionMenu, type MenuActionItem } from "../ui/ActionMenu"

import { CgController } from "react-icons/cg"
import { MdInsertDriveFile, MdOutlineFileUpload, MdSchema, MdTextFields } from "react-icons/md"
import { FaGear } from "react-icons/fa6"
import { DarkWrapper } from "../DarkWrapper"
import { CreateNoteModalForm } from "../modals/notes/creations/CreateNoteModalForm"
import { AlgorithmCalculator } from "../modals/global/algorithm/AlgorithmCalculator"
import { useTranslation } from "react-i18next"
import { useState } from "react"

import styles from "./SidebarFooter.module.css"
import { AppTooltip } from "../ui/AppTooltip"

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

  const createNoteOptions: MenuActionItem[] = [
    {
      label: "Markdown / Texto",
      icon: <MdTextFields />,
      onClick: () => {}
    },
    {
      label: "Diagrama",
      icon: <MdSchema />,
      onClick: () => {}
    },
    {
      label: "Arquivo",
      icon: <MdInsertDriveFile />,
      onClick: () => {}
    }
  ]

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

        {/* Settings */}
        <AppTooltip label={t("tooltips.labels.settings")}>
          <button className={styles.button}>
            <FaGear size={"0.5em"} />
          </button>
        </AppTooltip>

        <div className={styles.buttonsContainer}>

          {/* Algorithm Calculator */}
          <AppTooltip label={t("tooltips.labels.algoCalc")}>
            <button className={styles.button} onClick={handleShowAlgo}>
              <CgController size={"0.7em"} />
            </button>
          </AppTooltip>
          {selfUser?.isAdmin && (

            // Create Note Action Menu
            <AppTooltip label={t("tooltips.labels.createNote")}>
              <ActionMenu header="New Entry" items={createNoteOptions} side="right">
                <button className={styles.button} onClick={handleShowUpload}>
                  <MdOutlineFileUpload size={"0.8em"} />
                </button>
              </ActionMenu>
            </AppTooltip>
          )}
        </div>
      </div>
    </>
  )
}
