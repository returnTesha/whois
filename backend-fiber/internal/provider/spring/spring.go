package spring

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/returnTesha/whois/config"
	"github.com/returnTesha/whois/internal/domain"
	"github.com/returnTesha/whois/pkg/logger"
)

type SpringProvider struct {
	cfg    config.SpringConfig
	logger *slog.Logger
	name   string
}

func NewProvider(cfg config.SpringConfig, baseLogger *slog.Logger) *SpringProvider {
	return &SpringProvider{
		cfg:    cfg,
		logger: logger.WithProvider(baseLogger, "spring"),
		name:   "spring",
	}
}

func (p *SpringProvider) GetName() string {
	return p.name
}

func (p *SpringProvider) Excute(ctx context.Context, data interface{}, traceID string) (interface{}, error) {
	// 1. 데이터 타입 검사 (사령관이 준 게 DrawingRequest 맞는지 확인)
	req, ok := data.(domain.DrawingRequest)
	if !ok {
		return nil, fmt.Errorf("invalid request type")
	}

	bodyBytes, err := json.Marshal(map[string]string{
		"image": req.ImageData,
	})
	if err != nil {
		return nil, fmt.Errorf("json marshal error: %w", err)
	}

	// 2. 이제 이 바이트 슬라이스를 버퍼에 담아 보냅니다.
	httpReq, err := http.NewRequestWithContext(ctx, "POST", p.cfg.BaseURL+"/api/spring/v1/analyze", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-Trace-ID", traceID)

	// 4. 전송 및 응답 대기
	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		p.logger.Error("Spring server connection failed", "error", err)
		return nil, err
	}
	defer resp.Body.Close()

	// 5. 응답 코드 확인
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("spring server returned status: %d", resp.StatusCode)
	}

	// 6. 결과 파싱 (domain.AnalysisResult 구조체로)
	var result domain.AnalysisResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result, nil
}
