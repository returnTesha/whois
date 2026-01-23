package spring

import (
	"context"
	"log/slog"

	"github.com/returnTesha/whois/config"
	"github.com/returnTesha/whois/internal/domain"
)

type SpringProvider struct {
	cfg    config.SpringConfig
	logger *slog.Logger
	name   string
}

func NewProvider(cfg config.SpringConfig, logger *slog.Logger) *SpringProvider {
	return &SpringProvider{
		cfg:    cfg,
		logger: logger,
		name:   "spring-ai",
	}
}

func (p *SpringProvider) GetName() string {
	return p.name
}

func (p *SpringProvider) Excute(ctx context.Context, data interface{}) (interface{}, error) {
	// TODO: 여기서 실제로 http.Post(p.cfg.BaseURL, reqData.ImageData) 로직 실행
	// 지금은 구조만 잡기 위해 가짜 결과 리턴
	return domain.AnalysisResult{Similarity: 0.95, Feedback: "Good", FeedbackKo: "좋아"}, nil
}
