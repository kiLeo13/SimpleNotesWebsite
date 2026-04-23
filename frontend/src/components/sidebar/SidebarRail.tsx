import { useState, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ActionMenu, type MenuActionItem } from "../ui/ActionMenu"
import type { EditorMode } from "../modals/notes/creations/editors/CreateEditorModal"

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
import { CgController } from "react-icons/cg"
import { AppTooltip } from "../ui/AppTooltip"
import { BsBuildingFill } from "react-icons/bs"
import { Ripple } from "../ui/effects/Ripple"
import { LoaderContainer } from "@/components/LoaderContainer"
import { Permission } from "@/models/Permission"
import { clearSocketSessionId } from "@/services/socketSession"
import { createAsyncComponent } from "@/utils/createAsyncComponent"
import { useTranslation } from "react-i18next"
import { usePermission } from "@/hooks/usePermission"
import { userService } from "@/services/userService"
import { toasts } from "@/utils/toastUtils"

import styles from "./SidebarRail.module.css"

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

export function SidebarRail(): JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const canCreate = usePermission(Permission.CreateNotes)
  const canManageUsers = usePermission(Permission.ManageUsers)
  const canLookup = usePermission(Permission.PerformLookup)
  const canReadAuditLogs = usePermission(Permission.ReadAuditLogs)

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null)
  const [showAlgoCalc, setShowAlgoCalc] = useState(false)
  const [showAuditLogs, setShowAuditLogs] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)

  const closeEditor = () => setEditorMode(null)

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

    clearSocketSessionId()
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
      {showUploadModal && (
        <DarkWrapper open={showUploadModal} onOpenChange={setShowUploadModal}>
          <CreateNoteModalForm
            loadingFallback={modalLoaderFallback}
            setShowUploadModal={setShowUploadModal}
          />
        </DarkWrapper>
      )}

      {editorMode && (
        <DarkWrapper open={!!editorMode} onOpenChange={closeEditor}>
          <CreateEditorModal
            loadingFallback={modalLoaderFallback}
            mode={editorMode}
            onClose={closeEditor}
          />
        </DarkWrapper>
      )}

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

      <aside className={styles.rail}>
        <div className={styles.topActions}>
          {canCreate && (
            <ActionMenu items={createNoteOptions} side="right" align="center">
              <AppTooltip label={t("tooltips.labels.createNote")} side="right">
                <button
                  type="button"
                  className={styles.button}
                  aria-label={t("tooltips.labels.createNote")}
                >
                  <MdOutlineFileUpload size={"0.9em"} />
                  <Ripple />
                </button>
              </AppTooltip>
            </ActionMenu>
          )}

          {canManageUsers && (
            <UserManagementPopover>
              <AppTooltip label={t("tooltips.labels.usersMng")} side="right">
                <button
                  type="button"
                  className={styles.button}
                  aria-label={t("tooltips.labels.usersMng")}
                >
                  <FaUsers size={"0.8em"} />
                  <Ripple />
                </button>
              </AppTooltip>
            </UserManagementPopover>
          )}

          <AppTooltip label={t("tooltips.labels.algoCalc")} side="right">
            <button
              type="button"
              className={styles.button}
              aria-label={t("tooltips.labels.algoCalc")}
              onClick={() => setShowAlgoCalc(true)}
            >
              <CgController size={"0.85em"} />
              <Ripple />
            </button>
          </AppTooltip>

          {canLookup && (
            <AppTooltip label={t("tooltips.labels.companyLookup")} side="right">
              <button
                type="button"
                className={styles.button}
                aria-label={t("tooltips.labels.companyLookup")}
                onClick={() => setLookingUp(true)}
              >
                <BsBuildingFill size={"0.8em"} />
                <Ripple />
              </button>
            </AppTooltip>
          )}

          {canReadAuditLogs && (
            <AppTooltip label={t("tooltips.labels.auditLogs")} side="right">
              <button
                type="button"
                className={styles.button}
                aria-label={t("tooltips.labels.auditLogs")}
                onClick={() => setShowAuditLogs(true)}
              >
                <MdOutlineHistory size={"0.9em"} />
                <Ripple />
              </button>
            </AppTooltip>
          )}
        </div>

        <div className={styles.bottomActions}>
          <ActionMenu items={settingsOptions} side="right" align="center">
            <AppTooltip label={t("tooltips.labels.settings")} side="right">
              <button
                type="button"
                className={styles.button}
                aria-label={t("tooltips.labels.settings")}
              >
                <FaGear size={"0.8em"} />
                <Ripple />
              </button>
            </AppTooltip>
          </ActionMenu>
        </div>
      </aside>
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
