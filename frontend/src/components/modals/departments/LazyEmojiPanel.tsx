import type { JSX } from "react"
import EmojiPicker, { EmojiStyle, Theme, type EmojiClickData } from "emoji-picker-react"

type LazyEmojiPanelProps = {
  onEmojiClick: (data: EmojiClickData) => void
  searchPlaceholder: string
}

export function LazyEmojiPanel({
  onEmojiClick,
  searchPlaceholder
}: LazyEmojiPanelProps): JSX.Element {
  return (
    <EmojiPicker
      theme={Theme.DARK}
      emojiStyle={EmojiStyle.TWITTER}
      onEmojiClick={onEmojiClick}
      lazyLoadEmojis
      searchPlaceHolder={searchPlaceholder}
      width={340}
      height={360}
    />
  )
}
