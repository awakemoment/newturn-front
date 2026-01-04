# Newturn Frontend

미국 주식 투자를 위한 밸류에이션 도구 및 데이터 분석 플랫폼 프론트엔드

## 📋 프로젝트 개요

Newturn 프론트엔드는 Next.js 14와 React로 구축된 현대적인 웹 애플리케이션입니다. 백엔드 API와 연동하여 사용자에게 직관적인 투자 분석 인터페이스를 제공합니다.

### 주요 기능
- 📊 **종목 분석 대시보드**: 4개 메이트 밸류에이션 결과 시각화
- 💰 **절약→투자 시스템**: 카테고리 통장 관리, 자동 절약, 투자 전환
- 🏦 **은행 계좌 연동**: Plaid를 통한 미국 은행 계좌 연결
- 📈 **포트폴리오 관리**: 투자 포트폴리오 추적 및 분석
- 🔍 **종목 스크리닝**: 필터링 및 정렬 기능
- 📚 **콘텐츠 큐레이션**: 투자 관련 콘텐츠 탐색

## 🛠️ 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: HeadlessUI
- **State Management**: React Hooks (useState, useContext)
- **HTTP Client**: Fetch API
- **Form Handling**: React Hook Form (선택사항)

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 18+
- pnpm (권장) 또는 npm

### 설치

1. **저장소 클론**
```bash
git clone https://github.com/awakemoment/newturn-front.git
cd newturn-front
```

2. **의존성 설치**
```bash
pnpm install
# 또는
npm install
```

3. **환경변수 설정**
```bash
# .env.local 파일 생성
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **개발 서버 실행**
```bash
cd apps/investor
pnpm dev
# 또는
npm run dev
```

5. **브라우저에서 확인**
```
http://localhost:3000
```

## 📁 프로젝트 구조

```
newturn-front/
├── apps/
│   └── investor/              # 메인 앱
│       ├── src/
│       │   ├── app/           # Next.js App Router
│       │   │   ├── page.tsx   # 홈 페이지
│       │   │   ├── accounts/  # 계좌 관리
│       │   │   ├── investments/ # 투자 내역
│       │   │   ├── stocks/    # 종목 정보
│       │   │   └── portfolio/ # 포트폴리오
│       │   ├── components/    # 재사용 가능한 컴포넌트
│       │   ├── lib/           # 유틸리티 및 API 클라이언트
│       │   │   └── api/       # API 클라이언트 함수
│       │   └── types/         # TypeScript 타입 정의
│       ├── public/            # 정적 파일
│       ├── package.json
│       └── next.config.js
└── README.md
```

## 🔧 환경변수 설정

### 로컬 개발 (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 프로덕션 (.env.production)

```bash
NEXT_PUBLIC_API_URL=https://api.newturn.com
```

## 📚 주요 페이지

- `/` - 홈 대시보드
- `/accounts` - 계좌 목록 (카테고리 통장, 은행 계좌)
- `/accounts/[id]` - 계좌 상세
- `/investments` - 투자 내역 목록
- `/investments/[id]` - 투자 상세
- `/stocks` - 종목 스크리닝
- `/stocks/[id]` - 종목 상세
- `/portfolio` - 포트폴리오 목록
- `/portfolio/[id]` - 포트폴리오 상세

## 🔐 인증

인증은 백엔드 API의 Token Authentication을 사용합니다.

```typescript
// API 호출 예시
const response = await fetch(`${API_URL}/api/auth/login/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const { token } = await response.json();

// 토큰 저장 (localStorage 또는 cookie)
localStorage.setItem('token', token);

// 인증된 API 호출
const data = await fetch(`${API_URL}/api/stocks/`, {
  headers: { 'Authorization': `Token ${token}` },
});
```

## 📦 빌드 및 배포

### 개발 빌드

```bash
cd apps/investor
pnpm build
pnpm start
```

### 프로덕션 빌드

```bash
cd apps/investor
pnpm build
```

### Vercel 배포

1. Vercel 프로젝트 생성
2. GitHub 저장소 연결
3. Root Directory: `apps/investor` 설정
4. 환경변수 설정:
   - `NEXT_PUBLIC_API_URL=https://api.newturn.com`
5. 배포 완료

자세한 배포 가이드는 백엔드 [DEPLOYMENT_GUIDE.md](../newturn-back/DEPLOYMENT_GUIDE.md)를 참고하세요.

## 🧪 개발

### 코드 스타일

- TypeScript strict mode 사용
- ESLint 규칙 준수
- Tailwind CSS 클래스 우선 사용

### 컴포넌트 구조

```typescript
// 컴포넌트 예시
interface Props {
  title: string;
  value: number;
}

export function Card({ title, value }: Props) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl">{value.toFixed(2)}</p>
    </div>
  );
}
```

## 🎨 스타일링

Tailwind CSS를 사용합니다. 커스텀 스타일은 `tailwind.config.js`에서 설정할 수 있습니다.

## 📝 라이센스

Private - All Rights Reserved

## 👥 팀

- 개발: awakemoment

## 📞 문의

이슈는 GitHub Issues를 통해 제출해주세요.

---

**마지막 업데이트**: 2025.01.14
