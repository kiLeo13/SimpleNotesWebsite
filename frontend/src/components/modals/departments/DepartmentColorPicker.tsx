import { useCallback, useEffect, useRef, useState, type JSX } from "react"

import * as Popover from "@radix-ui/react-popover"

import { FiCheck, FiTrash2 } from "react-icons/fi"
import { FaEyeDropper } from "react-icons/fa6"
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
  0x2db39dff, 0x35c76fff, 0x3e9fe6ff, 0x9b59b6ff, 0xe91e63ff, 0xf1c40fff,
  0xe67e22ff, 0xe74c3cff, 0x95a5a6ff, 0x607d8bff, 0x16a085ff, 0x229954ff,
  0x2874a6ff, 0x7d3c98ff, 0xad1457ff, 0xb9770eff, 0xba4a00ff, 0xa93226ff,
  0x7f8c8dff, 0x546e7aff
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
  const hasColor = value != null
  const activeColor = value ?? FALLBACK_COLOR
  const [pickerColor, setPickerColor] = useState<RgbaColor>(() =>
    rgbaIntToPickerColor(activeColor)
  )
  const lastPickerEmissionRef = useRef<number | null>(null)

  const handlePickerChange = useCallback(
    (nextColor: RgbaColor) => {
      const nextValue = pickerColorToRgbaInt(nextColor)
      setPickerColor(nextColor)

      if (nextValue !== lastPickerEmissionRef.current) {
        lastPickerEmissionRef.current = nextValue
        onChange(nextValue)
      }
    },
    [onChange]
  )

  useEffect(() => {
    if (activeColor === lastPickerEmissionRef.current) {
      return
    }

    setPickerColor(rgbaIntToPickerColor(activeColor))
  }, [activeColor])

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
            <FiTrash2
              className={styles.cornerIcon}
              size={11}
              aria-hidden="true"
            />
            {!hasColor && (
              <FiCheck
                className={styles.centerIcon}
                size={15}
                aria-hidden="true"
              />
            )}
          </button>
        </AppTooltip>

        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              className={styles.customButton}
              data-active={hasColor}
              style={
                hasColor
                  ? { backgroundColor: rgbaIntToCss(activeColor) }
                  : undefined
              }
              aria-label={t("departments.colorPicker.custom")}
            >
              <FaEyeDropper
                className={styles.cornerIcon}
                size={11}
                aria-hidden="true"
              />
              {hasColor && (
                <FiCheck
                  className={styles.centerIcon}
                  size={15}
                  aria-hidden="true"
                />
              )}
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
              <RgbaColorPicker
                color={pickerColor}
                onChange={handlePickerChange}
              />
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
            aria-label={t("departments.colorPicker.preset", {
              index: index + 1
            })}
          >
            {value === preset && <FiCheck size={13} />}
          </button>
        ))}
      </div>
    </div>
  )
}

function rgbaIntToPickerColor(value: number): RgbaColor {
  const parts = rgbaIntToParts(value)

  return {
    r: parts.r,
    g: parts.g,
    b: parts.b,
    a: parts.a / 255
  }
}

function pickerColorToRgbaInt(color: RgbaColor): number {
  return rgbaPartsToInt({
    r: color.r,
    g: color.g,
    b: color.b,
    a: Math.round(color.a * 255)
  })
}
