package events

import "zenkeep/cmd/internal/contract"

type SocketEvent interface {
	GetType() contract.EventType
}

type Ack struct{}

func (*Ack) GetType() contract.EventType {
	return contract.EventAck
}

type ResyncRequired struct {
	Reason        contract.ResyncReason `json:"reason"`
	LatestEventID *string               `json:"latest_event_id,omitempty"`
}

func (*ResyncRequired) GetType() contract.EventType {
	return contract.EventResyncRequired
}

type ConnectionKill struct {
	Code   contract.ConnectionKillCode `json:"code"`
	Reason *string                     `json:"reason,omitempty"`
}

func (e *ConnectionKill) GetType() contract.EventType {
	return contract.EventConnectionKill
}

type NoteCreated struct {
	*contract.NoteResponse
}

func (e *NoteCreated) GetType() contract.EventType {
	return contract.EventNoteCreated
}

type NoteUpdated struct {
	*contract.NoteResponse
}

func (e *NoteUpdated) GetType() contract.EventType {
	return contract.EventNoteUpdated
}

type NoteDeleted struct {
	NoteID string `json:"id"`
}

func (e *NoteDeleted) GetType() contract.EventType {
	return contract.EventNoteDeleted
}

type DepartmentCreated struct {
	*contract.DepartmentResponse
}

func (e *DepartmentCreated) GetType() contract.EventType {
	return contract.EventDepartmentCreated
}

type DepartmentUpdated struct {
	*contract.DepartmentResponse
}

func (e *DepartmentUpdated) GetType() contract.EventType {
	return contract.EventDepartmentUpdated
}

type DepartmentDeleted struct {
	DepartmentID string `json:"id"`
}

func (e *DepartmentDeleted) GetType() contract.EventType {
	return contract.EventDepartmentDeleted
}

type UserCreated struct {
	*contract.UserResponse
}

func (e *UserCreated) GetType() contract.EventType {
	return contract.EventUserCreated
}

type UserUpdated struct {
	*contract.UserResponse
}

func (e *UserUpdated) GetType() contract.EventType {
	return contract.EventUserUpdated
}

type UserDeleted struct {
	UserID string `json:"id"`
}

func (e *UserDeleted) GetType() contract.EventType {
	return contract.EventUserDeleted
}

type PresenceUpdated struct {
	UserID   string                `json:"id"`
	Presence contract.UserPresence `json:"presence"`
}

func (p *PresenceUpdated) GetType() contract.EventType {
	return contract.EventPresenceUpdated
}
