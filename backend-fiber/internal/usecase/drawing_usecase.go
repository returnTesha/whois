package usecase

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/returnTesha/whois/internal/domain"
	"github.com/returnTesha/whois/internal/provider"
)

const LOG_DIR = "/mnt/visit-logs"

type DrawingUsecase interface {
	// 핸들러에서 fiber context를 넘겨받아 모든 환경 정보를 수집합니다.
	ProcessAndAnalyze(c *fiber.Ctx, req domain.DrawingRequest, traceID string, ip string, ua string, path string) (*domain.AnalysisResult, error)
}

type drawingUsecase struct {
	springProvider  provider.Provider
	polygonProvider provider.Provider
	logger          *slog.Logger
	fileLock        sync.Mutex // 파일 쓰기 동시성 제어
}

func NewDrawingUsecase(spring provider.Provider, polygon provider.Provider, logger *slog.Logger) DrawingUsecase {
	// 로그 디렉토리가 없으면 미리 생성합니다.
	if err := os.MkdirAll(LOG_DIR, 0755); err != nil {
		logger.Error("로그 디렉토리 생성 실패", "path", LOG_DIR, "error", err)
	}

	return &drawingUsecase{
		springProvider:  spring,
		polygonProvider: polygon,
		logger:          logger.With("layer", "usecase"),
	}
}

func (u *drawingUsecase) ProcessAndAnalyze(c *fiber.Ctx, req domain.DrawingRequest, traceID string, ip string, ua string, path string) (*domain.AnalysisResult, error) {
	u.logger.Info("분석 프로세스 시작", "traceID", traceID)
	referer := c.Get("Referer", "Direct")
	if ip == "" {
		ip = c.IP()
	}

	// 1. 도구(Provider) 실행 - Spring AI에게 분석 요청
	resRaw, err := u.springProvider.Excute(c.Context(), req, traceID)
	if err != nil {
		u.logger.Error("도구 실행 중 에러 발생", "error", err, "traceID", traceID)
		// 에러가 발생해도 접속 기록은 남기기 위해 비동기 호출 시 err 전달
		go u.recordHistory(req, nil, traceID, ip, ua, referer, path, err)
		return nil, err
	}

	// 2. 결과 타입 변환
	result, ok := resRaw.(domain.AnalysisResult)
	if !ok {
		errType := fmt.Errorf("도구 응답 타입 불일치")
		go u.recordHistory(req, &result, traceID, ip, ua, referer, path, err)
		return nil, errType
	}

	//95% 이상이면
	if result.Similarity >= 95 {
		//go u.polygonProvider.Excute(c.Context(), result, traceID)
		txId, _ := u.polygonProvider.Excute(c.Context(), result, traceID)
		result.TxId = txId.(string)
	}

	// 3. 기록 및 보고 (비동기로 풍부한 히스토리 저장)
	go u.recordHistory(req, &result, traceID, ip, ua, referer, path, err)

	return &result, nil
}

// recordHistory: 접속 정보, 환경 정보, AI 결과를 종합하여 파일에 저장
func (u *drawingUsecase) recordHistory(req domain.DrawingRequest, res *domain.AnalysisResult, traceID, ip, ua, referer, path string, err error) {
	u.fileLock.Lock()
	defer u.fileLock.Unlock()

	// 여기서 더이상 c.Get()을 쓰지 않고 파라미터로 받은 값을 씁니다.
	history := domain.AnalysisHistory{
		Timestamp: time.Now().Format(time.RFC3339),
		TraceID:   traceID,
		IP:        ip,
		UserAgent: ua,
		Referer:   referer,
		Path:      path,
		Device:    u.getDeviceType(ua),
		Browser:   u.getBrowser(ua),
		OS:        u.getOS(ua),
		Status:    200,
	}

	// 3. 결과 및 에러 데이터 매핑
	if err != nil {
		history.Status = 500
		history.Error = err.Error()
	}
	if res != nil {
		history.Similarity = res.Similarity
		history.Feedback = res.Feedback
		history.FeedbackKo = res.FeedbackKo
	}

	if res.TxId != "" {
		history.TxId = res.TxId
	}

	// 4. 파일 저장 (이전에 사용하시던 배열 추가 방식 유지)
	u.saveToFile(history)
}

func (u *drawingUsecase) saveToFile(history domain.AnalysisHistory) {
	today := time.Now().Format("2006-01-02")
	filename := filepath.Join(LOG_DIR, fmt.Sprintf("history-%s.json", today))

	var histories []domain.AnalysisHistory
	data, err := os.ReadFile(filename)
	if err == nil {
		json.Unmarshal(data, &histories)
	}

	histories = append(histories, history)

	// 보기 편하게 Indent 적용하여 저장
	jsonData, err := json.MarshalIndent(histories, "", "  ")
	if err != nil {
		u.logger.Error("JSON 마샬링 실패", "error", err)
		return
	}

	if err := os.WriteFile(filename, jsonData, 0644); err != nil {
		u.logger.Error("파일 저장 실패", "error", err)
	}
}

// 환경 분석 헬퍼 함수들
func (u *drawingUsecase) getOS(ua string) string {
	if contains(ua, "Windows") {
		return "Windows"
	}
	if contains(ua, "Mac") {
		return "MacOS"
	}
	if contains(ua, "Linux") {
		return "Linux"
	}
	if contains(ua, "Android") {
		return "Android"
	}
	if contains(ua, "iPhone") || contains(ua, "iOS") {
		return "iOS"
	}
	return "Unknown"
}

func (u *drawingUsecase) getBrowser(ua string) string {
	if contains(ua, "Chrome") {
		return "Chrome"
	}
	if contains(ua, "Safari") {
		return "Safari"
	}
	if contains(ua, "Firefox") {
		return "Firefox"
	}
	if contains(ua, "Edge") {
		return "Edge"
	}
	return "Unknown"
}

func (u *drawingUsecase) getDeviceType(ua string) string {
	if contains(ua, "Mobile") {
		return "Mobile"
	}
	if contains(ua, "Tablet") || contains(ua, "iPad") {
		return "Tablet"
	}
	return "Desktop"
}

func contains(s, substr string) bool {
	return strings.Contains(strings.ToLower(s), strings.ToLower(substr))
}
