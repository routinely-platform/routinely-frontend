# Routinely Frontend

TypeScript(strict) / React 19 / Vite / React Router v7 SPA.
**이 파일 하나로 프론트 작업에 필요한 규칙이 모두 담긴다.** 상위 디렉토리 파일에 의존하지 않는다 —
Codex는 git 저장소 루트 위로 올라가지 못하기 때문이다.

## 0. 작업 규칙

### 시작하기 전에

**저장소 루트에 `WORKPLAN.md`가 있으면 먼저 읽는다.** 지금 브랜치의 목표·설계 결정·실행 계획이
거기 있다. `.gitignore` 대상이라 워크트리 안에만 존재하고 커밋에 실리지 않는다.
작업하며 설계가 바뀌면 `WORKPLAN.md`를 갱신한다. 이 파일(`AGENTS.md`)은 건드리지 않는다.

### 워크트리 / 브랜치

- 이슈 하나당 워크트리 하나. `origin/main` 기준으로 생성한다.
- 브랜치명 `{타입}/#{번호}-{한글설명}`, 워크트리 폴더명 `{타입}-{번호}-{영문설명}`.
- 워크트리끼리 파일을 복사해 옮기지 않는다. 공통 변경은 `main`에 넣고 rebase로 전파한다.
- 규칙 파일을 고쳤으면 `main`에 머지된 뒤에 새 워크트리를 만든다. 워크트리는 `origin/main`
  기준으로 생기므로 로컬에만 있으면 반영되지 않는다.

### 커밋 / PR

- 커밋 메시지 `{타입}: #{번호} {이슈 제목}`, PR 본문에 `Closes #{번호}` 필수.
- force push 금지.

### 규칙을 어디에 쓰나

| 내용 | 위치 |
|---|---|
| 프론트 전반 규칙 | **이 파일** |
| 이번 브랜치의 설계·계획 | `WORKPLAN.md` |
| 디자인 배경·결정 | `docs/` — 규칙이 아니라 문서다. 여기엔 경로만 적는다 |

이 파일을 브랜치별로 만들지 않는다. 워크트리 루트가 곧 저장소 루트라 경로가 겹치고,
커밋하면 PR에 실려 `main`으로 넘어간다. 브랜치 단위 내용은 `WORKPLAN.md`에 둔다.

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

## 7. 백엔드 접점

**모든 요청은 게이트웨이(8080) 한 곳으로 간다.** 서비스별 포트로 직접 호출하지 않는다.
게이트웨이가 라우팅·JWT 검증·Rate Limiting을 담당한다. `VITE_API_BASE_URL`이 그 주소다.

| 도메인 | 경로 접두사 |
|---|---|
| 회원 / 인증 / 프로필 | `/api/v1/users`, `/api/v1/auth` |
| 루틴 템플릿 | `/api/v1/routine-templates` |
| 루틴 인스턴스 | `/api/v1/routines` |
| 수행 기록 | `/api/v1/routine-executions` |
| 피드 / 리액션 | `/api/v1/feed` |
| 통계 | `/api/v1/statistics` |
| 카테고리 | `/api/v1/categories` |
| 챌린지 / 참여 / 랭킹 | `/api/v1/challenges` |
| 채팅 | `/api/v1/chat` + STOMP |
| 알림 | `/api/v1/notifications` + SSE |

> 루틴 도메인은 **한 서비스(routine-service)가 담당하지만 경로는 다섯으로 갈린다.**
> `/api/v1/routines` 하나로 뭉뚱그리면 게이트웨이 라우트와 어긋난다.

홈 화면은 게이트웨이가 여러 서비스를 병렬 집계해 `/api/v1/home` 하나로 내려준다.
개별 API를 여러 번 호출해 조립하지 않는다.

## 8. 실시간 통신

**채팅 (STOMP)** — 연결 `ws://{gateway}/ws/chat` / 구독 `/topic/chat.room.{roomId}` / 발행 `/app/chat.send`

> 구독·발행 경로는 **점(`.`) 구분**이다. 발행은 목적지에 `roomId`를 넣지 않고 **메시지 바디에 담는다**
> (`{ roomId, messageType, content, imageUrl }`). 백엔드 `docs/requirements/api-spec.md` 4-2가 기준이다.
STOMP 연결은 채팅방 입장 시 수립하고 퇴장 시 해제한다. **마운트/언마운트 정리를 빠뜨리면 메모리 누수가 난다.**

**알림 (SSE)** — `GET /api/v1/notifications/stream`
`EventSource` API는 커스텀 헤더를 못 붙이므로 fetch 기반 스트리밍이나 라이브러리를 쓴다.

## 9. 문서 갱신 규칙

### 9-1. 제품 규약이 바뀌면 — `docs/product/policies.md`

화면을 만들다 **규약이 정해지거나 뒤집히면** 워크스페이스 루트
`../../docs/product/policies.md`(워크트리에서는 두 단계 위)의 해당 항목과 **상태를 함께 갱신한다.**
🟡(미정)가 🟢(확정)이 되는 순간을 놓치지 않는다.

**화면이 규약의 유일한 도달 경로인 경우가 많다.** 예를 들어 백필(지난 날짜 인증)은 API가 허용해도
화면에 진입 지점이 없으면 사용자가 도달할 수 없다. 그래서 백필은 홈·통계 달력·루틴 상세 달력
**세 곳**에 진입 지점을 둔다(`screens.md` §3·§6·§13).

이런 항목은 `policies.md` §9 불일치 대장에 남는다. **남아 있는 게 곧 할 일이고, 처리하면 지운다.**

### 9-2. 화면 명세 — `docs/product/screens.md` + `prototype.html`

화면 구성·상태·문구가 바뀌면 갱신한다. **`screens.md`와 `prototype.html`은 한 쌍이다** —
어긋나면 남에게 보여줄 수 없으므로 같이 고친다. 특히 **경고·확인 문구**는 정책의 일부다
(탈퇴 확인, 과거 시작일 경고, 템플릿 수정 안내 등).

### 9-3. 백엔드 계약이 바뀌면

REST는 Swagger를, **이벤트·gRPC는 백엔드의
`docs/architecture/service-interaction-map.md`**(Mermaid 관계도)를 본다.
프론트가 직접 고칠 일은 없지만, **채팅(STOMP)·알림(SSE) 경로가 바뀌면** §7·§8 표를 함께 고친다.

### 9-4. 포트폴리오 — `../../portfolio/`

화면 슬라이스를 백엔드에 연결하거나 새 패턴을 도입하면 `interview-qa.md`·`tech-story.md`에 남긴다.
프론트–백 이음새(인증 헤더 배선, 로딩·에러·빈 상태, DTO↔타입 계약)가 특히 설명하기 좋다.

## 10. MVP 범위 밖

소셜 로그인 UI · 피드 댓글 — 요청받지 않는 한 구현하지 않는다.

> 프로필 이미지 업로드는 #56에서 구현되어 범위 밖에서 제외됐다.

## 11. 학습 모드 (프론트엔드)

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
