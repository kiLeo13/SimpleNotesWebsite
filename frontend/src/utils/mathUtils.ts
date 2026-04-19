// Helper to truncate decimals without rounding
export function truncateDecimals(number: number, digits: number): number {
  const stepper = 10.0 ** digits
  return Math.trunc(stepper * number) / stepper
}

// Helper to get just the decimal part to 6 places
export function getDecimalPart(number: number): number {
  const truncated = truncateDecimals(number, 6)
  const decimal = truncated - Math.trunc(truncated)

  return parseFloat(decimal.toFixed(6))
}