# ❓ WhoIs - AI Drawing Analyzer

> **"Once the AI validates your curiosity, the gates to my tech stack will swing open."**
> 사용자의 호기심(물음표 그림)을 AI가 검증하면, 서비스의 아키텍처와 기술 스택이 공개되는 인터랙티브 웹 애플리케이션입니다.

---

## 🌐 Live Demo
[http://whois.valuechain.lol](http://whois.valuechain.lol)

---

## 🏗 System Architecture

서비스의 신뢰성과 확장성을 위해 현대적인 클라우드 네이티브 기술 스택을 활용하여 구축되었습니다.

![Architecture Screenshot](https://github.com/user-attachments/assets/6beb8392-c8b0-434c-9eaa-a1283f8b6a0c)

### **Infrastructure Detail**
- **Cloud**: Google Cloud Platform (GCE)
- **Orchestration**: K3s (Lightweight Kubernetes)
- **Ingress**: Nginx Ingress Controller
- **CI/CD**: Docker & GitHub Actions (Optional)

---

## 🛠 Tech Stack

### **Frontend**
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS (Neo-brutalism Design)
- **Library**: Lucide React, Framer Motion

### **Backend (Microservices)**
- **Gateway API**: **Go (Fiber)**
  - Fast and lightweight request handling.
  - Serves as a bridge between Frontend and AI Logic.
- **AI Service**: **Java (Spring Boot 3.x)**
  - Integrated with **Google Gemini AI**.
  - Provides similarity analysis and bilingual feedback (EN/KO).

---

## 🚀 Key Features

1. **AI Handwriting Analysis**: 사용자가 캔버스에 그린 '?'를 분석하여 유사도 측정.
2. **Bilingual Feedback**: 영어와 한국어 해설을 동시에 제공하여 사용자 경험 향상.
3. **Architecture Transparency**: 분석 성공 시 실제 시스템 구조를 시각적으로 공개.

---

## 👨‍💻 Developer
- **GitHub**: [@returnTesha](https://github.com/returnTesha)
- **Telegram**: [@returnTesha](https://t.me/returnTesha)

---

Copyright © 2026 returnTesha. All rights reserved.
