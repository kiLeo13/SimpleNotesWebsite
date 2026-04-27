import type {
  ApiField,
  ApiResource,
  ApiRoute,
  ApiTopic,
  HttpMethod
} from "./apiReferenceDocs"

import clsx from "clsx"

import { AppTooltip } from "@/components/ui/AppTooltip"
import { FiLink } from "react-icons/fi"
import { Callouts } from "./ApiReferenceCallout"
import { CodeBlock } from "./ApiReferenceCodeBlock"
import { inRange } from "@/utils/utils"
import { FieldTable } from "./ApiReferenceTable"
import { renderInline } from "./ApiReferenceInline"
import { useTranslation } from "react-i18next"
import {
  resourceSectionId,
  routeSectionId,
  topicSectionId
} from "./apiReferenceIds"

import styles from "./ApiReferenceSections.module.css"

type TopicSectionProps = {
  topic: ApiTopic
}

export function TopicSection({ topic }: TopicSectionProps) {
  const { t } = useTranslation()

  return (
    <article id={topicSectionId(topic.id)} className={styles.docSection}>
      <div className={styles.titleHead}>
        <h3>{topic.title}</h3>
        <a className={styles.linkSection} href={`#${topicSectionId(topic.id)}`}>
          <AppTooltip label={t("tooltips.labels.anchorSection")}>
            <FiLink className={styles.linkIcon} />
          </AppTooltip>
        </a>
      </div>
      {topic.description && <p>{renderInline(topic.description)}</p>}

      <Callouts callouts={topic.callouts} />

      {topic.fields ? (
        <FieldTable
          fields={topic.fields}
          title={t("apiReference.tables.fieldsCaption", {
            title: topic.title
          })}
        />
      ) : null}

      {topic.examples?.map((example) => (
        <CodeBlock key={example.label} example={example} />
      ))}
    </article>
  )
}

export function ResourceSection({ resource }: { resource: ApiResource }) {
  const { t } = useTranslation()

  return (
    <article
      id={resourceSectionId(resource.id)}
      className={styles.resourceSection}
    >
      <div className={styles.resourceHeader}>
        <h2>{resource.name}</h2>
        <p>{renderInline(resource.description)}</p>
      </div>

      <Callouts callouts={resource.callouts} />

      <section className={styles.objectSection}>
        <h3>{resource.objectName}</h3>
        <FieldTable
          fields={resource.fields}
          title={t("apiReference.tables.fieldsCaption", {
            title: resource.objectName
          })}
        />
      </section>

      {resource.routes.length > 0 ? (
        <section
          className={styles.routesBlock}
          aria-label={t("apiReference.sections.resourceRoutesAria", {
            resource: resource.name
          })}
        >
          <h3>{t("apiReference.sections.routes")}</h3>
          {resource.routes.map((route) => (
            <RouteSection
              key={route.id}
              resourceId={resource.id}
              route={route}
            />
          ))}
        </section>
      ) : null}
    </article>
  )
}

type RouteSectionProps = {
  resourceId: string
  route: ApiRoute
}

function RouteSection({ resourceId, route }: RouteSectionProps) {
  const { t } = useTranslation()

  return (
    <article
      id={routeSectionId(resourceId, route.id)}
      className={styles.routeSection}
    >
      <div className={styles.routeHeading}>
        <h4>{route.title}</h4>
        <span>{route.auth}</span>
      </div>

      <div className={styles.endpointLine}>
        <span className={clsx(styles.method, methodClass(route.method))}>
          {route.method}
        </span>
        <code className={styles.endpointPath}>{route.path}</code>
      </div>

      {route.description.map((desc) => (
        <p>{renderInline(desc)}</p>
      ))}

      <Callouts callouts={route.callouts} />
      <RouteFields
        title={t("apiReference.routeFields.pathParameters")}
        fields={route.pathParams}
      />
      <RouteFields
        title={t("apiReference.routeFields.queryParameters")}
        fields={route.queryParams}
      />
      <RouteFields
        title={t("apiReference.routeFields.requestBody")}
        fields={route.requestBody}
      />

      <div className={styles.responseList}>
        <h5>{t("apiReference.sections.responses")}</h5>
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
            <span>{renderInline(response.description)}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function getStatusCodeClass(status: number): string {
  if (inRange(status, 0, 299)) {
    return styles.statusSuccess
  }

  if (inRange(status, 300, 399)) {
    return styles.statusRedirect
  }

  return styles.statusError
}

type RouteFieldsProps = {
  fields?: ApiField[]
  title: string
}

function RouteFields({ fields, title }: RouteFieldsProps) {
  if (!fields?.length) return null
  return <FieldTable fields={fields} title={title} />
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
