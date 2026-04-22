import { ext } from "./utils"

const ATTACHMENTS_BASE_URL = "https://d26143aouxq3ma.cloudfront.net/attachments"

export function getReferenceNoteUrl(content: string): string {
  return `${ATTACHMENTS_BASE_URL}/${content}`
}

export function getReferenceDownloadName(
  noteName: string,
  content: string
): string {
  const fileExtension = ext(content)

  if (!fileExtension) {
    return noteName
  }

  return noteName.toLowerCase().endsWith(`.${fileExtension}`)
    ? noteName
    : `${noteName}.${fileExtension}`
}
