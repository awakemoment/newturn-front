# Newturn 프론트엔드 설치 가이드

## ⚡ Quick Start (5분)

### Step 1: 패키지 설치

```bash
# newturn-front 루트에서
cd C:\projects\business\newturn-front

# pnpm 설치 (없으면)
npm install -g pnpm

# 모든 패키지 설치
pnpm install
```

### Step 2: 환경변수 설정

```bash
# apps/investor 폴더에서
cd apps/investor

# .env.local 파일 생성 (직접 만들어야 함)
# 내용:

NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 3: 개발 서버 실행

```bash
# newturn-front 루트에서
pnpm dev

# 또는 investor 앱만
cd apps/investor
pnpm dev

# 성공하면:
# ▲ Next.js 14.2.6
# - Local:   http://localhost:3000
```

### Step 4: 확인

```bash
# 브라우저에서:
http://localhost:3000  # 홈 페이지
```

---

## 🔗 백엔드 연동 확인

### 백엔드가 실행 중인지 확인

```bash
# 다른 터미널에서
# newturn-back 폴더로 이동
cd C:\projects\business\newturn-back

# 가상환경 활성화
venv\Scripts\activate

# 서버 실행
python manage.py runserver

# → http://localhost:8000 작동 확인
```

### API 통신 테스트

```bash
# 브라우저 개발자 도구 (F12) 열기
# Console 탭에서:

fetch('http://localhost:8000/api/stocks/search/?q=삼성')
  .then(r => r.json())
  .then(console.log)

# → 결과 나오면 성공!
```

---

## 🎨 개발 시작하기

### 페이지 추가

```bash
# 분석 페이지 예시
src/app/analysis/[code]/page.tsx

# 관심 종목 페이지
src/app/watchlist/page.tsx
```

### 컴포넌트 추가

```bash
# 메이트 카드 컴포넌트
src/components/mate-card.tsx
```

### API 호출

```typescript
// src/lib/axios/index.ts 사용
import { api } from '@/lib/axios';

const result = await api.searchStocks('삼성');
```

---

## 🔧 트러블슈팅

### 문제 1: pnpm 명령어 없음

```bash
npm install -g pnpm
```

### 문제 2: API 연결 안 됨

```bash
# .env.local 확인
NEXT_PUBLIC_API_URL=http://localhost:8000

# 백엔드 실행 확인
# http://localhost:8000/swagger 접속되는지
```

### 문제 3: CORS 에러

```bash
# 백엔드 .env 파일 확인
CORS_ORIGIN=http://localhost:3000

# 백엔드 재시작
```

---

## 📝 다음 단계

```
1. ✅ 프론트엔드 설치 완료
2. ✅ 개발 서버 실행
3. ✅ 백엔드 연동 확인
4. → 페이지 개발 시작
5. → 메이트 분석 화면 구현
```

