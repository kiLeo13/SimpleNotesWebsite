import type { ApiDeclaration } from "../docs/apiReferenceDocs"

import { ApiReferenceFieldTable } from "./ApiReferenceFieldTable"
import { renderInline } from "./ApiReferenceInline"
import { declarationSectionId } from "../docs/apiReferenceIds"

import styles from "./ApiReferenceDeclarationSection.module.css"

type ApiReferenceDeclarationSectionProps = {
  declaration: ApiDeclaration
  resourceId: string
}

export function ApiReferenceDeclarationSection({
  declaration,
  resourceId
}: ApiReferenceDeclarationSectionProps) {
  return (
    <article
      id={declarationSectionId(resourceId, declaration.id)}
      className={styles.declarationSection}
    >
      <h4 className={styles.declarationTitle}>{declaration.title}</h4>
      {declaration.description ? (
        <p className={styles.declarationDescription}>
          {renderInline(declaration.description, {
            code: styles.inlineCode,
            link: styles.inlineLink
          })}
        </p>
      ) : null}
      <ApiReferenceFieldTable
        title={declaration.title}
        fields={declaration.fields}
      />
    </article>
  )
}
