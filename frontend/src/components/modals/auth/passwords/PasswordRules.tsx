import type { JSX } from "react"
import { useWatch, type Control } from "react-hook-form"
import { type SignupFormFields } from "@/types/forms/users"

import React from "react"
import { useTranslation } from "react-i18next"

import { PasswordRuleItem } from "./PasswordRuleItem"
import { getBrokenPasswordRules } from "./PasswordRules.helpers"

import styles from "./PasswordRules.module.css"

type PasswordRulesProps = {
  control: Control<SignupFormFields>
}

export function PasswordRules({
  control
}: PasswordRulesProps): JSX.Element | null {
  const { t } = useTranslation()
  const pwd = useWatch({
    control,
    name: "password",
    defaultValue: ""
  })
  const brokenRules = getBrokenPasswordRules(pwd)
  if (brokenRules.length === 0) {
    return null
  }

  return (
    <div className={styles.container}>
      {brokenRules.map(({ key, options }, i) => (
        <React.Fragment key={key}>
          <PasswordRuleItem text={t(key, options)} />

          {i < brokenRules.length - 1 && <hr className={styles.separator} />}
        </React.Fragment>
      ))}
    </div>
  )
}
