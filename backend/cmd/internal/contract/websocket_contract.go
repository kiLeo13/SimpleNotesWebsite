package contract

type EventType string

const (
	EventPing EventType = "ping"

	EventConnectionKill EventType = "CONNECTION_KILL"
	EventSessionExpired EventType = "SESSION_EXPIRED"
	EventResyncRequired EventType = "RESYNC_REQUIRED"
	EventAck            EventType = "ACK"

	EventNoteCreated EventType = "NOTE_CREATED"
	EventNoteUpdated EventType = "NOTE_UPDATED"
	EventNoteDeleted EventType = "NOTE_DELETED"

	EventUserCreated EventType = "USER_CREATED"
	EventUserUpdated EventType = "USER_UPDATED"
	EventUserDeleted EventType = "USER_DELETED"

	EventPresenceUpdated EventType = "PRESENCE_UPDATED"
)

type ConnectionKillCode string
type ResyncReason string

const (
	CodeSuspendedAccount ConnectionKillCode = "SUSPENDED_ACCOUNT"
	CodeIdleTimeout      ConnectionKillCode = "IDLE_TIMEOUT"
	CodeDeleted          ConnectionKillCode = "DELETED"
	CodeLogout           ConnectionKillCode = "LOGOUT"

	ReasonCursorTooOld ResyncReason = "CURSOR_TOO_OLD"
	ReasonScopeChanged ResyncReason = "SCOPE_CHANGED"
)

// IncomingSocketMessage is used for messages we receive from the users.
type IncomingSocketMessage struct {
	Type EventType `json:"type"`
}

// OutgoingSocketMessage is what we send to the Client
type OutgoingSocketMessage struct {
	Type    EventType `json:"type"`
	Data    any       `json:"data,omitempty"`
	EventID string    `json:"event_id,omitempty"`
}
