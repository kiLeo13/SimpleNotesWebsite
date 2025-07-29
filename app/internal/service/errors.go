package service

import (
	"fmt"
)

var (
	ErrorMalformedJSON  = NewError(400, "Malformed JSON body")
	ErrorInternalServer = NewError(500, "Internal server error")

	ErrorNotFound = NewError(404, "Resource not found")
)

func NewError(status int, msg string, args ...any) *APIError {
	if len(args) > 0 {
		msg = fmt.Sprintf(msg, args...)
	}
	return &APIError{Status: status, Message: msg}
}

type APIError struct {
	Message string `json:"message"`
	Status  int    `json:"status"`
}
