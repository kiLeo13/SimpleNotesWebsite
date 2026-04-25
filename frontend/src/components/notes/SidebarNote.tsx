import type { NoteResponseData } from "@/types/api/notes"
import { ActionMenu, type MenuActionItem } from "../ui/ActionMenu"
import {
  useEffect,
  useRef,
  useState,
  type JSX,
  type MouseEventHandler
} from "react"

import clsx from "clsx"

import { AppTooltip } from "../ui/AppTooltip"
import { DarkWrapper } from "../DarkWrapper"
import { FaPenToSquare } from "react-icons/fa6"
import { MdDownload } from "react-icons/md"
import { Permission } from "@/models/Permission"
import { SlOptions } from "react-icons/sl"
import { UpdateNoteModal } from "../modals/notes/updates/UpdateNoteModal"
import { ConfirmModal } from "../modals/shared/ConfirmModal"
import { FaTrashAlt } from "react-icons/fa"
import { Ripple } from "../ui/effects/Ripple"
import { usePermission } from "@/hooks/usePermission"
import { useTranslation } from "react-i18next"
import { useNoteStore } from "@/stores/useNotesStore"
import { noteService } from "@/services/noteService"
import { toasts } from "@/utils/toastUtils"
import {
  copyTextToClipboard,
  downloadNoteToDevice
} from "@/utils/noteDownloads"

import styles from "./SidebarNote.module.css"
import { IdentificationIcon } from "../icons/IdentificationIcon"

type SidebarNoteProps = {
  note: NoteResponseData
  onClick?: MouseEventHandler<HTMLDivElement>
}

export function SidebarNote({ note, onClick }: SidebarNoteProps): JSX.Element {
  const { t } = useTranslation()
  // This is being used to determine whether the NoteItem is higher
  // than 50px (which indicates multi-line titles).
  // If it is, the border radius must be adjusted to avoid a giant row becoming a circle.
  const [isTall, setIsTall] = useState(false)
  const elementRef = useRef(null)

  const [isPatching, setIsPatching] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const canEdit = usePermission(Permission.EditNotes)
  const canDelete = usePermission(Permission.DeleteNotes)
  const shownNote = useNoteStore((state) => state.shownNote)
  const isOpen = shownNote?.id === note.id
  const handleMenuTriggerClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
  }

  const copyNoteId = async () => {
    try {
      await copyTextToClipboard(note.id)
      toasts.success(t("sidebar.notes.toasts.copyIdSuccess"))
    } catch (error) {
      console.error("Failed to copy note ID:", error)
      toasts.error(t("sidebar.notes.toasts.copyIdError"))
    }
  }

  const downloadNote = async () => {
    const result = await downloadNoteToDevice(note, noteService.fetchNote)
    if (result.success) {
      return
    }

    if (result.reason === "api") {
      toasts.apiError(t("sidebar.notes.toasts.downloadError"), result.error)
      return
    }

    console.error("Failed to download note:", result.error)
    toasts.error(t("sidebar.notes.toasts.downloadError"))
  }

  const noteOpts = getMenuOptions(
    canEdit,
    canDelete,
    t,
    note.id,
    () => void downloadNote(),
    () => void copyNoteId(),
    setIsPatching,
    setIsDeleting
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height
        setIsTall(height > 40)
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const handleDeletion = async () => {
    const resp = await noteService.deleteNote(note.id)

    if (resp) {
      toasts.success(t("modals.delNote.toasts.success"), {
        style: { color: "#b9be66ff" }
      })
    } else {
      toasts.apiError(t("modals.delNote.toasts.error"), resp)
    }
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        styles.noteItem,
        isOpen && styles.open,
        isTall && styles.tall
      )}
      ref={elementRef}
    >
      <span className={styles.noteItemTitle}>{note.name}</span>
      <Ripple duration={600} />

      <ActionMenu items={noteOpts} side="right" align="center">
        <AppTooltip label={t("sidebar.notes.options")}>
          <button
            type="button"
            onClick={handleMenuTriggerClick}
            className={styles.patch}
            aria-label={t("sidebar.notes.options")}
          >
            <SlOptions size={"1.2em"} color="#9a83b4ff" />
          </button>
        </AppTooltip>
      </ActionMenu>

      <DarkWrapper
        open={isPatching}
        onOpenChange={setIsPatching}
        animationPreset="pop"
      >
        <UpdateNoteModal noteId={note.id} setIsPatching={setIsPatching} />
      </DarkWrapper>

      <DarkWrapper
        open={isDeleting}
        onOpenChange={setIsDeleting}
        animationPreset="pop"
      >
        <ConfirmModal
          title={t("modals.delNote.title")}
          description={t("modals.delNote.subtitle")}
          intent="danger"
          strategy="type_to_confirm"
          validationString={note.name}
          confirmLabel={t("modals.delNote.buttons.confirm")}
          onConfirm={handleDeletion}
          onClose={() => setIsDeleting(false)}
        />
      </DarkWrapper>
    </div>
  )
}

function getMenuOptions(
  canEdit: boolean,
  canDelete: boolean,
  t: (s: string, opts?: Record<string, unknown>) => string,
  noteId: string,
  onDownload: () => void,
  onCopyId: () => void,
  setIsPatching: (b: boolean) => void,
  setIsDeleting: (b: boolean) => void
): MenuActionItem[] {
  const menuOptions: MenuActionItem[] = []

  if (canEdit) {
    menuOptions.push({
      label: t("menus.notes.opts.edit"),
      icon: <FaPenToSquare size={"1.3em"} color="#a285d1" />,
      onClick: () => setIsPatching(true)
    })
  }
  if (canDelete) {
    menuOptions.push({
      label: t("menus.notes.opts.delete"),
      icon: <FaTrashAlt size={"1.3em"} color="#a285d1" />,
      onClick: () => setIsDeleting(true)
    })
  }

  menuOptions.push(
    {
      label: t("menus.notes.opts.download"),
      icon: <MdDownload size={"1.3em"} color="#a285d1" />,
      onClick: onDownload
    },
    {
      label: t("menus.notes.opts.copyId", { id: noteId }),
      icon: <IdentificationIcon size={"1.3em"} color="#a285d1" />,
      onClick: onCopyId
    }
  )

  return menuOptions
}
