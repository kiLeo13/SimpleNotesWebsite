import { useEffect, type JSX } from "react"
import type { FullNoteResponseData } from "@/types/api/notes"

import { DocumentBoardFrame } from "./renderers/DocumentBoardFrame"
import { ImageBoardFrame } from "./renderers/ImageBoardFrame"
import { VideoBoardFrame } from "./renderers/VideoBoardFrame"
import { AudioBoardFrame } from "./renderers/AudioBoardFrame"
import { TextBoardFrame } from "./renderers/TextBoardFrame"
import { MermaidBoardFrame } from "./renderers/mermaid/MermaidBoardFrame"
import { ext } from "@/utils/utils"
import { useNoteStore } from "@/stores/useNotesStore"

type ContentBoardProps = {
  note: FullNoteResponseData
}

const BASE_ROUTE = 'https://d26143aouxq3ma.cloudfront.net/attachments'

export function ContentBoard({ note }: ContentBoardProps): JSX.Element {
  const setRendering = useNoteStore((state) => state.setRendering)
  const fileExt = ext(note.content) || "pdf"

  const isFlowchart = note.note_type === 'FLOWCHART'
  const isText = note.note_type === 'TEXT'

  const route = (isText || isFlowchart) ? "" : `${BASE_ROUTE}/${note.content}`
  
  const hideLoading = () => setRendering(false)

  useEffect(() => {
    return () => setRendering(false)
  }, [setRendering])

  if (isFlowchart) {
    return <MermaidBoardFrame diagram={note.content} />
  }

  if (fileExt === "pdf") {
    return <DocumentBoardFrame onLoad={hideLoading} url={route} />
  }

  if (["png", "jpg", "jpeg", "jfif", "webp"].includes(fileExt)) {
    return <ImageBoardFrame onLoad={hideLoading} url={route} />
  }

  if (["gif", "mp4"].includes(fileExt)) {
    return <VideoBoardFrame onCanPlay={hideLoading} url={route} />
  }

  if (fileExt === "mp3") {
    return <AudioBoardFrame onCanPlay={hideLoading} url={route} />
  }

  return <TextBoardFrame markdown={note.content} />
}