import { passwords } from "@/types/forms/users"
import { hasCustom, hasDigits, hasLower, hasUpper } from "@/utils/pwdUtils"
import { inRange } from "@/utils/utils"

export type PasswordRule = {
  check: (password: string) => boolean
  key: string
  options?: Record<string, unknown>
}

const passwordRules: PasswordRule[] = [
  {
    check: hasLength,
    key: "modals.auth.passwordRules.length",
    options: { count: passwords.minLength }
  },
  { check: hasLower, key: "modals.auth.passwordRules.lower" },
  { check: hasUpper, key: "modals.auth.passwordRules.upper" },
  { check: hasCustom, key: "modals.auth.passwordRules.special" },
  { check: hasDigits, key: "modals.auth.passwordRules.digits" }
]

export function getBrokenPasswordRules(password: string): PasswordRule[] {
  return passwordRules.filter((rule) => !rule.check(password))
}

function hasLength(s: string): boolean {
  const len = s.length
  return inRange(len, passwords.minLength, passwords.maxLength)
}
