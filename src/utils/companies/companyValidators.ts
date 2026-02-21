const CNPJ_LENGTH = 14

function hasAllSameDigits(s: string): boolean {
  for (let i = 1; i < s.length; i++) {
    if (s[i] !== s[0]) {
      return false
    }
  }
  return true
}

function calculateCNPJDigit(base: string, weights: number[]): number {
  let sum = 0
  for (let i = 0; i < weights.length; i++) {
    sum += parseInt(base[i], 10) * weights[i]
  }

  const remainder = sum % 11
  if (remainder < 2) {
    return 0
  }
  return 11 - remainder
}

function validateCNPJDigits(cnpj: string): boolean {
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const digit1 = calculateCNPJDigit(cnpj.slice(0, 12), weights1)
  const digit2 = calculateCNPJDigit(cnpj.slice(0, 13), weights2)

  const actualDigit1 = parseInt(cnpj[12], 10)
  const actualDigit2 = parseInt(cnpj[13], 10)

  return digit1 === actualDigit1 && digit2 === actualDigit2
}

export function isCNPJValid(cnpj: string): boolean {
  if (cnpj.length !== CNPJ_LENGTH) {
    return false
  }

  if (!/^\d+$/.test(cnpj)) {
    return false
  }

  if (hasAllSameDigits(cnpj)) {
    return false
  }

  return validateCNPJDigits(cnpj)
}
