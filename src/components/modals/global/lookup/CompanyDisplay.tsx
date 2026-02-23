import { useState, type ChangeEvent, type JSX } from "react"
import type {
  CompanyPartner,
  CompanyResponse,
  RegistrationStatus
} from "@/types/api/misc"

import clsx from "clsx"

import { IoSearchSharp, IoWarning } from "react-icons/io5"
import { IoMdSync } from "react-icons/io"
import { BsDatabaseCheck } from "react-icons/bs"
import { CompanyPartnerItem } from "./CompanyPartnerItem"
import { AppTooltip } from "@/components/ui/AppTooltip"
import { useTranslation } from "react-i18next"
import { formatDate, formatMoney } from "@/utils/utils"
import { matchSorter } from "match-sorter"

import styles from "./CompanyDisplay.module.css"

// Just a replacement for companies with no trade name.
// "notn" stands for "No Trade Name" :D
const notn = "********"
const i18nRegStatus: Record<RegistrationStatus, string> = {
  ACTIVE: "commons.companies.activity.active",
  CLOSED: "commons.companies.activity.closed",
  SUSPENDED: "commons.companies.activity.suspended",
  UNFIT: "commons.companies.activity.unfit",
  UNKNOWN: "commons.unknown"
}

type CompanyDisplayProps = {
  company: CompanyResponse
}

export function CompanyDisplay({ company }: CompanyDisplayProps): JSX.Element {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")

  const cacheLabel = company.cached
    ? t("labels.cacheHit")
    : t("labels.cacheMiss")
  const regStatus = company.registration.status
  const isActive = regStatus === "ACTIVE"
  const searchedPartners = toFilteredPartners(search, company.partners)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.partners}>
          <header className={styles.leftHeader}>
            <h2 className={styles.partnersTitle}>
              {t("labels.partners", { val: company.partners.length })}
            </h2>
            <div className={styles.searchContainer}>
              <IoSearchSharp className={styles.searchIcon} />
              <input
                className={styles.partnerSearchInput}
                value={search}
                onChange={handleSearchChange}
                type="text"
                placeholder={t("placeholders.search")}
                id="partner-search"
              />
            </div>
          </header>

          <ul className={styles.partnerList}>
            {searchedPartners.map((p) => (
              <li className={styles.partnerItem}>
                <CompanyPartnerItem key={p.name} partner={p} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.right}>
        <div className={clsx(styles.generic, !isActive && styles.warning)}>
          <div className={styles.headerTitle}>
            <AppTooltip label={cacheLabel}>
              {company.cached ? (
                <BsDatabaseCheck className={styles.cacheIcon} />
              ) : (
                <IoMdSync className={styles.cacheIcon} />
              )}
            </AppTooltip>
            <span className={styles.tagTitle}>{t("labels.companyInfos")}</span>
          </div>

          <h2 className={styles.legalName}>
            {!isActive && (
              <AppTooltip label={t("tooltips.warnings.inactiveCnpj")}>
                <IoWarning size={"1.3em"} color="#d8d874" cursor="pointer" />
              </AppTooltip>
            )}
            <span>{company.legalName}</span>
          </h2>

          <ul className={styles.infoList}>
            <li className={styles.listItem}>
              <span className={styles.listItemLabel}>
                {t("labels.tradeName")}
              </span>
              <span className={styles.listItemValue}>
                {company.tradeName || notn}
              </span>
            </li>

            <li className={styles.listItem}>
              <span className={styles.listItemLabel}>
                {t("labels.legalNature")}
              </span>
              <span className={styles.listItemValue}>
                {company.legalNature}
              </span>
            </li>

            <li className={styles.listItem}>
              <span className={styles.listItemLabel}>
                {t("labels.companyStartDate")}
              </span>
              <span className={styles.listItemValue}>
                {formatDate(company.startDate)}
              </span>
            </li>

            <li className={styles.listItem}>
              <span className={styles.listItemLabel}>
                {t("labels.regStatus")}
              </span>
              <span className={styles.listItemValue}>
                {t(i18nRegStatus[regStatus])}
              </span>
            </li>

            {!isActive && (
              <li className={styles.listItem}>
                <span className={styles.listItemLabel}>
                  {t("labels.regStatusReason")}
                </span>
                <span className={styles.listItemValue}>
                  {company.registration.reason}
                </span>
              </li>
            )}

            <li className={styles.listItem}>
              <span className={styles.listItemLabel}>
                {t("labels.regStatusDate")}
              </span>
              <span className={styles.listItemValue}>
                {formatDate(company.registration.date)}
              </span>
            </li>

            <li className={styles.listItem}>
              <span className={styles.listItemLabel}>
                {t("labels.companySize")}
              </span>
              <span className={styles.listItemValue}>
                {company.companySize}
              </span>
            </li>

            <li className={styles.listItem}>
              <span className={styles.listItemLabel}>
                {t("labels.shareCapital")}
              </span>
              <span className={styles.listItemValue}>
                {formatMoney(company.shareCapital)}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function toFilteredPartners(
  search: string,
  partners: CompanyPartner[]
): CompanyPartner[] {
  if (!search.trim()) return partners

  return matchSorter(partners, search, { keys: ["name"] })
}
