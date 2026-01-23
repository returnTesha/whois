package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/BurntSushi/toml"
)

type Config struct {
	App     AppConfig     `toml:"app"`
	Spring  SpringConfig  `toml:"spring"`
	Polygon PolygonConfig `toml:"polygon"`
	Log     LogConfig     `toml:"log"`
}

type AppConfig struct {
	Env  string `toml:"env"`
	Port int    `toml:"port"`
}

type SpringConfig struct {
	Enabled bool   `toml:"enabled"`
	BaseURL string `toml:"base_url"`
	Timeout int    `toml:"timeout_ms"`
}

type PolygonConfig struct {
	Enabled              bool   `toml:"enabled"`
	RPCURL               string `toml:"rpc_url"`
	ContractAddress      string `toml:"contract_address"`
	TokenContractAddress string `toml:"token_contract_address"`
	PrivateKey           string `toml:"private_key"`
}

type LogConfig struct {
	Level string `toml:"level"`
}

// Load - 위성 수집기에서 썼던 os.Expand 방식 그대로!
func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read config: %w", err)
	}

	// 핵심 로직: TOML 내부의 ${VAR}를 환경 변수로 치환
	content := os.Expand(string(data), func(key string) string {
		key = strings.Trim(key, "{}")
		return os.Getenv(key)
	})

	var cfg Config
	if _, err := toml.Decode(content, &cfg); err != nil {
		return nil, fmt.Errorf("parse toml: %w", err)
	}

	return &cfg, nil
}
