import { useState, type JSX } from "react"
import { ActionMenu, type MenuActionItem } from "../ui/ActionMenu"
import {
  CreateEditorModal,
  type EditorMode
} from "../modals/notes/creations/editors/CreateEditorModal"

import { CgController } from "react-icons/cg"
import {
  MdInsertDriveFile,
  MdOutlineFileUpload,
  MdTextFields
} from "react-icons/md"
import { RiFlowChart } from "react-icons/ri"
import { FaUsers } from "react-icons/fa"
import { FaGear } from "react-icons/fa6"
import { DarkWrapper } from "../DarkWrapper"
import { CreateNoteModalForm } from "../modals/notes/creations/uploads/CreateNoteModalForm"
import { UserManagementPopover } from "../modals/users/management/UserManagementPopover"
import { AlgorithmCalculator } from "../modals/global/algorithm/AlgorithmCalculator"
import { CompanyLookupModal } from "../modals/global/lookup/CompanyLookupModal"
import { BiNetworkChart } from "react-icons/bi"
import { AppTooltip } from "../ui/AppTooltip"
import { Ripple } from "../ui/effects/Ripple"
import { Button } from "../ui/buttons/Button"
import { Permission } from "@/models/Permission"
import { useTranslation } from "react-i18next"
import { usePermission } from "@/hooks/usePermission"

import styles from "./SidebarFooter.module.css"

export function SidebarFooter(): JSX.Element {
  const { t } = useTranslation()

  // Permissions
  const canCreate = usePermission(Permission.CreateNotes)
  const canManageUsers = usePermission(Permission.ManageUsers)
  const canLookup = usePermission(Permission.PerformLookup)

  // States
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null)
  const [showAlgoCalc, setShowAlgoCalc] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)

  // Handlers
  const handleShowAlgo = () => setShowAlgoCalc(true)
  const closeEditor = () => setEditorMode(null)
  const handleShowLookup = () => setLookingUp(true)

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
      <DarkWrapper open={showUploadModal} onOpenChange={setShowUploadModal}>
        <CreateNoteModalForm setShowUploadModal={setShowUploadModal} />
      </DarkWrapper>

      {/* Split-Screen Editor Modal */}
      <DarkWrapper open={!!editorMode} onOpenChange={closeEditor}>
        <CreateEditorModal mode={editorMode!} onClose={closeEditor} />
      </DarkWrapper>

      {/* Utility Modals */}
      <DarkWrapper open={showAlgoCalc} onOpenChange={setShowAlgoCalc}>
        <AlgorithmCalculator setShowAlgoCalc={setShowAlgoCalc} />
      </DarkWrapper>

      <DarkWrapper open={lookingUp} onOpenChange={setLookingUp}>
        <CompanyLookupModal setLookingUp={setLookingUp} />
      </DarkWrapper>

      <div className={styles.footer}>
        {/* Settings */}
        <AppTooltip label={t("tooltips.labels.settings")}>
          <button className={styles.button}>
            <FaGear size={"0.5em"} />
            <Ripple />
          </button>
        </AppTooltip>

        <div className={styles.buttonsContainer}>
          {/* Algorithm Calculator */}
          <AppTooltip label={t("tooltips.labels.algoCalc")}>
            <button className={styles.button} onClick={handleShowAlgo}>
              <CgController size={"0.7em"} />
              <Ripple />
            </button>
          </AppTooltip>

          {canLookup && (
            <AppTooltip label={t("tooltips.labels.lookup")}>
              <Button className={styles.button} onClick={handleShowLookup}>
                <BiNetworkChart size={"0.7em"} />
              </Button>
            </AppTooltip>
          )}

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
                  <Ripple />
                </button>
              </AppTooltip>
            </ActionMenu>
          )}

          {/* User Management Popover */}
          {canManageUsers && (
            <UserManagementPopover>
              <AppTooltip label={t("tooltips.labels.usersMng")}>
                <Button className={styles.button}>
                  <FaUsers size={"0.7em"} />
                </Button>
              </AppTooltip>
            </UserManagementPopover>
          )}
        </div>
      </div>
    </>
  )
}
