# Routinely Frontend

TypeScript(strict) / React 19 / Vite / React Router v7 SPA.
워크스페이스 전체 규칙(시스템 전경, 통신 전략, 워크트리·커밋 규칙)은 상위 `../AGENTS.md`에 있다.

## 1. 빌드 · 실행

```bash
npm run dev       # Vite 개발 서버
npm run build     # tsc -b && vite build (타입 오류가 있으면 빌드 실패)
npm run lint      # eslint
npm run format    # prettier --write src/
```

테스트 러너는 아직 없다. 검증은 `npm run build`(타입 체크 겸용)와 `npm run lint`로 한다.

환경 변수는 **`VITE_` 접두사 필수** — `VITE_API_BASE_URL`, `VITE_WS_URL`.

## 2. 기술 선택과 배경

| 용도 | 선택 | 알아둘 것 |
|---|---|---|
| 서버 상태 | React Query (TanStack) | 캐싱·로딩·리트라이를 여기서 처리 |
| 전역 상태 | Zustand | **로그인 사용자, accessToken, 토스트, UI 상태만** |
| HTTP | axios | interceptor로 토큰 자동 첨부 |
| 채팅 | STOMP over WebSocket | `@stomp/stompjs` |
| 알림 | SSE | 서버 → 클라이언트 단방향 |
| UI | Tailwind CSS + shadcn/ui | shadcn 컴포넌트를 직접 수정하지 말고 `className`으로 조정 |
| 폼 | React Hook Form + Zod | Zod 스키마는 별도 파일로 분리해 재사용 |

## 3. 상태 관리 원칙

| 상태 | 관리 방법 |
|---|---|
| 서버 데이터 (API 응답) | React Query |
| 전역 UI 상태 | Zustand |
| 로컬 UI 상태 | `useState` / `useReducer` |
| 실시간 채팅 메시지 | `useState` + STOMP 훅 |
| 실시간 알림 | SSE + Zustand (미읽음 수) |

**React Query로 관리 가능한 서버 데이터를 Zustand에 복사하지 않는다.** 이게 이 프로젝트에서 가장 자주 어기는 규칙이다.

## 4. 라우팅 구조

인증 불필요: `/login`, `/signup`
인증 필요: `/`(홈) · `/routines` `/routines/new` `/routines/:id` · `/challenges` `/challenges/new`
`/challenges/:id` `/challenges/:id/chat` · `/feed` · `/statistics` · `/notifications` · `/profile`

## 5. 디자인 시스템

**항상 `design/` 안에서 가장 높은 버전 디렉토리를 참조한다.** `ls design/`으로 확인 (현재 최신 `v2`).
버전 디렉토리에는 `tokens.css`(CSS 변수), `icons.jsx`, `Routinely.html`(전체 캔버스),
그리고 화면별 `artboards-*.jsx`가 있다.

**화면을 개발하기 전에 해당 화면의 artboard 파일을 반드시 먼저 읽는다.**

### 핵심 원칙

- **Bold Editorial** — 큰 타이포그래피, 강한 대비, 코랄+선셋 그라디언트
- **코랄(`--coral-500`, `#ff5a2b`)은 포인트 색이다** — CTA, 활성 상태, 강조에만 쓴다
- 의미 있는 색상: 완료 `--success`(`#16a34a`) / 경고·마감임박(D-3 이하) `--warning`(`#f59e0b`) / 위험 `#dc2626`
- 폰트 — Geist(영문·숫자), Pretendard(한글)

색상·radius·shadow 값은 `design/{최신버전}/tokens.css`가 기준이다. 하드코딩하지 말고 CSS 변수를 쓴다.

### 진행률 바 색상 (달성률별)

0% `--ink-100` / 1~49% `--sunset-500` / 50~99% `--coral-500` / 100% `--success`

### 네비게이션 (AppHeader)

상단 수평 탭 방식, 높이 64px. 활성 탭은 `background: var(--surface-2)` + `color: var(--text)`,
비활성은 `color: var(--text-muted)` + 투명 배경. 알림 배지는 `--coral-500` dot을 우측 상단에.

## 6. 파일 / 컴포넌트 컨벤션

- 컴포넌트 파일 **PascalCase** — `RoutineCard.tsx`
- 훅 **camelCase + use 접두사** — `useAuth.ts`
- 타입 파일 **camelCase** — `routine.ts`
- 페이지 컴포넌트 — `pages/{도메인}/{PascalCase}Page.tsx`
- 함수형 컴포넌트 + 화살표 함수로 통일
- Props 타입은 컴포넌트 파일 안에 `{ComponentName}Props` interface로 정의
- API 응답 타입은 `src/types/`에 정의하고 **`as` 캐스팅을 최소화한다**

## 7. 실시간 통신

**채팅 (STOMP)** — 연결 `ws://{gateway}/ws/chat` / 구독 `/topic/chat/{roomId}` / 발행 `/app/chat/{roomId}/message`
STOMP 연결은 채팅방 입장 시 수립하고 퇴장 시 해제한다. **마운트/언마운트 정리를 빠뜨리면 메모리 누수가 난다.**

**알림 (SSE)** — `GET /api/v1/notifications/stream`
`EventSource` API는 커스텀 헤더를 못 붙이므로 fetch 기반 스트리밍이나 라이브러리를 쓴다.

## 8. MVP 범위 밖

소셜 로그인 UI · 피드 댓글 · 프로필 이미지 업로드 — 요청받지 않는 한 구현하지 않는다.

## 9. 학습 모드 (프론트엔드)

백엔드의 "핵심 로직을 빈칸으로" 방식은 **사용자가 이미 아는 영역**을 전제한다.
사용자는 프론트엔드 기본기가 없으므로 프론트에는 그 방식을 쓰지 않는다.

**원칙: 빈칸은 "가장 어려운 곳"이 아니라 "사용자가 방금 닿은 수준"(ZPD)에 둔다.**
화면 렌더 → 통합 이음새 순으로 난이도를 낮게 시작해 승급시킨다.

`"프론트 학습 모드"`로 요청하면 한 슬라이스를 4단계로 진행한다.

| 단계 | 주는 것 | 사용자가 하는 것 |
|---|---|---|
| **P0 개념 먼저** | 이 화면에 필요한 개념 4~5개를 한 줄씩 + 코드 어디에 나오는지 | 읽고 감만 잡기 (코드 X) |
| **P1 전부 구현 + 주석** | 동작하는 세로 슬라이스 통째 + "왜 이 줄이 있나" 촘촘한 주석 (**빈칸 0**) | 실행·읽기 + 작은 수정 2~3개 (텍스트 변경, 필드 추가, 일부러 깨뜨려 에러 보기) |
| **P2 작은 빈칸** | 자매 조각에 **방금 배운 수준**의 작은 빈칸(`onClick` 본문, `map` 한 줄) + 답에 가까운 힌트 | `TODO(human)` 채우기 |
| **P3 경계(통합) 빈칸** | 프론트–백 이음새를 빈칸으로: API 호출 함수, 인증 헤더 배선, 로딩/에러/빈 상태, 응답 타입 | 채우기 |

- 읽기 전용(GET → 목록) 슬라이스부터 시작해 React 표면적을 줄이고 **통합 개념**에 집중한다.
  폼·mutation은 다음 슬라이스로 미룬다.
- **P3(이음새)를 최우선 가치로 둔다** — 인증 흐름, 상태 처리, DTO↔프론트 타입 계약이 면접에서 가장 설명하기 좋다.
- 백엔드 학습 모드와는 별개로 병행한다.
