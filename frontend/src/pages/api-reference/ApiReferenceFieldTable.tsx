import { useTranslation } from "react-i18next"

import type { ApiField } from "./apiReferenceDocs"
import { ApiReferenceFieldName } from "./ApiReferenceFieldName"
import { renderInline } from "./ApiReferenceInline"

import styles from "./ApiReferenceFieldTable.module.css"

type ApiReferenceFieldTableProps = {
  fields: ApiField[]
  title: string
}

export function ApiReferenceFieldTable({
  fields,
  title
}: ApiReferenceFieldTableProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>{title}</caption>
        <thead>
          <tr>
            <th className={`${styles.headerCell} ${styles.fieldColumn}`}>
              {t("apiReference.tables.field")}
            </th>
            <th className={`${styles.headerCell} ${styles.typeColumn}`}>
              {t("apiReference.tables.type")}
            </th>
            <th className={styles.headerCell}>
              {t("apiReference.tables.description")}
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={`${field.name}-${index}`}>
              <td className={`${styles.bodyCell} ${styles.fieldColumn}`}>
                <ApiReferenceFieldName name={field.name} />
              </td>
              <td className={`${styles.bodyCell} ${styles.typeColumn}`}>
                {field.type}
              </td>
              <td className={`${styles.bodyCell} ${styles.descriptionCell}`}>
                {renderInline(field.description, {
                  code: styles.descriptionCode,
                  link: styles.inlineLink
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
