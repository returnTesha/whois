# 1단계: 빌드 스테이지
FROM node:20-alpine AS builder
WORKDIR /app

# 패키지 매니저 설치 (pnpm 사용 시)
RUN npm install -g pnpm

# 의존성 설치
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# 소스 복사 및 빌드
COPY . .
RUN pnpm build

# 2단계: 실행 스테이지 (Nginx)
FROM nginx:alpine

# 1단계에서 빌드된 결과물(build 폴더)을 Nginx 경로로 복사
COPY --from=builder /app/build /usr/share/nginx/html

# 위에서 만든 리버스 프록시 설정파일 복사
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
