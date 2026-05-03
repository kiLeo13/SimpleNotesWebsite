import { describe, expect, it } from "vitest"

import {
  hexColorAndAlphaToRgbaInt,
  rgbaIntToCss,
  rgbaIntToHexColor,
  rgbaIntToParts,
  rgbaPartsToInt
} from "./departmentColors"

describe("department color helpers", () => {
  it("converts RGBA integers to channels, CSS, and hex color values", () => {
    const value = 0x6db9ffcc

    expect(rgbaIntToParts(value)).toEqual({ r: 109, g: 185, b: 255, a: 204 })
    expect(rgbaIntToCss(value)).toBe("rgba(109, 185, 255, 0.8)")
    expect(rgbaIntToHexColor(value)).toBe("#6db9ff")
  })

  it("converts hex color plus alpha into the API integer format", () => {
    expect(hexColorAndAlphaToRgbaInt("#9b59b6", 128)).toBe(0x9b59b680)
    expect(rgbaPartsToInt({ r: 255, g: 0, b: 0, a: 255 })).toBe(0xff0000ff)
  })

  it("rejects values outside the RGBA integer range", () => {
    expect(() => rgbaIntToParts(-1)).toThrow(RangeError)
    expect(() => rgbaIntToParts(0x100000000)).toThrow(RangeError)
  })
})
