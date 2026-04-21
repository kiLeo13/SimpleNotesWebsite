import { useState, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ActionMenu, type MenuActionItem } from "../ui/ActionMenu"
import type { EditorMode } from "../modals/notes/creations/editors/CreateEditorModal"

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
import { MdOutlineLogout } from "react-icons/md"
import { MdOutlineHistory } from "react-icons/md"
import { UserManagementPopover } from "../modals/users/management/UserManagementPopover"
import { BiNetworkChart } from "react-icons/bi"
import { AppTooltip } from "../ui/AppTooltip"
import { Ripple } from "../ui/effects/Ripple"
import { Button } from "../ui/buttons/Button"
import { LoaderContainer } from "@/components/LoaderContainer"
import { Permission } from "@/models/Permission"
import { createAsyncComponent } from "@/utils/createAsyncComponent"
import { useTranslation } from "react-i18next"
import { usePermission } from "@/hooks/usePermission"
import { userService } from "@/services/userService"
import { toasts } from "@/utils/toastUtils"

import styles from "./SidebarFooter.module.css"

const CreateEditorModal = createAsyncComponent(
  () => import("../modals/notes/creations/editors/CreateEditorModal"),
  (module) => module.CreateEditorModal
)

const CreateNoteModalForm = createAsyncComponent(
  () => import("../modals/notes/creations/uploads/CreateNoteModalForm"),
  (module) => module.CreateNoteModalForm
)

const AlgorithmCalculator = createAsyncComponent(
  () => import("../modals/global/algorithm/AlgorithmCalculator"),
  (module) => module.AlgorithmCalculator
)

const AuditLogsModal = createAsyncComponent(
  () => import("../modals/global/audit/AuditLogsModal"),
  (module) => module.AuditLogsModal
)

const CompanyLookupModal = createAsyncComponent(
  () => import("../modals/global/lookup/CompanyLookupModal"),
  (module) => module.CompanyLookupModal
)

const modalLoaderFallback = (
  <LoaderContainer scale={0.9} loaderColor="#b79ed8" />
)

export function SidebarFooter(): JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Permissions
  const canCreate = usePermission(Permission.CreateNotes)
  const canManageUsers = usePermission(Permission.ManageUsers)
  const canLookup = usePermission(Permission.PerformLookup)
  const canReadAuditLogs = usePermission(Permission.ReadAuditLogs)

  // States
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null)
  const [showAlgoCalc, setShowAlgoCalc] = useState(false)
  const [showAuditLogs, setShowAuditLogs] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)

  // Handlers
  const handleShowAlgo = () => setShowAlgoCalc(true)
  const closeEditor = () => setEditorMode(null)
  const handleShowAuditLogs = () => setShowAuditLogs(true)
  const handleShowLookup = () => setLookingUp(true)

  const handleSignout = async () => {
    const accessToken = localStorage.getItem("access_token")
    if (!accessToken) {
      toasts.warning(t("warnings.noAccessToken"))
      void navigate({ to: "/login" })
      return
    }

    const resp = await userService.logout({ access_token: accessToken })
    if (!resp.success) {
      toasts.apiError(t("errors.logout"), resp)
    }
    localStorage.removeItem("id_token")
    localStorage.removeItem("access_token")
    void navigate({ to: "/login" })
  }

  const settingsOptions = getSettingsOptions(t, handleSignout)
  const createNoteOptions = getCreateNoteOptions(
    t,
    setEditorMode,
    setShowUploadModal
  )

  return (
    <>
      {/* File Upload Modal */}
      {showUploadModal && (
        <DarkWrapper open={showUploadModal} onOpenChange={setShowUploadModal}>
          <CreateNoteModalForm
            loadingFallback={modalLoaderFallback}
            setShowUploadModal={setShowUploadModal}
          />
        </DarkWrapper>
      )}

      {/* Split-Screen Editor Modal */}
      {editorMode && (
        <DarkWrapper open={!!editorMode} onOpenChange={closeEditor}>
          <CreateEditorModal
            loadingFallback={modalLoaderFallback}
            mode={editorMode}
            onClose={closeEditor}
          />
        </DarkWrapper>
      )}

      {/* Utility Modals */}
      {showAlgoCalc && (
        <DarkWrapper open={showAlgoCalc} onOpenChange={setShowAlgoCalc}>
          <AlgorithmCalculator
            loadingFallback={modalLoaderFallback}
            setShowAlgoCalc={setShowAlgoCalc}
          />
        </DarkWrapper>
      )}

      {showAuditLogs && (
        <DarkWrapper open={showAuditLogs} onOpenChange={setShowAuditLogs}>
          <AuditLogsModal
            loadingFallback={modalLoaderFallback}
            setShowAuditLogs={setShowAuditLogs}
          />
        </DarkWrapper>
      )}

      {lookingUp && (
        <DarkWrapper open={lookingUp} onOpenChange={setLookingUp}>
          <CompanyLookupModal
            loadingFallback={modalLoaderFallback}
            setLookingUp={setLookingUp}
          />
        </DarkWrapper>
      )}

      <div className={styles.footer}>
        {/* Settings */}
        <ActionMenu items={settingsOptions}>
          <AppTooltip label={t("tooltips.labels.settings")}>
            <button className={styles.button}>
              <FaGear size={"0.5em"} />
              <Ripple />
            </button>
          </AppTooltip>
        </ActionMenu>

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

          {canReadAuditLogs && (
            <AppTooltip label={t("tooltips.labels.auditLogs")}>
              <Button
                className={styles.button}
                onClick={handleShowAuditLogs}
                aria-label={t("tooltips.labels.auditLogs")}
              >
                <MdOutlineHistory size={"0.75em"} />
              </Button>
            </AppTooltip>
          )}

          {canCreate && (
            // Create Note Action Menu
            <ActionMenu items={createNoteOptions} side="right">
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

function getSettingsOptions(
  t: (s: string) => string,
  signout: () => void
): MenuActionItem[] {
  return [
    {
      label: t("menus.settings.signout"),
      icon: <MdOutlineLogout size={"1.4em"} color="#a285d1" />,
      onClick: signout
    }
  ]
}

function getCreateNoteOptions(
  t: (s: string) => string,
  setEditorMode: (mode: EditorMode) => void,
  setShowUploadModal: (flag: boolean) => void
): MenuActionItem[] {
  return [
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
}
