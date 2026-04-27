# Routinely Frontend — CLAUDE.md

## 1. 기술 스택

| 항목 | 선택 | 비고 |
|---|---|---|
| Language | TypeScript | strict 모드 권장 |
| Framework | React 18 | |
| Build Tool | Vite | |
| Routing | React Router v6 | SPA 라우팅 |
| 서버 상태 관리 | React Query (TanStack Query) | 캐싱, 로딩, 리트라이 |
| 전역 상태 관리 | Zustand | 로그인 사용자, 토스트, UI 상태만 |
| HTTP 클라이언트 | axios | interceptor로 토큰 자동 첨부 |
| 실시간 채팅 | STOMP over WebSocket | `@stomp/stompjs` |
| 실시간 알림 | SSE (EventSource) | 서버 → 클라이언트 단방향 |
| UI 시스템 | Tailwind CSS + shadcn/ui | |
| 폼 관리 | React Hook Form + Zod | |
| 디자인 시스템 | 화이트 베이스 + 크림슨 포인트 (`#DC3545`) | |

---

## 2. 라우팅 구조

| 경로 | 페이지 | 인증 필요 |
|---|---|:---:|
| `/login` | 로그인 | ❌ |
| `/register` | 회원가입 | ❌ |
| `/` | 홈 (루틴 현황 + 챌린지 요약 + 알림) | ✅ |
| `/routines` | 내 루틴 목록 | ✅ |
| `/routines/new` | 루틴 생성 | ✅ |
| `/routines/:id` | 루틴 상세 | ✅ |
| `/challenges` | 챌린지 목록 | ✅ |
| `/challenges/new` | 챌린지 생성 | ✅ |
| `/challenges/:id` | 챌린지 상세 (피드 + 랭킹) | ✅ |
| `/challenges/:id/chat` | 챌린지 채팅방 | ✅ |
| `/feed` | 개인 피드 | ✅ |
| `/statistics` | 개인 통계 / 스트릭 | ✅ |
| `/notifications` | 알림 목록 | ✅ |
| `/profile` | 내 프로필 | ✅ |

---

## 3. 디자인 시스템

> 상세 내용은 `docs/design/COLOR_SYSTEM.md` 참고

### 핵심 원칙

- **배경은 항상 화이트 계열** — 다크 배경, 다크 사이드바 금지
- **크림슨(`#DC3545`)은 포인트만** — 배경 전체에 크림슨 금지
- **의미 있는 색상 사용** — 완료=`#10B981`, 미완료=`#F59E0B`, 위험/포인트=`#DC3545`

### 핵심 색상 토큰

| 토큰 | 값 | 사용처 |
|---|---|---|
| `--color-primary` | `#DC3545` | CTA 버튼, 활성 메뉴, 진행률 바, 알림 배지 |
| `--color-primary-tint` | `#FDEAEC` | 활성 메뉴 배경, 배지 배경 |
| `--color-success` | `#10B981` | 완료 상태, 체크 아이콘 |
| `--color-warning` | `#F59E0B` | 미완료, 마감 임박(D-3 이하) |
| `--color-text-primary` | `#111827` | 제목, 본문 |
| `--color-text-secondary` | `#6B7280` | 보조 텍스트, 날짜 |
| `--color-bg-page` | `#FAFAFA` | 페이지 배경 |
| `--color-bg-card` | `#FFFFFF` | 카드 배경 |
| `--color-border` | `#E5E7EB` | 기본 테두리 |

### 진행률 바 색상 규칙

| 달성률 | 색상 |
|---|---|
| 0% | `#F3F4F6` |
| 1~49% | `#F59E0B` |
| 50~99% | `#DC3545` |
| 100% | `#10B981` |

---

## 4. 컴포넌트 / 파일 컨벤션

- 컴포넌트 파일명: **PascalCase** — `RoutineCard.tsx`
- 훅 파일명: **camelCase + use prefix** — `useAuth.ts`
- 타입 파일명: **camelCase** — `routine.ts`
- 페이지 컴포넌트: `pages/{도메인}/{PascalCase}Page.tsx`
- 함수형 컴포넌트 + 화살표 함수 통일
- Props 타입은 컴포넌트 파일 내 interface로 정의 (`{ComponentName}Props`)
- shadcn/ui 컴포넌트를 직접 수정하지 않고 `className` prop 활용

---

## 5. 상태 관리 원칙

| 상태 종류 | 관리 방법 |
|---|---|
| 서버 데이터 (API 응답) | React Query |
| 전역 UI 상태 | Zustand (로그인 정보, accessToken, 토스트) |
| 로컬 UI 상태 | useState / useReducer |
| 실시간 채팅 메시지 | useState + STOMP 훅 |
| 실시간 알림 | SSE + Zustand (미읽음 수) |

**원칙**: React Query로 관리 가능한 서버 데이터는 Zustand에 복사하지 않는다.

---

## 6. 실시간 통신

### 채팅 (WebSocket / STOMP)

- 연결: `ws://{gateway}/ws/chat`
- 구독: `/topic/chat/{roomId}`
- 발행: `/app/chat/{roomId}/message`
- STOMP 연결은 채팅방 입장 시 수립, 퇴장 시 해제

### 알림 (SSE)

- 엔드포인트: `GET /api/v1/notifications/stream`
- `EventSource` API는 커스텀 헤더 불가 → fetch 기반 스트리밍 또는 라이브러리 사용

---

## 7. 주의사항

- **다크 배경 절대 금지** — 사이드바, 페이지 배경에 어두운 색 사용 금지
- **React Query 우선** — API 데이터는 React Query로 관리, Zustand에 복사 금지
- **MVP에서 구현하지 않는 것**: 소셜 로그인 UI, 피드 댓글, 프로필 이미지 업로드
- **환경 변수**: `VITE_` 접두사 필수 — `VITE_API_BASE_URL`, `VITE_WS_URL`
- **Zod 스키마**: 폼 유효성 검증은 Zod 스키마를 별도 파일로 분리하여 재사용
- **타입 안전성**: API 응답 타입은 `types/`에 정의, `as` 캐스팅 최소화
- **STOMP 연결**: 컴포넌트 마운트/언마운트 시 연결/해제 관리 철저히 (메모리 누수 방지)
