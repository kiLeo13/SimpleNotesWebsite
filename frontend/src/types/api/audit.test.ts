import { describe, expect, it } from "vitest"

import { auditLogListResponseSchema } from "./audit"

describe("audit API schemas", () => {
  it("accepts department audit events from the backend contract", () => {
    const parsed = auditLogListResponseSchema.parse({
      entries: [
        {
          id: "9001",
          actor_user_id: "7",
          action_type: "DEPARTMENT_MEMBERSHIP_ADD",
          subject_type: "DEPARTMENT",
          subject_id: "42",
          source: "HTTP_API",
          occurred_at: "2026-04-19T00:00:00Z",
          changes: [
            {
              field_name: "user_id",
              new_value: "88",
              value_type: "STRING"
            }
          ]
        }
      ],
      next_before_id: "9000"
    })

    expect(parsed).toEqual({
      entries: [
        {
          id: "9001",
          actorUserId: "7",
          actionType: "DEPARTMENT_MEMBERSHIP_ADD",
          subjectType: "DEPARTMENT",
          subjectId: "42",
          source: "HTTP_API",
          occurredAt: "2026-04-19T00:00:00Z",
          changes: [
            {
              fieldName: "user_id",
              oldValue: undefined,
              newValue: "88",
              valueType: "STRING"
            }
          ]
        }
      ],
      nextBeforeId: "9000"
    })
  })
})
