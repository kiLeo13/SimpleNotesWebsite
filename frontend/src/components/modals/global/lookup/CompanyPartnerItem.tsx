import { useEffect, useState, type JSX } from "react"
import type { CompanyPartner } from "@/types/api/misc"

import clsx from "clsx"

import { Button } from "@/components/ui/buttons/Button"
import { FaChevronDown } from "react-icons/fa"
import { useTranslation } from "react-i18next"

import styles from "./CompanyPartnerItem.module.css"

type CompanyPartnerItemProps = {
  partner: CompanyPartner
  autoExpand: boolean
}

export function CompanyPartnerItem({
  partner,
  autoExpand
}: CompanyPartnerItemProps): JSX.Element {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(autoExpand)

  const roleName = `${partner.roleCode}-${partner.role}`

  useEffect(() => {
    if (autoExpand) {
      const timer = setTimeout(() => {
        setCollapsed(false)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [autoExpand])

  const handleToggleCollapse = () => {
    setCollapsed((c) => !c)
  }

  return (
    <div
      className={styles.container}
      data-collapsed={collapsed ? "" : undefined}
    >
      <div className={styles.controls}>
        <Button className={styles.chevronButton} onClick={handleToggleCollapse}>
          <FaChevronDown className={styles.chevronIcon} />
        </Button>
      </div>

      <div className={styles.contents}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t("labels.partner.name")}</span>
          <span className={styles.rowValue}>{partner.name}</span>
        </div>

        <div className={clsx(styles.extras, collapsed && styles.collapsed)}>
          <div className={styles.extrasInner}>
            <div className={styles.row}>
              <span className={styles.rowLabel}>
                {t("labels.partner.role")}
              </span>
              <span className={styles.rowValue}>{roleName}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.rowLabel}>{t("labels.partner.age")}</span>
              <span className={styles.rowValue}>{partner.ageRange}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
