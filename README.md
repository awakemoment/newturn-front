# Newturn Frontend

> 개인 투자자를 위한 AI 분석 메이트 서비스 - 프론트엔드

## 🚀 Quick Start

### 로컬 개발

```bash
# 1. 패키지 설치
pnpm install

# 2. 환경변수 설정
cd apps/investor
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000 확인

# 3. 개발 서버 실행
pnpm dev

# → http://localhost:3000
```

### 배포

```bash
# Vercel 배포
cd apps/investor
vercel

# 환경변수 설정
# NEXT_PUBLIC_API_URL=https://api.newturn.com
```

---

## 📦 프로젝트 구조

```
newturn-front/
├─ apps/
│  └─ investor/              # 투자자용 앱
│     ├─ src/
│     │  ├─ app/            # Next.js App Router
│     │  │  ├─ page.tsx             # 홈 (검색)
│     │  │  ├─ analysis/
│     │  │  │  └─ [code]/page.tsx  # 종목 분석
│     │  │  ├─ watchlist/
│     │  │  │  └─ page.tsx          # 관심 종목
│     │  │  └─ login/
│     │  │     └─ page.tsx          # 로그인
│     │  │
│     │  ├─ features/       # 도메인별 기능
│     │  │  ├─ auth/
│     │  │  ├─ stocks/
│     │  │  ├─ analysis/
│     │  │  └─ watchlist/
│     │  │
│     │  ├─ components/     # 공통 컴포넌트
│     │  │  ├─ ui/         # shadcn/ui
│     │  │  └─ layout/
│     │  │
│     │  └─ lib/           # 유틸리티
│     │     ├─ axios/      # API 클라이언트
│     │     └─ utils.ts
│     │
│     ├─ .env.example
│     └─ package.json
│
└─ packages/                # 공통 패키지
   ├─ ui/                   # 공통 UI 컴포넌트
   └─ typescript-config/    # TS 설정
```

---

## 🔧 환경 변수

`.env.local` 파일:

```bash
# API URL (로컬 개발)
NEXT_PUBLIC_API_URL=http://localhost:8000

# API URL (AWS 배포)
# NEXT_PUBLIC_API_URL=https://api.newturn.com

# 소셜 로그인 (추후)
# NEXT_PUBLIC_KAKAO_CLIENT_ID=
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

---

## 📱 주요 페이지

### 1. 홈 (검색)
```
/ 
- 종목 검색 바
- 인기 종목
- 최근 분석한 종목
```

### 2. 종목 분석
```
/analysis/[code]
- 메이트별 분석 (벤저민, 피셔, 그린블라트)
- 적정가 정보
- 차트
- 관심 종목 추가 버튼
```

### 3. 관심 종목
```
/watchlist
- 저장한 종목 목록
- 메이트 점수
- 적정가 괴리율
- 알림 설정
```

### 4. 로그인
```
/login
- 카카오 로그인
- 구글 로그인
```

---

## 🎯 개발 우선순위

### Phase 0: 기본 구조 (Week 1-2)
- [ ] Next.js 프로젝트 생성
- [ ] Tailwind + shadcn/ui 설정
- [ ] API 클라이언트 설정
- [ ] 레이아웃 구성

### Phase 1: 핵심 기능 (Week 3-6)
- [ ] 종목 검색
- [ ] 분석 페이지 (메이트 3개)
- [ ] 관심 종목 저장

### Phase 2: 추가 기능 (Week 7-10)
- [ ] 로그인 (소셜)
- [ ] 마이페이지
- [ ] 결제

---

**마지막 업데이트**: 2024-11-02

