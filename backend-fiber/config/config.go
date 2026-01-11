package config

import (
	"log"
	"os"

	"github.com/BurntSushi/toml"
	"github.com/joho/godotenv"
)

type Config struct {
	Server    serverConfig
	Services  servicesConfig
	JwtSecret string
}

type serverConfig struct {
	Port string `toml:"port"`
}

type servicesConfig struct {
	SpringAiUrl string `toml:"spring_ai_url"`
}

func LoadConfig() *Config {
	// 1. .env 로드
	_ = godotenv.Load()

	// 2. TOML 로드
	var cfg Config
	if _, err := toml.DecodeFile("config.toml", &cfg); err != nil {
		log.Fatalf("Error loading config.toml: %v", err)
	}

	// 3. 환경변수에서 JWT 비밀키 로드
	cfg.JwtSecret = os.Getenv("JWT_SECRET")
	if cfg.JwtSecret == "" {
		cfg.JwtSecret = "default_secret" // 실제 서비스에선 필수 에러 처리
	}

	return &cfg
}
