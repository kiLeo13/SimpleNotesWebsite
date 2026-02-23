import utc from "dayjs/plugin/utc"
import dayjs from "dayjs"
import isToday from "dayjs/plugin/isToday"
import duration from "dayjs/plugin/duration"
import timezone from "dayjs/plugin/timezone"
import isYesterday from "dayjs/plugin/isYesterday"

dayjs.extend(utc)
dayjs.extend(isToday)
dayjs.extend(duration)
dayjs.extend(timezone)
dayjs.extend(isYesterday)

const KB = 1024
const MB = KB * 1024
const GB = MB * 1024
const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez"
]

export function formatLocalTimestamp(date: string): string {
  const d = dayjs.utc(date).local()
  const time = d.format("HH:mm")

  if (d.isToday()) {
    return `Hoje, às ${time}`
  }

  if (d.isYesterday()) {
    return `Ontem, às ${time}`
  }

  const day = d.date()
  const month = MONTHS[d.month()]
  const year = d.year()

  return `${day} de ${month}. de ${year}, às ${time}`
}

export function formatTimestamp(timestamp: string): string {
  return dayjs(timestamp).format("DD/MM/YYYY [às] HH:mm")
}

export function inRange(value: number, min: number, max: number): boolean {
  const [_min, _max] = checkAndGetBounds(min, max)
  return value >= _min && value <= _max
}

export function clamp(value: number, floor: number, roof: number): number {
  const [min, max] = checkAndGetBounds(floor, roof)
  return Math.max(min, Math.min(max, value))
}

export function formatTimeSeconds(seconds: number): string {
  if (seconds <= 0) {
    return "00:00:00"
  }

  const timeDuration = dayjs.duration(seconds, "seconds")
  return timeDuration.format("HH:mm:ss")
}

export function isAlphanumeric(s: string): boolean {
  return /^[\p{L}\p{N}]+$/u.test(s)
}

/**
 * Resolves the extension of a given file.
 * Returns `undefined` if none is provided (if the file does not have a `.` character).
 *
 * **Example:**
 * ```js
 * const checks = ext("mynote.txt")
 * const three = ext("this.is.a.test")
 * const none = ext("onefile")
 *
 * console.log(checks) // "txt"
 * console.log(three)  // "test"
 * console.log(none)   // undefined
 * ```
 *
 * @param fileName The name of the file to get the extension.
 * @returns The extension of the file.
 */
export function ext(fileName: string): string | undefined {
  const ext = fileName.split(".").pop()
  return ext ? ext.toLowerCase() : undefined
}

export function getPrettySize(size: number): string {
  if (size < KB) return `${size} Bytes`
  if (size < MB) return `${formatSizeValue(size / KB)} KB`
  if (size < GB) return `${formatSizeValue(size / MB)} MB`

  return `${formatSizeValue(size / GB)} GB`
}

export function isOnlyDigit(s: string): boolean {
  return /^\d+$/.test(s)
}

/**
 * Extracts only the fields that have been modified (marked as dirty)
 * from the React Hook Form data.
 */
export function getDirtyValues<T extends Record<string, unknown>>(
  dirtyFields: Record<string, unknown>,
  allValues: T
): Partial<T> {
  const dirtyValues: Partial<T> = {}

  Object.keys(dirtyFields).forEach((key) => {
    const typedKey = key as keyof T
    dirtyValues[typedKey] = allValues[typedKey]
  })
  return dirtyValues
}

// Helpers
function checkAndGetBounds(a: number, b: number): [number, number] {
  if (a > b) {
    console.warn(
      `[utils] The first bound (${a}) is greater than the second (${b}). The values will be swapped.`
    )
    return [b, a]
  }
  return [a, b]
}

function formatSizeValue(num: number): string {
  return num
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1")
}
