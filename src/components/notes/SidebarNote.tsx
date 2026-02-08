import type { NoteResponseData } from "@/types/api/notes"
import { useEffect, useRef, useState, type JSX, type MouseEventHandler } from "react"

import clsx from "clsx"

import { AppTooltip } from "../ui/AppTooltip"
import { DarkWrapper } from "../DarkWrapper"
import { FaPenToSquare } from "react-icons/fa6"
import { Permission } from "@/models/Permission"
import { SlOptions } from "react-icons/sl"
import { UpdateNoteModal } from "../modals/notes/updates/UpdateNoteModal"
import { useNoteStore } from "@/stores/useNotesStore"
import { usePermission } from "@/hooks/usePermission"
import { useTranslation } from "react-i18next"
import { ActionMenu, type MenuActionItem } from "../ui/ActionMenu"
import { FaTrashAlt } from "react-icons/fa"
import { DeleteNoteModal } from "../modals/notes/updates/DeleteNoteModal"

import styles from "./SidebarNote.module.css"

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
  const noteOpts = getMenuOptions(
    canEdit,
    canDelete,
    t,
    setIsPatching,
    setIsDeleting
  )

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setIsPatching(true)
  }

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height
        const newVal = height > 40
        console.log("Height:", height, "isTall:", newVal)
        setIsTall(newVal)
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      onClick={onClick}
      className={clsx(styles.noteItem, isOpen && styles.open, isTall && styles.tall)}
      ref={elementRef}
    >
      <span className={styles.noteItemTitle}>{note.name}</span>

      {(canEdit || canDelete) && (
        <ActionMenu items={noteOpts} side="right" align="center">
          <AppTooltip label={t("sidebar.notes.options")}>
            <button onClick={handleClick} className={styles.patch}>
              <SlOptions size={"1.2em"} color="#9a83b4ff" />
            </button>
          </AppTooltip>
        </ActionMenu>
      )}

      <DarkWrapper open={isPatching}>
        <UpdateNoteModal noteId={note.id} setIsPatching={setIsPatching} />
      </DarkWrapper>

      <DarkWrapper open={isDeleting}>
        <DeleteNoteModal
          note={note!}
          setIsDeleting={setIsDeleting}
        />
      </DarkWrapper>
    </div>
  )
}

function getMenuOptions(
  canEdit: boolean,
  canDelete: boolean,
  t: (s: string) => string,
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
  return menuOptions
}
