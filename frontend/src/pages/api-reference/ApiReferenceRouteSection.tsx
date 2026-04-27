import clsx from "clsx"
import { useTranslation } from "react-i18next"

import { inRange } from "@/utils/utils"
import type { ApiRoute, HttpMethod } from "./apiReferenceDocs"
import { ApiReferenceCallouts } from "./ApiReferenceCallout"
import { ApiReferenceRouteFields } from "./ApiReferenceRouteFields"
import { renderInline } from "./ApiReferenceInline"
import { routeSectionId } from "./apiReferenceIds"

import styles from "./ApiReferenceRouteSection.module.css"

type ApiReferenceRouteSectionProps = {
  resourceId: string
  route: ApiRoute
}

export function ApiReferenceRouteSection({
  resourceId,
  route
}: ApiReferenceRouteSectionProps) {
  const { t } = useTranslation()

  return (
    <article
      id={routeSectionId(resourceId, route.id)}
      className={styles.routeSection}
    >
      <div className={styles.routeHeading}>
        <h4 className={styles.routeTitle}>{route.title}</h4>
        <span className={styles.routeAuth}>{route.auth}</span>
      </div>

      <div className={styles.endpointLine}>
        <span className={clsx(styles.method, methodClass(route.method))}>
          {route.method}
        </span>
        <code className={styles.endpointPath}>{route.path}</code>
      </div>

      {route.description.map((description, index) => (
        <p key={index} className={styles.description}>
          {renderInline(description, {
            code: styles.inlineCode,
            link: styles.inlineLink
          })}
        </p>
      ))}

      <ApiReferenceCallouts callouts={route.callouts} />
      <ApiReferenceRouteFields
        title={t("apiReference.routeFields.pathParameters")}
        fields={route.pathParams}
      />
      <ApiReferenceRouteFields
        title={t("apiReference.routeFields.queryParameters")}
        fields={route.queryParams}
      />
      <ApiReferenceRouteFields
        title={t("apiReference.routeFields.requestBody")}
        fields={route.requestBody}
      />

      <div className={styles.responseList}>
        <h5 className={styles.responsesTitle}>
          {t("apiReference.sections.responses")}
        </h5>
        {route.responses.map((response) => (
          <div
            key={`${route.id}-${response.status}`}
            className={styles.responseRow}
          >
            <code
              className={clsx(
                styles.statusCode,
                getStatusCodeClass(response.status)
              )}
            >
              {response.status}
            </code>
            <span>
              {renderInline(response.description, {
                code: styles.inlineCode,
                link: styles.inlineLink
              })}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}

function getStatusCodeClass(status: number): string {
  if (inRange(status, 0, 299)) return styles.statusSuccess
  if (inRange(status, 300, 399)) return styles.statusRedirect
  return styles.statusError
}

function methodClass(method: HttpMethod): string {
  switch (method) {
    case "GET":
      return styles.methodGet
    case "PUT":
      return styles.methodPut
    case "POST":
      return styles.methodPost
    case "PATCH":
      return styles.methodPatch
    case "DELETE":
      return styles.methodDelete
  }
}
