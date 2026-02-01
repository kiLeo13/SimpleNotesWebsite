import type { JSX } from "react"
import type { EditorMode } from "./CreateEditorModal"

import clsx from "clsx"

import { MermaidBoardFrame } from "@/components/board/renderers/mermaid/MermaidBoardFrame"
import { TextBoardFrame } from "@/components/board/renderers/TextBoardFrame"
import { FaEye } from "react-icons/fa"
import { FaMarkdown } from "react-icons/fa"
import { useTranslation } from "react-i18next"

import styles from "./LivePreview.module.css"

type LivePreviewProps = {
  mode: EditorMode
  content: string
}

export function LivePreview({ mode, content }: LivePreviewProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={styles.previewPanel}>
      <div className={styles.topInfos}>
        <a
          className={clsx(styles.topItem, styles.docs)}
          href={"https://www.markdownguide.org/basic-syntax"}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={styles.topIcon}>
            <FaMarkdown size={"1.5em"} color="#8472a1" />
          </div>
          {t("createNoteModal.top.md")}
        </a>
        <div className={styles.topItem}>
          <div className={styles.topIcon}>
            <FaEye size={"1.2em"} color="#8472a1" />
          </div>
          {t("createNoteModal.top.preview")}
        </div>
      </div>

      {mode === "FLOWCHART" ? (
        <MermaidBoardFrame diagram={content} warnOnFail={false} />
      ) : (
        <div className={styles.textView}>
          <TextBoardFrame markdown={content} />
        </div>
      )}
    </div>
  )
}
