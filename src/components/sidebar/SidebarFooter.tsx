import type { JSX } from "react"
import type { UserResponseData } from "@/types/api/users"
import { ActionMenu, type MenuActionItem } from "../ui/ActionMenu"
import { CreateEditorModal, type EditorMode } from "../modals/notes/creations/editors/CreateEditorModal"

import { CgController } from "react-icons/cg"
import { MdInsertDriveFile, MdOutlineFileUpload, MdTextFields } from "react-icons/md"
import { RiFlowChart } from "react-icons/ri"
import { FaGear } from "react-icons/fa6"
import { DarkWrapper } from "../DarkWrapper"
import { CreateNoteModalForm } from "../modals/notes/creations/uploads/CreateNoteModalForm"
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

  // States
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null)
  const [showAlgoCalc, setShowAlgoCalc] = useState(false)

  // Handlers
  const handleShowAlgo = () => setShowAlgoCalc(true)
  const closeEditor = () => setEditorMode(null)

  const createNoteOptions: MenuActionItem[] = [
    {
      label: "Markdown / Texto",
      icon: <MdTextFields size={"1.5em"} color="#a285d1" />,
      onClick: () => setEditorMode("MARKDOWN")
    },
    {
      label: "Diagrama",
      icon: <RiFlowChart size={"1.4em"} color="#a285d1" />,
      onClick: () => setEditorMode("FLOWCHART")
    },
    {
      label: "Arquivo",
      icon: <MdInsertDriveFile size={"1.4em"} color="#a285d1" />,
      onClick: () => setShowUploadModal(true)
    }
  ]

  return (
    <>
      {/* File Upload Modal */}
      {showUploadModal && (
        <DarkWrapper>
          <CreateNoteModalForm setShowUploadModal={setShowUploadModal} />
        </DarkWrapper>
      )}

      {/* Split-Screen Editor Modal */}
      {editorMode && (
        <DarkWrapper>
          <CreateEditorModal mode={editorMode} onClose={closeEditor} />
        </DarkWrapper>
      )}

      {/* Utility Modals */}
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
