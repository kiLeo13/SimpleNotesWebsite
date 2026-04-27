import styles from "./ApiReferenceFieldName.module.css"

type ApiReferenceFieldNameProps = {
  name: string
}

export function ApiReferenceFieldName({ name }: ApiReferenceFieldNameProps) {
  const optional = name.endsWith("?")
  const displayName = optional ? name.slice(0, -1) : name

  return (
    <span className={styles.fieldName}>
      <code className={styles.fieldCode}>{displayName}</code>
      {optional ? <span className={styles.optionalMark}>?</span> : null}
    </span>
  )
}
