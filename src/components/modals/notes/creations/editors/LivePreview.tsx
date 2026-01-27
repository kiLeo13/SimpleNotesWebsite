import type { JSX } from "react"
import type { EditorMode } from "./CreateEditorModal"

import { MermaidBoardFrame } from "@/components/board/renderers/mermaid/MermaidBoardFrame"
import { TextBoardFrame } from "@/components/board/renderers/TextBoardFrame"
import { FaEye } from "react-icons/fa"
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
      <div className={styles.previewHeader}>
        <FaEye />
        {t("createNoteModal.preview")}
      </div>

      {mode === "FLOWCHART" ? (
        <MermaidBoardFrame diagram={content} warnOnFail={false} />
      ) : (
        <div style={{ height: "100%", overflowY: "auto" }}>
          <TextBoardFrame markdown={content} />
        </div>
      )}
    </div>
  )
}
