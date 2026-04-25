package idgen

import (
	"strconv"
	"testing"
	"time"
)

func TestStartTimeIsJanuaryFirst2025UTC(t *testing.T) {
	want := time.Date(2025, time.January, 1, 0, 0, 0, 0, time.UTC)
	if !StartTime.Equal(want) {
		t.Fatalf("StartTime = %s, want %s", StartTime, want)
	}
}

func TestSonyflakeGeneratorReturnsDecimalInt64IDs(t *testing.T) {
	t.Setenv(MachineIDEnv, "1")
	t.Setenv(LegacyMachineIDEnv, "")

	gen, err := NewSonyflakeGenerator()
	if err != nil {
		t.Fatalf("NewSonyflakeGenerator() error = %v", err)
	}

	first, err := gen.NextID()
	if err != nil {
		t.Fatalf("NextID() first error = %v", err)
	}
	second, err := gen.NextID()
	if err != nil {
		t.Fatalf("NextID() second error = %v", err)
	}

	if first <= 0 || second <= 0 {
		t.Fatalf("generated IDs must be positive: first=%d second=%d", first, second)
	}
	if first == second {
		t.Fatalf("generated duplicate IDs: %d", first)
	}

	formatted := Format(first)
	parsed, err := strconv.ParseInt(formatted, 10, 64)
	if err != nil {
		t.Fatalf("formatted ID is not int64 decimal: %q", formatted)
	}
	if parsed != first {
		t.Fatalf("Format(%d) = %q, parsed %d", first, formatted, parsed)
	}
}

func TestResolveMachineIDPrefersPrimaryEnv(t *testing.T) {
	t.Setenv(MachineIDEnv, "42")
	t.Setenv(LegacyMachineIDEnv, "7")

	got, err := ResolveMachineID()
	if err != nil {
		t.Fatalf("ResolveMachineID() error = %v", err)
	}
	if got != 42 {
		t.Fatalf("ResolveMachineID() = %d, want 42", got)
	}
}
