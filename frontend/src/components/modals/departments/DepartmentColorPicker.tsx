import { useCallback, useMemo, type JSX } from "react"

import * as Popover from "@radix-ui/react-popover"

import { FiCheck, FiEdit3, FiRotateCcw } from "react-icons/fi"
import { AppTooltip } from "@/components/ui/AppTooltip"
import { RgbaColorPicker, type RgbaColor } from "react-colorful"
import { useTranslation } from "react-i18next"
import {
  rgbaIntToCss,
  rgbaIntToParts,
  rgbaPartsToInt
} from "@/utils/departmentColors"

import styles from "./DepartmentColorPicker.module.css"

const FALLBACK_COLOR = 0x7856b0ff
const DEPARTMENT_COLOR_PRESETS = [
  0x2db39dff,
  0x35c76fff,
  0x3e9fe6ff,
  0x9b59b6ff,
  0xe91e63ff,
  0xf1c40fff,
  0xe67e22ff,
  0xe74c3cff,
  0x95a5a6ff,
  0x607d8bff,
  0x16a085ff,
  0x229954ff,
  0x2874a6ff,
  0x7d3c98ff,
  0xad1457ff,
  0xb9770eff,
  0xba4a00ff,
  0xa93226ff,
  0x7f8c8dff,
  0x546e7aff
]

type DepartmentColorPickerProps = {
  value: number | null
  onChange: (value: number | null) => void
}

export function DepartmentColorPicker({
  value,
  onChange
}: DepartmentColorPickerProps): JSX.Element {
  const { t } = useTranslation()
  const activeColor = value ?? FALLBACK_COLOR
  const activeParts = useMemo(() => rgbaIntToParts(activeColor), [activeColor])

  const pickerColor: RgbaColor = useMemo(
    () => ({
      r: activeParts.r,
      g: activeParts.g,
      b: activeParts.b,
      a: activeParts.a / 255
    }),
    [activeParts]
  )

  const handlePickerChange = useCallback(
    (nextColor: RgbaColor) => {
      const nextValue = rgbaPartsToInt({
        r: nextColor.r,
        g: nextColor.g,
        b: nextColor.b,
        a: Math.round(nextColor.a * 255)
      })
      if (nextValue !== activeColor) {
        onChange(nextValue)
      }
    },
    [activeColor, onChange]
  )

  return (
    <div className={styles.colorPicker}>
      <div className={styles.controlGroup}>
        <AppTooltip label={t("departments.colorPicker.reset")}>
          <button
            type="button"
            className={styles.resetButton}
            data-active={value == null}
            onClick={() => onChange(null)}
            aria-label={t("departments.colorPicker.reset")}
          >
            <FiRotateCcw size={14} />
          </button>
        </AppTooltip>

        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              className={styles.customButton}
              style={{ backgroundColor: rgbaIntToCss(activeColor) }}
              aria-label={t("departments.colorPicker.custom")}
            >
              <FiEdit3 size={14} />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className={styles.popoverContent}
              side="bottom"
              align="start"
              sideOffset={8}
              onOpenAutoFocus={(event) => event.preventDefault()}
            >
              <RgbaColorPicker color={pickerColor} onChange={handlePickerChange} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div
        className={styles.swatches}
        aria-label={t("departments.colorPicker.presets")}
      >
        {DEPARTMENT_COLOR_PRESETS.map((preset, index) => (
          <button
            key={preset}
            type="button"
            className={styles.swatch}
            data-active={value === preset}
            style={{ backgroundColor: rgbaIntToCss(preset) }}
            onClick={() => onChange(preset)}
            aria-label={t("departments.colorPicker.preset", { index: index + 1 })}
          >
            {value === preset && <FiCheck size={13} />}
          </button>
        ))}
      </div>
    </div>
  )
}
