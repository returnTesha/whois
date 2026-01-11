backend-go/
├── cms/
│   └── server/
│       └── main.go         # 서버 엔트리 포인트
├── domain/
│   ├── auth_service.go     # 비즈니스 로직 (Spring AI 호출 등)
│   ├── auth_model.go       # Request/Response DTO 및 데이터 모델
│   └── user_model.go       # 사용자 관련 모델
├── handler/
│   └── auth_handler.go     # HTTP 요청 처리 (Fiber 연동)
├── config/
│   ├── config.go           # 환경 변수 및 설정 로드
│   └── middleware.go       # JWT 검증 미들웨어
├── go.mod
└── .env