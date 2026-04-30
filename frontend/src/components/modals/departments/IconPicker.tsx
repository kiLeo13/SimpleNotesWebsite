import { useRef, useState, type ChangeEvent, type JSX } from "react"
import type { EmojiClickData } from "emoji-picker-react"

import * as Popover from "@radix-ui/react-popover"

import { FiImage, FiSmile } from "react-icons/fi"
import { LoaderContainer } from "@/components/LoaderContainer"
import { useTranslation } from "react-i18next"
import { createAsyncComponent } from "@/utils/createAsyncComponent"

import styles from "./IconPicker.module.css"

type IconPickerTab = "upload" | "emoji"

const LazyEmojiPanel = createAsyncComponent(
  () => import("./LazyEmojiPanel"),
  (module) => module.LazyEmojiPanel
)

const emojiPanelFallback = <LoaderContainer scale={0.7} loaderColor="#b79ed8" />

type IconPickerProps = {
  emoji: string
  onEmojiChange: (emoji: string) => void
  onFileChange: (file: File | null) => void
  currentFileName?: string
  disabled?: boolean
}

export function IconPicker({
  emoji,
  onEmojiChange,
  onFileChange,
  currentFileName,
  disabled = false
}: IconPickerProps): JSX.Element {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<IconPickerTab>("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiChange(emojiData.emoji)
    onFileChange(null)
    setOpen(false)
  }

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (file) {
      onFileChange(file)
      setOpen(false)
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={disabled}>
        <button
          type="button"
          className={styles.trigger}
          aria-label={t("departments.fields.pickIcon")}
        >
          <span className={styles.triggerEmoji}>{emoji}</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.content}
          side="bottom"
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className={styles.tabs}>
            <button
              type="button"
              className={styles.tab}
              data-active={activeTab === "upload"}
              onClick={() => setActiveTab("upload")}
            >
              <FiImage size={14} />
              {t("departments.iconPicker.uploadTab")}
            </button>
            <button
              type="button"
              className={styles.tab}
              data-active={activeTab === "emoji"}
              onClick={() => setActiveTab("emoji")}
            >
              <FiSmile size={14} />
              {t("departments.iconPicker.emojiTab")}
            </button>
          </div>

          {activeTab === "upload" && (
            <div className={styles.uploadPanel}>
              <div className={styles.uploadZone} onClick={handleBrowseClick}>
                <div className={styles.uploadIconWrapper}>
                  <FiImage size={32} />
                </div>
                <span className={styles.uploadHint}>
                  {currentFileName
                    ? currentFileName
                    : t("departments.iconPicker.uploadHint")}
                </span>
                <button
                  type="button"
                  className={styles.browseButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBrowseClick()
                  }}
                >
                  {t("departments.iconPicker.browse")}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif"
                className="hidden-styled-file-input"
                onChange={handleFileSelected}
              />
            </div>
          )}

          {activeTab === "emoji" && (
            <div
              className={styles.emojiPanel}
              onWheel={(e) => e.stopPropagation()}
            >
              <LazyEmojiPanel
                loadingFallback={emojiPanelFallback}
                onEmojiClick={handleEmojiClick}
                searchPlaceholder={t("departments.iconPicker.searchEmoji")}
              />
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

