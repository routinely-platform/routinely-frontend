# 프로젝트 초기 세팅 변경 내역

`npm create vite@latest` + 패키지 설치 이후에 Routinely 프로젝트에 맞게 수정한 내용을 정리한다.

---

## 1. 추가 설치한 패키지

Vite 기본 템플릿(`react-ts`)에 포함되지 않은 패키지를 추가 설치했다.

### 런타임 의존성

| 패키지 | 용도 |
|---|---|
| `zustand` | 전역 상태 관리 (accessToken, UI 상태) |
| `@tanstack/react-query` | 서버 상태 관리 (API 응답 캐싱, 로딩, 리트라이) |
| `react-router-dom` | SPA 클라이언트 라우팅 |
| `axios` | HTTP 클라이언트 (인터셉터 기반 토큰 첨부) |
| `react-hook-form` | 폼 상태 관리 |
| `zod` | 스키마 기반 폼 유효성 검증 |
| `@hookform/resolvers` | react-hook-form + zod 연결 어댑터 |
| `@stomp/stompjs` | WebSocket/STOMP 채팅 연결 |
| `clsx` | 조건부 클래스명 조합 |
| `tailwind-merge` | Tailwind 클래스 충돌 해결 |

### 개발 의존성

| 패키지 | 용도 |
|---|---|
| `tailwindcss` | CSS 유틸리티 프레임워크 |
| `@tailwindcss/vite` | Tailwind v4 Vite 플러그인 |
| `prettier` | 코드 포매터 |
| `eslint-config-prettier` | ESLint와 Prettier 충돌 규칙 비활성화 |

---

## 2. 수정한 파일

### `vite.config.ts`

**변경 전**: React 플러그인만 포함된 기본 설정

**변경 후**:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- `tailwindcss()` 플러그인 추가 — Tailwind v4는 PostCSS 대신 Vite 플러그인 방식을 사용
- `resolve.alias` 추가 — `@/` → `src/` 경로 별칭 (Vite 번들러 레벨 해석)

---

### `tsconfig.app.json`

**변경 전**: 경로 별칭 설정 없음

**추가된 내용**:
```json
"paths": {
  "@/*": ["./src/*"]
}
```

- TypeScript 언어 서버가 `@/` 경로를 인식하도록 설정 (IDE 자동완성, 타입 체크에 사용)
- `baseUrl` 없이 `paths`만 사용 — TypeScript 6에서 `baseUrl`이 deprecated됨

---

### `src/index.css`

**변경 전**: Vite 기본 템플릿의 CSS (`:root` 변수, 다크모드, 타이포그래피 등)

**변경 후**:
```css
@import "tailwindcss";

@theme {
  --color-primary: #dc3545;
  --color-primary-tint: #fdeaec;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-bg-page: #fafafa;
  --color-bg-card: #ffffff;
  --color-border: #e5e7eb;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background-color: #fafafa; color: #111827; ... }
```

- Tailwind v4 진입점 `@import "tailwindcss"` 추가
- `@theme` 블록으로 Routinely 디자인 토큰 정의 — `CLAUDE.md`의 색상 시스템을 Tailwind 커스텀 색상으로 등록
- 기본 reset CSS 추가 (`box-sizing`, `margin/padding 0`, `body` 기본 스타일)
- 다크모드 관련 스타일 전부 제거 (디자인 시스템: 화이트 베이스 고정)

> **왜 `tailwind.config.ts`가 없나?**
> Tailwind v4는 JS 설정 파일 대신 CSS `@theme` 블록에서 토큰을 정의한다.

---

### `src/main.tsx`

**변경 전**: 기본 `ReactDOM.createRoot` + `App` 렌더링만 존재

**변경 후**:
```tsx
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

// <QueryClientProvider> + <BrowserRouter> 래핑
```

- `QueryClientProvider` 추가 — 앱 전체에서 React Query 사용 가능
- `BrowserRouter` 추가 — React Router 활성화
- `QueryClient` 기본 설정: retry 1회, staleTime 5분 (불필요한 리페치 방지)

