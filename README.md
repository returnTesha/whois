# ❓ WhoIs - AI Drawing Analyzer

> **"Once the AI validates your handwritten '?', the gates to my tech stack will swing open."**
> 사용자가 그린 "물음표 그림"을 AI가 검증하는 어플리케이션입니다.

---

## 🌐 Live Demo
[http://whois.valuechain.lol](http://whois.valuechain.lol)

---

## System Architecture

![Architecture Screenshot](https://github.com/user-attachments/assets/6beb8392-c8b0-434c-9eaa-a1283f8b6a0c)

---

## Key Features

1. **AI Handwriting Analysis**: 사용자가 캔버스에 그린 '?'를 분석하여 유사도 측정.
2. **Bilingual Feedback**: 영어와 한국어 해설을 동시에 제공하여 사용자 경험 향상.
3. **Architecture Transparency**: 분석 성공 시 실제 시스템 구조를 시각적으로 공개.

---

### **Infrastructure Detail**
- **Cloud**: Google Cloud Platform > GCE
- **OS**: Rockylinux10
- **Orchestration**: K3s (Lightweight Kubernetes)
- **Frontend**: nextjs
- **Backend**: Fiber(go1.25.3), Spring(jdk21)
- **Web Server**: Nginx
- **WAS**: apache-tomcat10
- **CI/CD**: Docker & GitHub Actions (Optional)
- **AI**: Google Gemini AI

---

## CheckPoint

1. **Spring AI & AI Agent Orchestration**
    Prompt Engineering: 단순한 이미지 분석을 넘어, AI에게 유사도 점수와 한/영 피드백을 JSON 형식으로 응답하도록 유도하는 정교한 프롬프트를 설계했습니다.
    Service Bridge: Spring Boot 3.x를 활용하여 Google Gemini AI API와 안정적인 통신을 구현하고, 비즈니스 로직과 AI 응답 파싱을 분리하여 유지보수성을 높였습니다.

2. **Go-routine & High Performance Gateway**
    Concurrency Handling: Go의 **고루틴(Goroutine)**을 활용하여 프론트엔드와 AI 서비스 사이의 요청을 비동기적으로 처리, 트래픽이 몰려도 낮은 지연 시간(Latency)을 유지합니다.
    Lightweight Proxy: Fiber 프레임워크를 기반으로 최소한의 리소스를 사용하여 Spring AI 서버로 요청을 라우팅하는 고성능 API 게이트웨이 역할을 수행합니다.

3. **Cloud-Native Architecture (K3s & GCP)**
    K3s Orchestration: 무거운 환경 대신 **K3s(Lightweight Kubernetes)**를 선택하여 GCP GCE(Rocky Linux 10) 환경 내에서 리소스 효율성을 극대화했습니다.
    Microservices Communication: Ingress-Nginx를 관문으로 설정하고, 서비스 간 통신은 쿠버네티스 내부 DNS를 사용(Service Discovery)하여 보안과 효율을 동시에 잡았습니다.
    Container Isolation: Next.js(Nginx), Go Fiber, Spring Boot(Tomcat)를 각각 독립된 컨테이너로 격리하여 서비스 간의 결합도를 낮췄습니다.

4. **Bilingual Intelligence**
    Dual-Language Processing: AI 응답 단계에서 한국어와 영어를 동시에 생성하도록 설계하여, 글로벌 서비스로 확장 가능한 사용자 경험을 제공합니다.

---

Roadmap & Future Upgrades

현재의 아키텍처를 넘어, 더 강력하고 관측 가능한(Observable) 시스템으로 진화시키기 위한 단계별 계획입니다.
1. **Infrastructure Modernization (Helm)**
    Kubernetes Manifest Management: 개별 YAML 관리에서 벗어나 Helm Chart를 도입하여 환경별(Dev/Prod) 설정을 템플릿화하고 배포 프로세스를 표준화할 예정입니다.

2. **Advanced DevOps & Observability (OTLP)**
    Full-stack Monitoring: **OpenTelemetry (OTLP)**를 도입하여 서비스 간 요청의 분산 트레이싱을 시각화합니다. (Next.js ↔ Fiber ↔ Spring ↔ Gemini)
    Metrics & Logging: Prometheus와 Grafana를 연동하여 시스템의 가용성과 리소스 사용량을 대시보드로 구축할 계획입니다.

3. **Intelligent CI/CD Pipeline**
    GitOps Workflow: GitHub Actions와 ArgoCD를 연동한 GitOps 체계를 구축하여, 코드 푸시부터 쿠버네티스 반영까지의 과정을 완전 자동화하고 배포 이력을 투명하게 관리합니다.

4. **AI Logic Optimization**
    Vector Database Integration: 사용자의 그림 데이터를 벡터화하여 저장함으로써, 단순 분석을 넘어 유사한 그림 패턴을 검색하고 추천하는 기능을 확장할 예정입니다.

5. **Protocol설정**
    퍼포먼스 업그레이드를 위하여, frontend - backend는 restful로하지만, backend끼리는 grpc로 구성하려고합니다. 현재는 모든 통신을 Restful로 구성하였습니다.
---

## Developer
- **GitHub**: [@returnTesha](https://github.com/returnTesha)
- **Telegram**: [@returnTesha](https://t.me/returnTesha)
- **Email**: [returntesha@gmail.com](mailto:returntesha@gmail.com)

---

Copyright © 2026 returnTesha. All rights reserved.
