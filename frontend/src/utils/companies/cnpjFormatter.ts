export function formatCNPJ(value: string): string {
  return value
    .replace(/\D/g, "") // Strip everything that is not a number
    .replace(/^(\d{2})(\d)/, "$1.$2") // Add dot after the 2nd digit
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3") // Add dot after the 5th digit
    .replace(/\.(\d{3})(\d)/, ".$1/$2") // Add slash after the 8th digit
    .replace(/(\d{4})(\d)/, "$1-$2") // Add dash after the 12th digit
    .slice(0, 18) // Ensure it doesn't exceed the formatted length
}
