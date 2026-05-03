export const MAX_RGBA_INTEGER = 0xffffffff

export type DepartmentColorParts = {
  r: number
  g: number
  b: number
  a: number
}

export function isDepartmentColor(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= MAX_RGBA_INTEGER
}

export function rgbaIntToParts(value: number): DepartmentColorParts {
  if (!isDepartmentColor(value)) {
    throw new RangeError("department color must be an integer between 0 and 0xffffffff")
  }

  return {
    r: Math.floor(value / 0x1000000) % 0x100,
    g: Math.floor(value / 0x10000) % 0x100,
    b: Math.floor(value / 0x100) % 0x100,
    a: value % 0x100
  }
}

export function rgbaPartsToInt({ r, g, b, a }: DepartmentColorParts): number {
  const normalized = [r, g, b, a]
  if (normalized.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    throw new RangeError("department color channels must be integers between 0 and 255")
  }

  return r * 0x1000000 + g * 0x10000 + b * 0x100 + a
}

export function rgbaIntToCss(value: number | null | undefined): string | undefined {
  if (value == null) return undefined

  const { r, g, b, a } = rgbaIntToParts(value)
  return `rgba(${r}, ${g}, ${b}, ${formatAlpha(a / 255)})`
}

export function rgbaIntToHexColor(value: number): string {
  const { r, g, b } = rgbaIntToParts(value)
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`
}

export function hexColorAndAlphaToRgbaInt(hexColor: string, alpha: number): number {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor)
  if (!match) {
    throw new Error("department color hex value must be in #rrggbb format")
  }
  if (!Number.isInteger(alpha) || alpha < 0 || alpha > 255) {
    throw new RangeError("department color alpha must be an integer between 0 and 255")
  }

  return rgbaPartsToInt({
    r: Number.parseInt(match[1], 16),
    g: Number.parseInt(match[2], 16),
    b: Number.parseInt(match[3], 16),
    a: alpha
  })
}

function toHexByte(value: number): string {
  return value.toString(16).padStart(2, "0")
}

function formatAlpha(alpha: number): string {
  return Number(alpha.toFixed(3)).toString()
}
