import type { JSX } from "react"
import type { UserResponseData } from "@/types/api/users"
import { ActionMenu, type MenuActionItem } from "../ui/ActionMenu"

import { CgController } from "react-icons/cg"
import { MdInsertDriveFile, MdOutlineFileUpload, MdTextFields } from "react-icons/md"
import { RiFlowChart } from "react-icons/ri"
import { FaGear } from "react-icons/fa6"
import { DarkWrapper } from "../DarkWrapper"
import { CreateNoteModalForm } from "../modals/notes/creations/CreateNoteModalForm"
import { AlgorithmCalculator } from "../modals/global/algorithm/AlgorithmCalculator"
import { AppTooltip } from "../ui/AppTooltip"
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

  const handleShowAlgo = () => setShowAlgoCalc(true)

  const createNoteOptions: MenuActionItem[] = [
    {
      label: "Markdown / Texto",
      icon: <MdTextFields size={"1.2em"} />,
      onClick: () => {}
    },
    {
      label: "Diagrama",
      icon: <RiFlowChart size={"1.2em"} />,
      onClick: () => {}
    },
    {
      label: "Arquivo",
      icon: <MdInsertDriveFile size={"1.2em"} />,
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
            <ActionMenu
              header={t("tooltips.menus.header.createNote")}
              items={createNoteOptions}
              side="right"
            >
              <AppTooltip label={t("tooltips.labels.createNote")}>
                <button className={styles.button}>
                  <MdOutlineFileUpload size={"0.8em"} />
                </button>
              </AppTooltip>
            </ActionMenu>
          )}
        </div>
      </div>
    </>
  )
}
