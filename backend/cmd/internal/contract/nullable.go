package contract

import (
	"bytes"
	"encoding/json"
)

type NullableString struct {
	Set   bool
	Value *string
}

func (n *NullableString) UnmarshalJSON(data []byte) error {
	n.Set = true
	if bytes.Equal(bytes.TrimSpace(data), []byte("null")) {
		n.Value = nil
		return nil
	}

	var value string
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	n.Value = &value
	return nil
}
