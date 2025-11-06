import type { JSX } from "react"
import type { FullNoteResponseData } from "../../types/api/notes"

import { DocumentBoardFrame } from "./renderers/DocumentBoardFrame"
import { ImageBoardFrame } from "./renderers/ImageBoardFrame"
import { VideoBoardFrame } from "./renderers/VideoBoardFrame"
import { AudioBoardFrame } from "./renderers/AudioBoardFrame"
import { TextBoardFrame } from "./renderers/TextBoardFrame"
import { ext } from "../../utils/utils"

type ContentBoardProps = {
  note: FullNoteResponseData
}

const BASE_ROUTE = 'https://d26143aouxq3ma.cloudfront.net/attachments'

export function ContentBoard({ note }: ContentBoardProps): JSX.Element {
  const fileExt = ext(note.content) || "pdf"
  const isText = note.note_type === 'TEXT'
  const route = isText ? "" : `${BASE_ROUTE}/${note.content}`

  if (fileExt === "pdf") {
    return <DocumentBoardFrame url={route} />
  }

  if (["png", "jpg", "jpeg", "jfif", "webp"].includes(fileExt)) {
    return <ImageBoardFrame url={route} />
  }

  if (["gif", "mp4"].includes(fileExt)) {
    return <VideoBoardFrame url={route} />
  }

  if (fileExt === "mp3") {
    return <AudioBoardFrame url={route} />
  }

  return <TextBoardFrame markdown={note.content} />
}