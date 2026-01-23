package logger

import (
	"log/slog"
	"os"
)

func Setup() *slog.Logger {
	options := &slog.HandlerOptions{
		Level:     slog.LevelInfo,
		AddSource: false,
	}
	// 위성 때처럼 JSONHandler를 써서 나중에 로그 수집이 편하게 합니다.
	handler := slog.NewJSONHandler(os.Stderr, options)
	logger := slog.New(handler)
	slog.SetDefault(logger)
	return logger
}

func WithProvider(logger *slog.Logger, name string) *slog.Logger {
	return logger.With("provider", name)
}