---

### `src/App.tsx`

**변경 전**: Vite 기본 카운터 데모 컴포넌트

**변경 후**:
```tsx
import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-4 text-text-primary">홈</div>} />
      <Route path="/login" element={<div className="p-4 text-text-primary">로그인</div>} />
    </Routes>
  )
}
```

- React Router `Routes/Route` 구조로 교체
- 이후 이슈에서 실제 페이지 컴포넌트로 교체 예정인 플레이스홀더

---

### `package.json`

- `name`: `"routinely-tmp"` → `"routinely-frontend"` 수정
- `scripts`에 `"format": "prettier --write src/"` 추가

---

## 3. 삭제한 파일

| 파일 | 이유 |
|---|---|
| `src/App.css` | Tailwind CSS로 대체, 별도 CSS 파일 불필요 |
| `src/assets/hero.png` | Vite 템플릿 기본 이미지, 프로젝트와 무관 |
| `src/assets/react.svg` | Vite 템플릿 기본 아이콘 |
| `src/assets/vite.svg` | Vite 템플릿 기본 아이콘 |

---

## 4. 새로 생성한 파일

### `src/stores/authStore.ts`

```ts
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAuth: () => set({ accessToken: null }),
}))
```

- Access Token을 메모리(Zustand)에 관리 — LocalStorage 미사용 (XSS 방지)
- `clearAuth()`는 로그아웃 시 호출 (#6 Axios 인터셉터에서 사용)

---

### `src/types/api.ts`

```ts
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  errorCode?: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  hasNext: boolean
  totalElements?: number
}
```

- 백엔드 `common-core`의 `ApiResponse<T>` 구조에 맞춘 공통 응답 타입
- 페이지네이션 응답은 백엔드 API 명세 예시(`page`, `size`, `hasNext`) 기준으로 정의

### `src/api/client.ts`

```ts
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})
```

- Axios 인스턴스를 별도 분리 — 이후 도메인별 API 함수에서 공통 사용
- 요청 인터셉터에서 `Authorization: Bearer {accessToken}` 헤더 자동 첨부
- `withCredentials: true` 설정 — 백엔드 `refresh_token` HttpOnly 쿠키 전송 대응
- 401 응답 시 `clearAuth()` 호출 기반으로 인증 상태 정리 가능

---

### `src/utils/cn.ts`

```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- `clsx` + `tailwind-merge` 조합 — shadcn/ui 컴포넌트 스타일 오버라이드에 필수
- 사용 예: `cn('px-4 py-2', isActive && 'bg-primary', className)`

---

### `.env.example`

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080/ws/chat
```

- 팀원이 로컬 환경 변수 파일(`.env.local`)을 만들 때 참고하는 템플릿
- REST API는 Gateway의 `/api/v1` prefix를 포함한 base URL 사용
- WebSocket은 백엔드 명세의 `/ws/chat` 엔드포인트를 그대로 사용
- `.env.local`은 `.gitignore`에 포함되어 커밋되지 않음

---

### `.prettierrc`

```json
{ "semi": false, "singleQuote": true, "tabWidth": 2, "trailingComma": "es5", "printWidth": 100 }
```

- `semi: false` — 세미콜론 없는 스타일 (백엔드 Java와 명확히 구분)
- `singleQuote: true` — React/TS 생태계 일반적 컨벤션

---

### 디렉토리 구조 (`src/`)

```
src/
├── api/           ← axios 호출 함수 (도메인별 파일)
├── assets/brand/  ← Routinely 브랜드 SVG 3종
├── components/
│   └── common/    ← 재사용 공통 컴포넌트
├── hooks/         ← 커스텀 훅
├── lib/           ← axios 인스턴스, queryClient 설정
├── pages/         ← 라우팅 페이지 컴포넌트
├── stores/        ← Zustand 스토어
├── types/         ← API 응답 타입, 도메인 타입
└── utils/         ← 순수 유틸 함수
```

빈 디렉토리에는 `.gitkeep` 파일을 추가하여 git 추적 가능하게 했다.
