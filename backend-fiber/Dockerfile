# --- 1단계: 빌드 스테이지 ---
# Go 1.25.3 버전 사용
FROM golang:1.25.3-alpine AS builder

# 빌드에 필요한 도구 설치
RUN apk add --no-cache git

WORKDIR /app

# 의존성 파일 먼저 복사 (캐싱 활용)
COPY go.mod go.sum ./
RUN go mod download

# 소스 코드 복사
COPY . .

# CGO를 끄고 정적 바이너리로 빌드 (Alpine 실행 환경을 위해 필수)
# 메인 파일 위치가 다르면 경로를 수정하세요 (예: ./cmd/main.go)
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/server/main.go

# --- 2단계: 실행 스테이지 ---
# 매우 가벼운 alpine 이미지 사용
FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
ENV TZ=Asia/Seoul

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone


WORKDIR /root/

# 빌드 스테이지에서 생성된 'main' 바이너리만 복사
COPY --from=builder /app/main .

# 4000번 포트 개방
EXPOSE 4000

# 실행
CMD ["./main"]