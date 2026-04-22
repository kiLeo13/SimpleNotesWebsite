import { useEffect, type JSX } from "react"
import type { FullNoteResponseData } from "@/types/api/notes"

import { DocumentBoardFrame } from "./renderers/DocumentBoardFrame"
import { ImageBoardFrame } from "./renderers/ImageBoardFrame"
import { VideoBoardFrame } from "./renderers/VideoBoardFrame"
import { AudioBoardFrame } from "./renderers/AudioBoardFrame"
import {
  AsyncMermaidBoardFrame,
  AsyncTextBoardFrame,
  BoardFrameLoaderFallback
} from "./lazyBoardFrames"
import { getReferenceNoteUrl } from "@/utils/noteFiles"
import { ext } from "@/utils/utils"
import { useNoteStore } from "@/stores/useNotesStore"

type ContentBoardProps = {
  note: FullNoteResponseData
}

export function ContentBoard({ note }: ContentBoardProps): JSX.Element {
  const setRendering = useNoteStore((state) => state.setRendering)

  const isFlowchart = note.note_type === "FLOWCHART"
  const isReference = note.note_type === "REFERENCE"
  const fileExt = !isReference ? "" : ext(note.content) || "pdf"

  const route = !isReference ? "" : getReferenceNoteUrl(note.content)

  const hideLoading = () => setRendering(false)

  useEffect(() => {
    return () => setRendering(false)
  }, [setRendering])

  if (isFlowchart) {
    return (
      <AsyncMermaidBoardFrame
        diagram={note.content}
        loadingFallback={<BoardFrameLoaderFallback />}
      />
    )
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

  return (
    <AsyncTextBoardFrame
      markdown={note.content}
      loadingFallback={<BoardFrameLoaderFallback />}
    />
  )
}
