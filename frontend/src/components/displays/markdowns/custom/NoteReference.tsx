import type { ComponentProps, JSX } from "react"
import type { ExtraProps } from "react-markdown"

import * as Popover from "@radix-ui/react-popover"

import { NoteFrame } from "./NoteFrame"
import { useTranslation } from "react-i18next"
import { useNoteStore } from "@/stores/useNotesStore"

import styles from "./NoteReference.module.css"

type NoteRefProps = ComponentProps<"span"> &
  ExtraProps & {
    noteid?: string
  }

export function NoteReference({
  noteid: noteId,
  children,
  ...props
}: NoteRefProps): JSX.Element {
  const { t } = useTranslation()

  const numericId = Number(noteId)
  const note = useNoteStore((s) => s.notes.find((n) => n.id === numericId))
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : Boolean(children)

  if (!note) {
    return (
      <span
        className={styles.unknownNote}
        title={t("labels.notes.refNoteNotFound", { id: numericId })}
        {...props}
      >
        <i>{t("commons.notFound")}</i>
      </span>
    )
  }

  const textToDisplay = hasChildren ? children : note.name

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <span className={styles.noteLink} {...props}>
          {textToDisplay}
        </span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          collisionPadding={10}
          className={styles.popoverContent}
          side="bottom"
          align="start"
          sideOffset={5}
        >
          <NoteFrame baseNote={note} />
          <Popover.Arrow className={styles.popoverArrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
