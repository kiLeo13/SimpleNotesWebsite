const JSON_LITERAL_VALUES = new Set(["true", "false", "null"])

export function parseRouterSearch(searchStr: string): Record<string, unknown> {
  const searchParams = new URLSearchParams(stripSearchPrefix(searchStr))
  const result: Record<string, unknown> = {}

  for (const [key, value] of searchParams.entries()) {
    const parsedValue = parseSearchParamValue(value)
    const previousValue = result[key]

    if (previousValue === undefined) {
      result[key] = parsedValue
    } else if (Array.isArray(previousValue)) {
      previousValue.push(parsedValue)
    } else {
      result[key] = [previousValue, parsedValue]
    }
  }

  return result
}

export function stringifyRouterSearch(search: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(search)) {
    appendSearchParam(searchParams, key, value)
  }

  const encodedSearch = searchParams.toString()
  return encodedSearch ? `?${encodedSearch}` : ""
}

function appendSearchParam(
  searchParams: URLSearchParams,
  key: string,
  value: unknown
): void {
  if (value === undefined) {
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item) => appendSearchParam(searchParams, key, item))
    return
  }

  searchParams.append(key, stringifySearchParamValue(value))
}

function stringifySearchParamValue(value: unknown): string {
  if (value === null || typeof value === "object") {
    return JSON.stringify(value)
  }

  if (typeof value === "string" && shouldSerializeAsJsonString(value)) {
    return JSON.stringify(value)
  }

  return String(value)
}

export function parseSearchParamValue(value: string): unknown {
  const trimmedValue = value.trim()

  if (!shouldParseAsJson(trimmedValue)) {
    return value
  }

  try {
    return JSON.parse(trimmedValue)
  } catch {
    return value
  }
}

function shouldSerializeAsJsonString(value: string): boolean {
  return shouldParseAsJson(value)
}

function shouldParseAsJson(value: string): boolean {
  if (!value) {
    return false
  }

  const firstChar = value[0]
  return (
    firstChar === "{" ||
    firstChar === "[" ||
    firstChar === '"' ||
    JSON_LITERAL_VALUES.has(value)
  )
}

function stripSearchPrefix(searchStr: string): string {
  return searchStr.startsWith("?") ? searchStr.slice(1) : searchStr
}
