// general.d.ts
type MessageLevel = "success" | "info" | "warn" | "error"

type AuthType = 'id' | 'access' | 'none'

interface ApplicationRequest {
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  authType: AuthType
  headers?: Record<string, string>
  body?: any
}