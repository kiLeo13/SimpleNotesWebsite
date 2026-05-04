import { useEffect, useRef, useState, type ChangeEvent, type JSX } from "react"
import type { EmojiClickData } from "emoji-picker-react"
import type { DepartmentIconType } from "@/types/api/departments"

import * as Popover from "@radix-ui/react-popover"
import twemoji from "twemoji"

import { FiImage, FiSmile, FiX } from "react-icons/fi"
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
  iconType: DepartmentIconType
  emoji: string
  selectedFile: File | null
  currentImageSrc?: string
  onEmojiChange: (emoji: string) => void
  onFileChange: (file: File | null) => void
  onRemoveIcon: () => void
  disabled?: boolean
}

export function IconPicker({
  iconType,
  emoji,
  selectedFile,
  currentImageSrc,
  onEmojiChange,
  onFileChange,
  onRemoveIcon,
  disabled = false
}: IconPickerProps): JSX.Element {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<IconPickerTab>("upload")
  const [selectedFilePreviewSrc, setSelectedFilePreviewSrc] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const emojiPreviewRef = useRef<HTMLSpanElement>(null)
  const imagePreviewSrc =
    iconType === "IMAGE" ? selectedFilePreviewSrc || currentImageSrc : undefined
  const hasImagePreview = Boolean(imagePreviewSrc)
  const hasEmojiPreview = iconType === "EMOJI" && emoji.trim().length > 0
  const hasIcon = hasImagePreview || hasEmojiPreview

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreviewSrc("")
      return
    }

    const url = URL.createObjectURL(selectedFile)
    setSelectedFilePreviewSrc(url)

    return () => URL.revokeObjectURL(url)
  }, [selectedFile])

  useEffect(() => {
    if (hasEmojiPreview && emojiPreviewRef.current) {
      twemoji.parse(emojiPreviewRef.current, {
        folder: "svg",
        ext: ".svg"
      })
    }
  }, [emoji, hasEmojiPreview])

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiChange(emojiData.emoji)
    setOpen(false)
  }

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (file) {
      onFileChange(file)
      setOpen(false)
      event.target.value = ""
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleChooseClick = () => {
    setActiveTab("upload")
  }

  const handleRemoveIcon = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onRemoveIcon()
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className={styles.pickerRow}>
        <div className={styles.preview} data-empty={!hasIcon}>
          {hasImagePreview && imagePreviewSrc ? (
            <img
              className={styles.previewImage}
              src={imagePreviewSrc}
              draggable={false}
            />
          ) : hasEmojiPreview ? (
            <span ref={emojiPreviewRef} className={styles.previewEmoji}>
              {emoji}
            </span>
          ) : (
            <FiImage className={styles.previewPlaceholder} size={18} />
          )}
        </div>

        <Popover.Trigger asChild disabled={disabled}>
          <button
            type="button"
            className={styles.chooseButton}
            aria-label={t("departments.fields.pickIcon")}
            disabled={disabled}
            onClick={handleChooseClick}
          >
            <FiImage size={14} />
            {t("departments.iconPicker.chooseImage")}
          </button>
        </Popover.Trigger>

        {hasIcon && !disabled && (
          <button
            type="button"
            className={styles.removeButton}
            aria-label={t("departments.iconPicker.removeIcon")}
            onClick={handleRemoveIcon}
          >
            <FiX size={14} />
            {t("departments.iconPicker.removeIcon")}
          </button>
        )}
      </div>

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
                  {selectedFile?.name ??
                    (hasImagePreview
                      ? t("departments.iconPicker.currentImage")
                      : t("departments.iconPicker.uploadHint"))}
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
