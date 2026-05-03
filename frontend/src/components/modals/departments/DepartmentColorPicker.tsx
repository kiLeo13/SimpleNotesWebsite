import type { ChangeEvent, JSX } from "react"

import { FiCheck, FiEdit3, FiSlash } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import {
  hexColorAndAlphaToRgbaInt,
  rgbaIntToCss,
  rgbaIntToHexColor,
  rgbaIntToParts
} from "@/utils/departmentColors"

import styles from "./DepartmentColorPicker.module.css"

const FALLBACK_COLOR = 0x7856b0ff
const DEPARTMENT_COLOR_PRESETS = [
  0xa6b7c1ff,
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
  0xa93226ff
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
  const activeParts = rgbaIntToParts(activeColor)
  const activeHex = rgbaIntToHexColor(activeColor)
  const alpha = value == null ? 255 : activeParts.a

  const handleCustomColorChange = (nextHex: string) => {
    onChange(hexColorAndAlphaToRgbaInt(nextHex, alpha))
  }

  const handleAlphaChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(hexColorAndAlphaToRgbaInt(activeHex, Number(event.target.value)))
  }

  return (
    <div className={styles.colorPicker}>
      <div className={styles.swatches} aria-label={t("departments.colorPicker.presets")}>
        <button
          type="button"
          className={styles.noneButton}
          data-active={value == null}
          onClick={() => onChange(null)}
          aria-label={t("departments.colorPicker.none")}
        >
          {value == null ? <FiCheck size={15} /> : <FiSlash size={14} />}
        </button>

        <label
          className={styles.customButton}
          style={{ backgroundColor: rgbaIntToCss(activeColor) }}
          aria-label={t("departments.colorPicker.custom")}
        >
          <FiEdit3 size={13} />
          <input
            type="color"
            value={activeHex}
            onChange={(event) => handleCustomColorChange(event.target.value)}
            aria-label={t("departments.colorPicker.custom")}
          />
        </label>

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

      <label className={styles.alphaControl}>
        <span>{t("departments.colorPicker.alpha")}</span>
        <input
          type="range"
          min={0}
          max={255}
          value={alpha}
          onChange={handleAlphaChange}
        />
        <strong>{Math.round((alpha / 255) * 100)}%</strong>
      </label>
    </div>
  )
}
