import { NOTE_MAX_SIZE_BYTES_RAW } from "@/services/noteService"
import { getPrettySize } from "@/utils/utils"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type InlineTextPart =
  | string
  | {
      label: string
      href?: string
      resourceId?: string
      sectionId?: string
    }

export type CalloutTone = "info" | "warning" | "danger"

export type ApiCallout = {
  tone: CalloutTone
  text: InlineTextPart[]
}

export type ApiField = {
  name: string
  type: string
  description: InlineTextPart[]
}

export type ApiExample = {
  label?: string
  language?: string
  code: string
}

export type ApiTopic = {
  id: string
  title: string
  description?: InlineTextPart[]
  callouts?: ApiCallout[]
  fields?: ApiField[]
  examples?: ApiExample[]
}

export type ApiRoute = {
  id: string
  method: HttpMethod
  path: string
  title: string
  auth: "Public" | "Bearer JWT"
  description: InlineTextPart[][]
  callouts?: ApiCallout[]
  pathParams?: ApiField[]
  queryParams?: ApiField[]
  requestBody?: ApiField[]
  responses: {
    status: number
    description: InlineTextPart[]
  }[]
}

export type ApiResource = {
  id: string
  name: string
  navLabel?: string
  objectName: string
  description: InlineTextPart[]
  callouts?: ApiCallout[]
  fields: ApiField[]
  routes: ApiRoute[]
}

const apiUrl = import.meta.env.VITE_API_BASE_URL
export const apiBaseUrl = apiUrl.slice(0, apiUrl.lastIndexOf("/"))

export const apiTopics: ApiTopic[] = [
  {
    id: "base-url",
    title: "Base URL",
    examples: [
      {
        code: apiBaseUrl + "/v{version}",
        language: "curl"
      }
    ]
  },
  {
    id: "api-versioning",
    title: "API Versioning",
    description: [
      "As of now, ZenKeep has only one version, at ",
      { label: "/v1" },
      " stage. This way, you should invoke all endpoints with the following syntax: ",
      { label: "/v1/{endpoint}" },
      "."
    ]
  },
  {
    id: "authorization",
    title: "Authorization",
    description: [
      "Almost all routes in this application require authentication via an ",
      { label: "Authorization" },
      " header containing a bearer JWT. Public routes will contain a disclaimer below it."
    ],
    callouts: [
      {
        tone: "info",
        text: [
          "Requests that do not provide a valid bearer token will fail with a ",
          { label: "401 Unauthorized" },
          "."
        ]
      }
    ],
    examples: [
      {
        label: "Authenticated request",
        language: "http",
        code: "Authorization: Bearer <id_token>"
      }
    ]
  },
  {
    id: "serialization",
    title: "ID Serialization",
    description: [
      "Internal platform IDs are ",
      { label: "Sonyflake", href: "https://github.com/sony/sonyflake" },
      " ",
      { label: "int64" },
      " values, but the API always returns them as decimal strings to avoid integer overflow or precision loss in clients and languages with smaller integer ranges. Clients should treat every ",
      { label: "id" },
      ", ",
      { label: "*_id" },
      ", ",
      { label: "event_id" },
      ", and cursor field as a string."
    ],
    fields: [
      {
        name: "id",
        type: "string",
        description: [
          "Decimal string representation of a backend int64 ID. Do not parse it as a JavaScript number."
        ]
      },
      {
        name: "ID bit layout",
        type: "int64",
        description: [
          "Sonyflake layout: 39 timestamp bits, 8 sequence bits, and 16 machine ID bits. The encoded value is ",
          { label: "(timestamp << 24) | (sequence << 16) | machine_id" },
          "."
        ]
      },
      {
        name: "timestamp",
        type: "39-bit offset",
        description: [
          "Elapsed 10 millisecond units since ",
          { label: "2025-01-01T00:00:00Z" },
          ". To resolve the approximate creation time, extract the timestamp bits, multiply by 10 milliseconds, and add the result to that UTC base date."
        ]
      },
      {
        name: "machine_id",
        type: "16-bit integer",
        description: [
          "Resolved from SONYFLAKE_MACHINE_ID when configured, otherwise the legacy AUDIT_MACHINE_ID, otherwise a stable host-derived fallback."
        ]
      },
      {
        name: "created_at / updated_at",
        type: "string",
        description: ["ISO 8601 date-time string."]
      }
    ],
    examples: [
      {
        label: "Timestamp from ID - Python Example",
        language: "python",
        code: `from datetime import datetime, timedelta, timezone

raw_id = "123456789012345678"
timestamp_units = int(raw_id) >> 24 # high 39 bits
created_at_utc = datetime(2025, 1, 1, tzinfo=timezone.utc) + timedelta(
    milliseconds=timestamp_units * 10 # Sonyflake uses 10ms units
)

print(created_at_utc.isoformat()) # 2025-03-26T14:33:12.340000+00:00`
      }
    ]
  },
  {
    id: "errors",
    title: "Error Messages",
    description: [
      "Errors return either a simple message object or a structured validation object. Clients should support both shapes."
    ],
    fields: [
      {
        name: "message",
        type: "string",
        description: ["Human-readable API error message."]
      },
      {
        name: "errors",
        type: "Record<string, string[]>",
        description: ["Validation errors grouped by request field."]
      }
    ],
    examples: [
      {
        label: "Validation error",
        language: "json",
        code: `{
  "errors": {
    "email": ["Value must be a valid email address"]
  }
}`
      }
    ]
  },
  {
    id: "pagination",
    title: "Pagination",
    description: [
      "Audit logs use cursor pagination. Send ",
      { label: "limit" },
      " and optionally ",
      { label: "before_id" },
      ". The next cursor is returned as ",
      { label: "next_before_id" },
      "."
    ],
    fields: [
      {
        name: "limit",
        type: "integer",
        description: ["Maximum number of entries to return."]
      },
      {
        name: "before_id?",
        type: "string",
        description: ["Return entries older than this audit log ID."]
      },
      {
        name: "next_before_id",
        type: "string?",
        description: ["Cursor for the next page when more results exist."]
      }
    ]
  },
  {
    id: "gateway",
    title: "Gateway (WebSocket) API",
    description: [
      "Realtime messages are typed envelopes. Clients connect with a stable ",
      { label: "session_id" },
      " and the last applied ",
      { label: "last_event_id" },
      " so missed events can be replayed."
    ],
    callouts: [
      {
        tone: "info",
        text: [
          "Hidden tabs only send pings while visible. Reconnect behavior relies on session resumption and ordered replay."
        ]
      }
    ]
  }
]

