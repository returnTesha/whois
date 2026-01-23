package blockchain

import (
	"context"
	"log/slog"

	"github.com/returnTesha/whois/config"
)

type PolygonProvider struct {
	cfg    config.PolygonConfig
	logger *slog.Logger
	name   string
}

func NewPolygonProvider(cfg config.PolygonConfig, logger *slog.Logger) *PolygonProvider {
	return &PolygonProvider{
		cfg:    cfg,
		logger: logger,
		name:   "polygon",
	}
}

func (p *PolygonProvider) GetName() string {
	return p.name
}

func (p *PolygonProvider) Excute(ctx context.Context, data interface{}) (interface{}, error) {
	return "실행 완료", nil
}
