package idgen

import (
	"fmt"
	"hash/crc32"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/sony/sonyflake/v2"
)

const (
	MachineIDEnv       = "SONYFLAKE_MACHINE_ID"
	LegacyMachineIDEnv = "AUDIT_MACHINE_ID"
)

var StartTime = time.Date(2025, time.January, 1, 0, 0, 0, 0, time.UTC)

type Generator interface {
	NextID() (int64, error)
}

type SonyflakeGenerator struct {
	flake *sonyflake.Sonyflake
}

func NewSonyflakeGenerator() (Generator, error) {
	flake, err := sonyflake.New(sonyflake.Settings{
		StartTime: StartTime,
		MachineID: ResolveMachineID,
	})
	if err != nil {
		return nil, err
	}
	return &SonyflakeGenerator{flake: flake}, nil
}

func (s *SonyflakeGenerator) NextID() (int64, error) {
	return s.flake.NextID()
}

func ResolveMachineID() (int, error) {
	if machineID, ok, err := parseMachineIDEnv(MachineIDEnv); ok || err != nil {
		return machineID, err
	}
	if machineID, ok, err := parseMachineIDEnv(LegacyMachineIDEnv); ok || err != nil {
		return machineID, err
	}

	host, err := os.Hostname()
	if err == nil && host != "" {
		return int(crc32.ChecksumIEEE([]byte(host)) & 0xffff), nil
	}
	return os.Getpid() & 0xffff, nil
}

func Format(id int64) string {
	return strconv.FormatInt(id, 10)
}

func Parse(raw string) (int64, error) {
	id, err := strconv.ParseInt(strings.TrimSpace(raw), 10, 64)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func parseMachineIDEnv(name string) (int, bool, error) {
	raw := strings.TrimSpace(os.Getenv(name))
	if raw == "" {
		return 0, false, nil
	}

	machineID, err := strconv.ParseUint(raw, 10, 16)
	if err != nil {
		return 0, true, fmt.Errorf("parse %s: %w", name, err)
	}
	return int(machineID), true, nil
}