export const apiResources: ApiResource[] = [
  {
    id: "user",
    name: "User",
    objectName: "User Object",
    description: [
      "Represents a ZenKeep user account, permission bitmask, verification state, and current presence."
    ],
    fields: [
      { name: "id", type: "string", description: ["User platform ID."] },
      { name: "username", type: "string", description: ["Display name."] },
      {
        name: "permissions",
        type: "integer",
        description: ["Permission bitmask."]
      },
      {
        name: "presence",
        type: "ONLINE | OFFLINE",
        description: ["Current realtime presence."]
      },
      {
        name: "is_verified?",
        type: "boolean",
        description: ["Returned when verification state is included."]
      },
      {
        name: "suspended?",
        type: "boolean",
        description: ["Returned when suspension state is included."]
      },
      { name: "created_at", type: "string", description: ["Creation time."] },
      { name: "updated_at", type: "string", description: ["Last update time."] }
    ],
    routes: [
      {
        id: "login-user",
        method: "POST",
        path: "/users/login",
        title: "Login",
        auth: "Public",
        description: [["Authenticates a user with email and password. Returns a token pair."]],
        requestBody: [
          {
            name: "email",
            type: "string",
            description: ["User email address."]
          },
          { name: "password", type: "string", description: ["User password."] }
        ],
        responses: [
          {
            status: 200,
            description: ["Returns access_token and id_token."]
          },
          {
            status: 400,
            description: ["Credentials mismatch or malformed body."]
          }
        ]
      },
      {
        id: "create-user",
        method: "POST",
        path: "/users",
        title: "Create User",
        auth: "Public",
        description: [[
          "Creates a user account and starts the confirmation flow."
        ]],
        requestBody: [
          {
            name: "username",
            type: "string",
            description: ["Display name, 2 to 80 characters."]
          },
          {
            name: "email",
            type: "string",
            description: ["Valid email address."]
          },
          {
            name: "password",
            type: "string",
            description: [
              "Password meeting Cognito and backend validator rules."
            ]
          }
        ],
        responses: [
          { status: 201, description: ["User was created."] },
          {
            status: 400,
            description: ["Validation or identity provider error."]
          }
        ]
      },
      {
        id: "list-users",
        method: "GET",
        path: "/users",
        title: "List Users",
        auth: "Bearer JWT",
        description: [[
          "Lists users visible to the authenticated requester. Returns an array of ",
          { label: "user", resourceId: "user" },
          " objects."
        ]],
        responses: [
          {
            status: 200,
            description: ["Returns users wrapped in a users property."]
          },
          { status: 401, description: ["Missing or invalid bearer token."] }
        ]
      },
      {
        id: "get-user",
        method: "GET",
        path: "/users/{id}",
        title: "Get User",
        auth: "Bearer JWT",
        description: [[
          "Fetches one user by platform ID. Returns a ",
          { label: "user", resourceId: "user" },
          " object."
        ]],
        pathParams: [
          { name: "id", type: "string", description: ["User platform ID."] }
        ],
        responses: [
          { status: 200, description: ["User found."] },
          {
            status: 404,
            description: ["User was not found or is not visible."]
          }
        ]
      },
      {
        id: "update-user",
        method: "PATCH",
        path: "/users/{id}",
        title: "Update User",
        auth: "Bearer JWT",
        description: [[
          "Updates mutable user fields permitted by the requester. Returns the updated ",
          { label: "User", resourceId: "user" },
          " object."
        ]],
        callouts: [
          {
            tone: "warning",
            text: [
              "Permission and suspension changes require elevated permissions."
            ]
          }
        ],
        pathParams: [
          {
            name: "id",
            type: "string",
            description: ["Target user platform ID."]
          }
        ],
        requestBody: [
          {
            name: "username?",
            type: "string",
            description: ["New display name."]
          },
          {
            name: "permissions?",
            type: "integer",
            description: ["Permission bitmask."]
          },
          {
            name: "suspended?",
            type: "boolean",
            description: ["Suspension state."]
          }
        ],
        responses: [
          { status: 200, description: ["User updated."] },
          { status: 403, description: ["Requester lacks permission."] }
        ]
      },
      {
        id: "delete-user",
        method: "DELETE",
        path: "/users/{id}",
        title: "Delete User",
        auth: "Bearer JWT",
        description: [["Deletes a user account when policy allows it."]],
        pathParams: [
          {
            name: "id",
            type: "string",
            description: ["Target user platform ID."]
          }
        ],
        responses: [
          { status: 200, description: ["User deleted."] },
          { status: 403, description: ["Requester cannot delete this user."] }
        ]
      }
    ]
  },
  {
    id: "note",
    name: "Note",
    objectName: "Note Object",
    description: [
      "Represents a Markdown, flowchart, or reference note visible to the requester."
    ],
    fields: [
      { name: "id", type: "string", description: ["Note platform ID."] },
      { name: "name", type: "string", description: ["Note name."] },
      {
        name: "content?",
        type: "string",
        description: [
          "Text content or reference file identifier, depending on note_type."
        ]
      },
      { name: "tags", type: "string[]", description: ["Note tags."] },
      {
        name: "visibility",
        type: "PUBLIC | PRIVATE",
        description: ["Visibility policy."]
      },
      {
        name: "note_type",
        type: "MARKDOWN | FLOWCHART | REFERENCE",
        description: ["Rendering and storage mode."]
      },
      {
        name: "content_size",
        type: "integer",
        description: ["Content size in bytes."]
      },
      {
        name: "created_by_id",
        type: "string",
        description: ["Creator user ID."]
      },
      { name: "created_at", type: "string", description: ["Creation time."] },
      { name: "updated_at", type: "string", description: ["Last update time."] }
    ],
    routes: [
      {
        id: "list-notes",
        method: "GET",
        path: "/notes",
        title: "List Notes",
        auth: "Bearer JWT",
        description: [[
          "Lists notes visible to the authenticated user. Returns an array of ",
          { label: "note", resourceId: "note" },
          " objects."
        ]],
        responses: [
          {
            status: 200,
            description: [
              "Returns an array of notes in a ",
              { label: "notes" },
              " property."
            ]
          }
        ]
      },
      {
        id: "create-note",
        method: "POST",
        path: "/notes",
        title: "Create Note",
        auth: "Bearer JWT",
        description: [[
          "Creates a new note. Returns the created ",
          { label: "note", resourceId: "note" },
          " object. Requires ",
          { label: "Create Notes" },
          " permission."
        ]],
        callouts: [
          {
            tone: "info",
            text: [
              "File uploads must use ",
              { label: "multipart/form-data"},
              " header and pass all attributes through ",
              { label: "json_payload" },
              " parameter."
            ]
          },
          {
            tone: "warning",
            text: [
              "All notes are limited to ",
              { label: `${getPrettySize(NOTE_MAX_SIZE_BYTES_RAW)}` },
              ". That is, text notes don't have a character limit as of now."
            ]
          }
        ],
        requestBody: [
          {
            name: "name",
            type: "string",
            description: ["Note name, 2 to 80 characters."]
          },
          {
            name: "content?",
            type: "string",
            description: ["Required for MARKDOWN and FLOWCHART notes."]
          },
          {
            name: "note_type?",
            type: "MARKDOWN | FLOWCHART",
            description: ["Required for JSON text notes."]
          },
          {
            name: "json_payload?",
            type: "string",
            description: [
              "Required multipart metadata for uploaded reference notes."
            ]
          },
          {
            name: "content?",
            type: "file",
            description: ["Required multipart file part for reference notes."]
          }
        ],
        responses: [
          { status: 201, description: ["Note created."] },
          { status: 415, description: ["Unsupported content type."] }
        ]
      },
      {
        id: "get-note",
        method: "GET",
        path: "/notes/{id}",
        title: "Get Note",
        auth: "Bearer JWT",
        description: [[
          "Fetches one note by platform ID. Returns a full ",
          { label: "note", resourceId: "note" },
          " object."
        ]],
        pathParams: [
          { name: "id", type: "string", description: ["Note platform ID."] }
        ],
        responses: [
          { status: 200, description: ["Note found."] },
          {
            status: 404,
            description: ["Note was not found or is not visible."]
          }
        ]
      },
      {
        id: "update-note",
        method: "PATCH",
        path: "/notes/{id}",
        title: "Update Note",
        auth: "Bearer JWT",
        description: [
          [
          "Updates note metadata. Returns the updated ",
          { label: "Note", resourceId: "note" },
          " object."
          ],
          [
            "This endpoint usually fires a ",
            { label: "Note Updated" },
            " event. However, if the visibility property changes to ",
            { label: "PRIVATE" },
            ", users without permission to see it will receive a ",
            { label: "Note Deleted" },
            " event. If the visibility property changes to ",
            { label: "PUBLIC" },
            ", users that priorly couldn't see it, will receive a ",
            { label: "Note Created" },
            " event."
          ],
          [
            "Note content cannot be updated."
          ]
        ],
        requestBody: [
          { name: "name?", type: "string", description: ["Note name."] },
          {
            name: "visibility?",
            type: "PUBLIC | PRIVATE",
            description: ["Visibility change."]
          },
          {
            name: "tags?",
            type: "string array",
            description: ["Replacement tag list."]
          }
        ],
        responses: [
          { status: 200, description: ["Note updated."] },
          { status: 403, description: ["Requester cannot edit the note."] }
        ]
      },
      {
        id: "delete-note",
        method: "DELETE",
        path: "/notes/{id}",
        title: "Delete Note",
        auth: "Bearer JWT",
        description: [[
          "Deletes a note by ID. Returns a 204 empty response on success."
        ]],
        responses: [
          { status: 204, description: ["Note deleted."] },
          { status: 404, description: ["Note not found or user does not have permission to see it."] },
          { status: 403, description: ["Requester cannot delete the note."] }
        ]
      }
    ]
  },
  {
    id: "audit-logs",
    name: "Audit Log",
    navLabel: "AuditLogs",
    objectName: "Audit Log Object",
    description: [
      "Represents an immutable audit event with zero or more field-level changes."
    ],
    fields: [
      { name: "id", type: "string", description: ["Audit event ID."] },
      {
        name: "actor_user_id",
        type: "string?",
        description: ["User that performed the action, when available."]
      },
      {
        name: "action_type",
        type: "string",
        description: ["Action discriminator."]
      },
      {
        name: "subject_type",
        type: "NOTE | USER | COMPANY",
        description: ["Audited resource kind."]
      },
      {
        name: "subject_id",
        type: "string",
        description: ["Audited resource ID or business identifier."]
      },
      { name: "source", type: "string", description: ["Event source."] },
      {
        name: "occurred_at",
        type: "string",
        description: ["Event timestamp."]
      },
      {
        name: "changes",
        type: "AuditLogChange[]",
        description: ["Field-level change list."]
      }
    ],
    routes: [
      {
        id: "list-audit-logs",
        method: "GET",
        path: "/audit-logs",
        title: "List Audit Logs",
        auth: "Bearer JWT",
        description: [[
          "Lists audit events newest first with cursor pagination. Returns an array of ",
          { label: "audit log", resourceId: "audit-logs" },
          " objects and an optional ",
          { label: "next_before_id" },
          " cursor."
        ]],
        queryParams: [
          {
            name: "limit?",
            type: "integer",
            description: ["Maximum page size."]
          },
          {
            name: "before_id?",
            type: "string",
            description: ["Cursor for older entries."]
          },
          {
            name: "actor_user_id?",
            type: "string",
            description: ["Filter by actor user ID."]
          },
          {
            name: "subject_type?",
            type: "NOTE | USER | COMPANY",
            description: ["Filter by audited subject type."]
          },
          {
            name: "action_type?",
            type: "string",
            description: ["Filter by action type."]
          }
        ],
        responses: [
          { status: 200, description: ["Audit entries returned."] },
          { status: 403, description: ["Requester cannot read audit logs."] }
        ]
      }
    ]
  },
  {
    id: "company",
    name: "Company",
    objectName: "Company Object",
    description: [
      "Represents a CNPJ lookup response from cache or the lookup provider."
    ],
    fields: [
      { name: "cnpj", type: "string", description: ["Company CNPJ."] },
      {
        name: "legal_name",
        type: "string",
        description: ["Registered legal name."]
      },
      {
        name: "trade_name?",
        type: "string",
        description: ["Trade name, when present."]
      },
      {
        name: "registration",
        type: "object",
        description: ["Registration status, reason, and date."]
      },
      { name: "address", type: "object", description: ["Registered address."] },
      {
        name: "partners",
        type: "CompanyPartner[]",
        description: ["Known company partners."]
      },
      {
        name: "cached",
        type: "boolean",
        description: ["Whether the response came from local cache."]
      }
    ],
    routes: [
      {
        id: "get-company",
        method: "GET",
        path: "/misc/cnpj/{cnpj}",
        title: "Get Company by CNPJ",
        auth: "Bearer JWT",
        description: [[
          "Looks up a Brazilian company by CNPJ. Returns a ",
          { label: "company", resourceId: "company" },
          " object."
        ]],
        pathParams: [
          {
            name: "cnpj",
            type: "string",
            description: ["Fourteen-digit CNPJ."]
          }
        ],
        responses: [
          {
            status: 200,
            description: ["Company found or returned from cache."]
          },
          { status: 404, description: ["Company was not found."] }
        ]
      }
    ]
  },
  {
    id: "gateway-message",
    name: "Gateway Message",
    objectName: "Gateway Message Object",
    description: [
      "Represents a websocket envelope emitted by the backend gateway pipeline."
    ],
    fields: [
      { name: "type", type: "string", description: ["Event type."] },
      {
        name: "data",
        type: "object",
        description: ["Payload determined by type."]
      },
      {
        name: "event_id?",
        type: "string",
        description: ["Replay cursor for persisted events."]
      }
    ],
    routes: []
  }
]
