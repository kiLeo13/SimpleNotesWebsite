import { useState, type JSX } from "react"
import { ActionMenu, type MenuActionItem } from "../ui/ActionMenu"
import {
  CreateEditorModal,
  type EditorMode
} from "../modals/notes/creations/editors/CreateEditorModal"

import { CgController } from "react-icons/cg"
import { MdInsertDriveFile, MdOutlineFileUpload, MdTextFields } from "react-icons/md"
import { RiFlowChart } from "react-icons/ri"
import { FaUsers } from "react-icons/fa"
import { FaGear } from "react-icons/fa6"
import { DarkWrapper } from "../DarkWrapper"
import { UserManagementModal } from "../modals/users/management/UserManagementModal"
import { CreateNoteModalForm } from "../modals/notes/creations/uploads/CreateNoteModalForm"
import { AlgorithmCalculator } from "../modals/global/algorithm/AlgorithmCalculator"
import { AppTooltip } from "../ui/AppTooltip"
import { Permission } from "@/models/Permission"
import { useTranslation } from "react-i18next"
import { usePermission } from "@/hooks/usePermission"

import styles from "./SidebarFooter.module.css"

export function SidebarFooter(): JSX.Element {
  const { t } = useTranslation()

  // Permissions
  const canCreate = usePermission(Permission.CreateNotes)
  const canManageUsers = usePermission(Permission.ManageUsers)

  // States
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null)
  const [showAlgoCalc, setShowAlgoCalc] = useState(false)
  const [showUsersMng, setShowUsersMng] = useState(false)

  // Handlers
  const handleShowAlgo = () => setShowAlgoCalc(true)
  const closeEditor = () => setEditorMode(null)
  const handleShowUsers = () => setShowUsersMng(true)

  const createNoteOptions: MenuActionItem[] = [
    {
      label: t("menus.notes.optText"),
      icon: <MdTextFields size={"1.5em"} color="#a285d1" />,
      onClick: () => setEditorMode("MARKDOWN")
    },
    {
      label: t("menus.notes.optFlowchart"),
      icon: <RiFlowChart size={"1.4em"} color="#a285d1" />,
      onClick: () => setEditorMode("FLOWCHART")
    },
    {
      label: t("menus.notes.optFile"),
      icon: <MdInsertDriveFile size={"1.4em"} color="#a285d1" />,
      onClick: () => setShowUploadModal(true)
    }
  ]

  return (
    <>
      {/* File Upload Modal */}
      <DarkWrapper open={showUploadModal}>
        <CreateNoteModalForm setShowUploadModal={setShowUploadModal} />
      </DarkWrapper>

      {/* Split-Screen Editor Modal */}
      <DarkWrapper open={!!editorMode} isolateEvents={false}>
        <CreateEditorModal mode={editorMode!} onClose={closeEditor} />
      </DarkWrapper>

      {/* Utility Modals */}
      <DarkWrapper open={showAlgoCalc}>
        <AlgorithmCalculator setShowAlgoCalc={setShowAlgoCalc} />
      </DarkWrapper>

      {/* User Management */}
      <DarkWrapper open={showUsersMng}>
        <UserManagementModal setShowUsersMng={setShowUsersMng} />
      </DarkWrapper>

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

          {canCreate && (
            // Create Note Action Menu
            <ActionMenu
              header={t("tooltips.labels.createNote")}
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

          {canManageUsers && (
            // User Management
            <AppTooltip label={t("tooltips.labels.usersMng")}>
              <button className={styles.button} onClick={handleShowUsers}>
                <FaUsers size={"0.7em"} />
              </button>
            </AppTooltip>
          )}
        </div>
      </div>
    </>
  )
}
