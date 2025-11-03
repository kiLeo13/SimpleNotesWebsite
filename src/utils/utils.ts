import dayjs from "dayjs"
import duration from 'dayjs/plugin/duration'

const KB = 1024
const MB = KB * 1024
const GB = MB * 1024

dayjs.extend(duration)

export function inRange(value: number, a: number, b: number): boolean {
  const [min, max] = checkAndGetBounds(a, b)
  return value >= min && value <= max
}

export function clamp(value: number, floor: number, roof: number): number {
  const [min, max] = checkAndGetBounds(floor, roof)
  return Math.max(min, Math.min(max, value))
}

export function formatTimeSeconds(seconds: number): string {
  if (seconds <= 0) {
    return '00:00:00'
  }

  const timeDuration = dayjs.duration(seconds, 'seconds')
  return timeDuration.format('HH:mm:ss')
}

export function getPrettySize(size: number): string {
  if (size < KB) return `${size} Bytes`
  if (size < MB) return `${formatNumber(size / KB)} KB`
  if (size < GB) return `${formatNumber(size / MB)} MB`
  
  return `${formatNumber(size / GB)} GB`
}

export function formatNumber(num: number): string {
  return num.toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1')
}

export function isOnlyDigit(s: string): boolean {
  return /^\d+$/.test(s)
}

// Helpers
function checkAndGetBounds(a: number, b: number): [number, number] {
  if (a > b) {
    console.warn(`[utils] The first bound (${a}) is greater than the second (${b}). The values will be swapped.`)
    return [b, a]
  }
  return [a, b]
}