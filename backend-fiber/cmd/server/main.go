package main

import (
	"bufio"
	"fmt"
	"log/slog"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/google/uuid"
	"github.com/returnTesha/whois/config"
	"github.com/returnTesha/whois/handler"
	"github.com/returnTesha/whois/internal/provider"
	"github.com/returnTesha/whois/internal/provider/blockchain"
	"github.com/returnTesha/whois/internal/provider/spring"
	"github.com/returnTesha/whois/internal/usecase"
	"github.com/returnTesha/whois/pkg/logger"
)

func main() {

	logger := logger.Setup()
	logger.Info("🚀 Starting Satellite Data Colgolector")

	if err := setupEnviroment(); err != nil {
		logger.Info("❌ Environment setup failed: %v\n", err)
		os.Exit(1)
	}

	cfg, err := loadConfig()
	if err != nil {
		logger.Error("Failed to load config", "error", err)
		os.Exit(1)
	}

	providers, err := setupProviders(cfg, logger)
	if err != nil {
		logger.Error("Failed to setup providers", "error", err)
		os.Exit(1)
	}

	app := setupServer(cfg, providers, logger)
	port := fmt.Sprintf(":%d", cfg.App.Port)

	if err := app.Listen(port); err != nil {
		log.Error("Server crashed", "error", err)
		os.Exit(1)
	}
	logger.Info("✅ Application completed successfully")

}

func setupEnviroment() error {
	return loadEnv(".env")
}

func loadEnv(filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		trimSpace := strings.TrimSpace(scanner.Text())
		if trimSpace == "" || strings.HasPrefix(trimSpace, "#") {
			continue
		}

		n := strings.SplitN(trimSpace, "=", 2)
		if len(n) == 2 {
			key := strings.TrimSpace(n[0])
			value := strings.TrimSpace(n[1])
			// Remove quotes if present
			if strings.HasPrefix(value, "\"") && strings.HasSuffix(value, "\"") {
				value = value[1 : len(value)-1]
			}
			os.Setenv(key, value)
		}

	}
	return scanner.Err()
}

func loadConfig() (*config.Config, error) {
	cfg, err := config.Load("config/config.toml")
	if err != nil {
		return nil, fmt.Errorf("load config: %w", err)
	}

	return cfg, nil
}

func setupProviders(cfg *config.Config, logger *slog.Logger) (map[string]provider.Provider, error) {
	registry := provider.NewRegistry()

	if cfg.Spring.Enabled {
		springProvider := spring.NewProvider(cfg.Spring, logger)
		registry.Register(springProvider)
	}

	if cfg.Polygon.Enabled {
		polygonProvider := blockchain.NewPolygonProvider(cfg.Polygon, logger)
		registry.Register(polygonProvider)
	}

	providers := registry.GetProviders()

	if len(providers) == 0 {
		return nil, fmt.Errorf("no providers enabled")
	}

	logger.Info("Providers initialized", "count", len(providers))
	return providers, nil
}

func setupServer(cfg *config.Config, providers map[string]provider.Provider, logger *slog.Logger) *fiber.App {
	app := fiber.New(fiber.Config{
		AppName: "QuestionMark v1",
	})

	origins := os.Getenv("ALLOWED_ORIGINS")
	if origins == "" {
		// 기본값 세팅
		origins = "http://localhost:3000,https://whois.valuechain.lol,http://whois.valuechain.lol,http://question-mark.valuechain.lol,https://question-mark.valuechain.lol"
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, OPTIONS, PUT, DELETE",
		AllowCredentials: true,
	}))

	app.Use(func(c *fiber.Ctx) error {
		traceID := uuid.New().String()
		c.Locals("traceID", traceID)
		c.Set("X-Trace-ID", traceID)
		return c.Next()
	})

	springProv := providers["spring"]
	if springProv == nil {
		logger.Error("❌ [spring] provider not found in registry!")
		// 여기서 패닉을 내거나 기본 설정을 할 수 있습니다.
	}

	polygonProv := providers["polygon"]

	drawingUsecase := usecase.NewDrawingUsecase(springProv, polygonProv, logger)

	drawingHandler := handler.DrawingHandler{
		Usecase: drawingUsecase,
	}

	logger.Info("Successfully set [spring] drawing handler")

	api := app.Group("/api/go/v1")
	api.Post("/analyze", drawingHandler.AnalyzeQuestionMark)

	return app
}
