package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors" // CORS 미들웨어 추가
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/google/uuid"
	"github.com/returnTesha/whois/domain"
	"github.com/returnTesha/whois/handler"
)

const LOG_DIR = "/mnt/visit-logs"

type Visit struct {
	Timestamp string `json:"timestamp"`
	IP        string `json:"ip"`
	UserAgent string `json:"userAgent"`
	Referer   string `json:"referer"`
	Device    string `json:"device"`
	Browser   string `json:"browser"`
	OS        string `json:"os"`
	Path      string `json:"path"`
	TraceID   string `json:"traceID"`
}

var fileLock sync.Mutex

func visitTrackerMiddleware(c *fiber.Ctx) error {
	if c.Path() == "/api/go/v1/analyze" && c.Method() == "POST" {
		traceID := uuid.New().String()

		c.Locals("traceID", traceID)

		visit := Visit{
			Timestamp: time.Now().Format(time.RFC3339),
			IP:        c.Get("X-Forwarded-For", c.IP()),
			UserAgent: c.Get("User-Agent"),
			Referer:   c.Get("Referer", "Direct"),
			Device:    getDeviceType(c.Get("User-Agent")),
			Browser:   getBrowser(c.Get("User-Agent")),
			OS:        getOS(c.Get("User-Agent")),
			Path:      c.Path(),
			TraceID:   traceID, // ⭐ visit 로그에도 저장
		}

		// 비동기로 저장
		go saveVisit(visit)
	}

	return c.Next()
}

func main() {
	os.MkdirAll(LOG_DIR, 0755)

	app := fiber.New()

	// 1. 로그 미들웨어 (디버깅용)
	app.Use(logger.New())

	origins := os.Getenv("ALLOWED_ORIGINS")
	if origins == "" {
		origins = "http://localhost:3000,https://whois.valuechain.lol,http://whois.valuechain.lol"
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, OPTIONS, PUT, DELETE",
		AllowCredentials: true,
	}))

	app.Use(visitTrackerMiddleware)

	// 3. 의존성 주입 (Spring AI는 5000포트 사용)
	// 서비스 레이어 생성 시 Spring AI 서버의 주소를 5000으로 지정합니다.
	drawingService := domain.NewDrawingService("http://spring-service/api/spring/v1")
	drawingHandler := &handler.DrawingHandler{Service: drawingService}
	// 4. API 엔드포인트
	api := app.Group("/api/go/v1") // 그룹화하여 관리하면 편리합니다.
	api.Post("/analyze", drawingHandler.AnalyzeQuestionMark)

	app.Post("/visit", func(c *fiber.Ctx) error {
		visit := Visit{
			Timestamp: time.Now().Format(time.RFC3339),
			IP:        c.Get("X-Forwarded-For", c.IP()),
			UserAgent: c.Get("User-Agent"),
			Referer:   c.Get("Referer", "Direct"),
			Device:    getDeviceType(c.Get("User-Agent")),
			Browser:   getBrowser(c.Get("User-Agent")),
			OS:        getOS(c.Get("User-Agent")),
		}

		if err := saveVisit(visit); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(fiber.Map{"success": true})
	})

	// 방문 기록 조회 API (날짜별)
	app.Get("/visits/:date", func(c *fiber.Ctx) error {
		date := c.Params("date") // 2026-01-11 형식
		visits, err := getVisits(date)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(visits)
	})

	// 전체 날짜 목록
	app.Get("/visits/dates", func(c *fiber.Ctx) error {
		dates, err := getAvailableDates()
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(dates)
	})

	// 5. Fiber 서버 실행 (4000포트)
	app.Listen(":4000")
}

func saveVisit(visit Visit) error {
	fileLock.Lock()
	defer fileLock.Unlock()

	today := time.Now().Format("2006-01-02")
	filename := filepath.Join(LOG_DIR, fmt.Sprintf("visits-%s.json", today))

	var visits []Visit
	data, err := os.ReadFile(filename)
	if err == nil {
		json.Unmarshal(data, &visits)
	}

	visits = append(visits, visit)

	jsonData, err := json.MarshalIndent(visits, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(filename, jsonData, 0644)
}

func getVisits(date string) ([]Visit, error) {
	filename := filepath.Join(LOG_DIR, fmt.Sprintf("visits-%s.json", date))

	data, err := os.ReadFile(filename)
	if err != nil {
		return []Visit{}, nil // 파일 없으면 빈 배열
	}

	var visits []Visit
	if err := json.Unmarshal(data, &visits); err != nil {
		return nil, err
	}

	return visits, nil
}

func getAvailableDates() ([]string, error) {
	files, err := filepath.Glob(filepath.Join(LOG_DIR, "visits-*.json"))
	if err != nil {
		return nil, err
	}

	var dates []string
	for _, file := range files {
		base := filepath.Base(file)
		// visits-2026-01-11.json -> 2026-01-11
		date := base[7 : len(base)-5]
		dates = append(dates, date)
	}

	return dates, nil
}

func getDeviceType(ua string) string {
	// 간단한 파싱 (필요시 라이브러리 사용)
	if contains(ua, "Mobile") {
		return "Mobile"
	}
	if contains(ua, "Tablet") || contains(ua, "iPad") {
		return "Tablet"
	}
	return "Desktop"
}

func getBrowser(ua string) string {
	if contains(ua, "Chrome") {
		return "Chrome"
	}
	if contains(ua, "Safari") {
		return "Safari"
	}
	if contains(ua, "Firefox") {
		return "Firefox"
	}
	return "Unknown"
}

func getOS(ua string) string {
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

func contains(s, substr string) bool {
	return len(s) > 0 && len(substr) > 0 &&
		(s == substr || len(s) >= len(substr) &&
			(s[:len(substr)] == substr || s[len(s)-len(substr):] == substr ||
				findSubstring(s, substr)))
}

func findSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
