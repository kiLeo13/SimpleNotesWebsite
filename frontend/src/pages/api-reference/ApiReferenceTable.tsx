import type { ApiField } from "./apiReferenceDocs"
import { useTranslation } from "react-i18next"

import { renderInline } from "./ApiReferenceInline"

import styles from "./ApiReferenceTable.module.css"

export function FieldTable({
  fields,
  title
}: {
  fields: ApiField[]
  title: string
}) {
  const { t } = useTranslation()

  return (
    <div className={styles.tableWrap}>
      <table>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>{t("apiReference.tables.field")}</th>
            <th>{t("apiReference.tables.type")}</th>
            <th>{t("apiReference.tables.description")}</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={`${field.name}-${index}`}>
              <td>
                <FieldName name={field.name} />
              </td>
              <td>{field.type}</td>
              <td className={styles.descriptionCell}>
                {renderInline(field.description)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FieldName({ name }: { name: string }) {
  const optional = name.endsWith("?")
  const displayName = optional ? name.slice(0, -1) : name

  return (
    <span className={styles.fieldName}>
      <code>{displayName}</code>
      {optional ? <span className={styles.optionalMark}>?</span> : null}
    </span>
  )
}
