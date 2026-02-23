import type { JSX } from "react"
import type { CompanyPartner } from "@/types/api/misc"

import { useTranslation } from "react-i18next"

import styles from "./CompanyPartnerItem.module.css"

type CompanyPartnerItemProps = {
  partner: CompanyPartner
}

export function CompanyPartnerItem({
  partner
}: CompanyPartnerItemProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <span className={styles.rowLabel}>{t("labels.partner.name")}</span>
        <span className={styles.rowValue}>{partner.name}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>{t("labels.partner.role")}</span>
        <span className={styles.rowValue}>{`${partner.roleCode}-${partner.role}`}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.rowLabel}>{t("labels.partner.age")}</span>
        <span className={styles.rowValue}>{partner.ageRange}</span>
      </div>
    </div>
  )
}
