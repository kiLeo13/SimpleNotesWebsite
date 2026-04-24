package handler

import (
	"encoding/json"
	"net/http"
	"zenkeep/cmd/internal/contract"
	"zenkeep/cmd/internal/infrastructure/aws/websocket"
	"zenkeep/cmd/internal/utils"
	"zenkeep/cmd/internal/utils/apierror"

	"github.com/labstack/echo/v4"
)

type WebSocketService interface {
	RegisterConnection(userID int, sessionID string, connID string, exp int64) apierror.ErrorResponse
	RemoveConnection(connectionID string)
	HandleMessage(msg *contract.IncomingSocketMessage, connID string)
}

type DefaultWSRoute struct {
	WSService WebSocketService
}

func NewWSDefault(wsService WebSocketService) *DefaultWSRoute {
	return &DefaultWSRoute{WSService: wsService}
}

func (h *DefaultWSRoute) HandleConnect(c echo.Context) error {
	user, cerr := utils.GetUserFromContext(c)
	if cerr != nil {
		return c.JSON(cerr.Code(), cerr)
	}

	connID := c.Request().Header.Get(websocket.HeaderConnectionID)
	if connID == "" {
		return c.JSON(http.StatusBadRequest, apierror.NewMissingParamError("connectionId"))
	}

	sessionID := c.Request().Header.Get(websocket.HeaderSessionID)
	if sessionID == "" {
		return c.JSON(http.StatusBadRequest, apierror.NewMissingParamError("sessionId"))
	}

	token, err := utils.ParseTokenDataCtx(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, apierror.InvalidAuthTokenError)
	}

	if apierr := h.WSService.RegisterConnection(user.ID, sessionID, connID, token.Exp); apierr != nil {
		return c.JSON(apierr.Code(), apierr)
	}
	return c.NoContent(http.StatusOK)
}

func (h *DefaultWSRoute) HandleDisconnect(c echo.Context) error {
	connID := c.Request().Header.Get(websocket.HeaderConnectionID)
	if connID != "" {
		h.WSService.RemoveConnection(connID)
	}
	return c.NoContent(http.StatusOK)
}

func (h *DefaultWSRoute) HandleMessage(c echo.Context) error {
	connID := c.Request().Header.Get(websocket.HeaderConnectionID)
	var msg contract.IncomingSocketMessage
	if err := json.NewDecoder(c.Request().Body).Decode(&msg); err != nil {
		return c.JSON(http.StatusBadRequest, apierror.MalformedBodyError)
	}

	h.WSService.HandleMessage(&msg, connID)
	return c.NoContent(http.StatusOK)
}
