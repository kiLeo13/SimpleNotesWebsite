import type { JSX } from "react"
import { useWatch, type Control } from "react-hook-form"
import { passwords, type SignupFormFields } from "../../../types/forms/users"

import React from "react"

import { PasswordRuleItem } from "./PasswordRuleItem"
import { hasCustom, hasDigits, hasLower, hasUpper } from "../../../utils/pwdUtils"
import { inRange } from "../../../utils/utils"

import styles from "./PasswordRules.module.css"

const rules = [
  { check: hasLength, message: `Contém ao menos ${passwords.minLength} caracteres` },
  { check: hasLower,  message: "Contém letras minúsculas" },
  { check: hasUpper,  message: "Contém letras maiúsculas" },
  { check: hasCustom, message: "Contém caracteres especiais" },
  { check: hasDigits, message: "Contém dígitos" }
] as const

type PasswordRulesProps = {
  control: Control<SignupFormFields>
}

export function PasswordRules({ control }: PasswordRulesProps): JSX.Element | null {
  const pwd = useWatch({
    control: control,
    name: 'password',
    defaultValue: ''
  })
  const brokenRules = rules.filter((rule) => !rule.check(pwd))
  if (brokenRules.length === 0) {
    return null
  }

  return (
    <div className={styles.container}>
      {brokenRules.map(({ message }, i) => (
        <React.Fragment key={i}>
          <PasswordRuleItem text={message} />

          {/* Add separator only if it's not the last item in the broken list */}
          {i < brokenRules.length - 1 && <hr className={styles.separator} />}
        </React.Fragment>
      ))}
    </div>
  )
}

function hasLength(s: string): boolean {
  const len = s.length
  return inRange(len, passwords.minLength, passwords.maxLength)
}