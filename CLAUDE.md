# Routinely Frontend — CLAUDE.md

## 1. 기술 스택

| 항목            | 선택                                     | 비고                                |
| --------------- | ---------------------------------------- | ----------------------------------- |
| Language        | TypeScript                               | strict 모드 권장                    |
| Framework       | React 19                                 |                                     |
| Build Tool      | Vite                                     |                                     |
| Routing         | React Router v7                          | SPA 라우팅                          |
| 서버 상태 관리  | React Query (TanStack Query)             | 캐싱, 로딩, 리트라이                |
| 전역 상태 관리  | Zustand                                  | 로그인 사용자, 토스트, UI 상태만    |
| HTTP 클라이언트 | axios                                    | interceptor로 토큰 자동 첨부        |
| 실시간 채팅     | STOMP over WebSocket                     | `@stomp/stompjs`                    |
| 실시간 알림     | SSE (EventSource)                        | 서버 → 클라이언트 단방향            |
| UI 시스템       | Tailwind CSS + shadcn/ui                 |                                     |
| 폼 관리         | React Hook Form + Zod                    |                                     |
| 디자인 시스템   | Bold Editorial + 코랄 포인트 (`#ff5a2b`) | `design/{최신버전}/` 참고 (아래 §3) |

---

## 2. 라우팅 구조

| 경로                   | 페이지                              | 인증 필요 |
| ---------------------- | ----------------------------------- | :-------: |
| `/login`               | 로그인                              |    ❌     |
| `/signup`              | 회원가입                            |    ❌     |
| `/`                    | 홈 (루틴 현황 + 챌린지 요약 + 알림) |    ✅     |
| `/routines`            | 내 루틴 목록                        |    ✅     |
| `/routines/new`        | 루틴 생성                           |    ✅     |
| `/routines/:id`        | 루틴 상세                           |    ✅     |
| `/challenges`          | 챌린지 목록                         |    ✅     |
| `/challenges/new`      | 챌린지 생성                         |    ✅     |
| `/challenges/:id`      | 챌린지 상세 (피드 + 랭킹)           |    ✅     |
| `/challenges/:id/chat` | 챌린지 채팅방                       |    ✅     |
| `/feed`                | 개인 피드                           |    ✅     |
| `/statistics`          | 개인 통계 / 스트릭                  |    ✅     |
| `/notifications`       | 알림 목록                           |    ✅     |
| `/profile`             | 내 프로필                           |    ✅     |

---

## 3. 디자인 시스템

### 디자인 버전 관리 규칙

> **항상 `design/` 폴더에서 가장 높은 버전 디렉토리를 참조할 것.**
> 버전 확인 방법: `ls design/` → 가장 큰 번호 (예: v2 → v3이 생기면 v3 사용)
> 현재 최신 버전: **v2**

각 버전 디렉토리의 구성:

| 파일                     | 역할                                                |
| ------------------------ | --------------------------------------------------- |
| `Routinely.html`         | 전체 디자인 캔버스 (브라우저에서 열어 확인)         |
| `tokens.css`             | CSS 변수 토큰 정의 (색상, 폰트, radius, shadow)     |
| `icons.jsx`              | 인라인 SVG 아이콘 라이브러리 + 로고 컴포넌트        |
| `artboards-system.jsx`   | 로고/컬러/타이포그래피/컴포넌트 쇼케이스            |
| `artboards-home.jsx`     | 로그인, 회원가입, 홈 대시보드, `AppHeader` 컴포넌트 |
| `artboards-routines.jsx` | 루틴 목록/상세/완료/생성, 챌린지 상세/브라우저      |
| `artboards-feed.jsx`     | 피드, 채팅, 통계, 알림, 프로필                      |
| `artboards-proto.jsx`    | 클릭 가능한 인터랙티브 프로토타입                   |

화면 개발 전, 해당 화면의 artboard 파일을 **반드시 먼저 읽고** 구현한다.

### 핵심 원칙

- **Bold Editorial** — 큰 타이포그래피, 강한 대비, 코랄+선셋 그라디언트
- **코랄(`#ff5a2b`)은 포인트** — CTA, 활성 상태, 강조에 사용
- **의미 있는 색상 사용** — 완료=`#16a34a`, 경고=`#f59e0b`, 위험=`#dc2626`
- **폰트** — Geist (영문·숫자), Pretendard (한글)

### 네비게이션 구조 (AppHeader)

v2 디자인의 네비게이션은 **상단 수평 탭** 방식이다.

```
┌─────────────────────────────────────────────────────────┐
│ [로고]  홈  내 루틴  챌린지  피드  통계      [🔔] [아바타] │  ← 높이 64px
└─────────────────────────────────────────────────────────┘
```

- 활성 탭: `background: var(--surface-2)`, 텍스트 색 `var(--text)`
- 비활성 탭: `color: var(--text-muted)`, 배경 투명
- 알림 배지: `background: var(--coral-500)`, 우측 상단 dot
- 전체 헤더: `background: var(--surface)`, `border-bottom: 1px solid var(--border)`

### 핵심 색상 토큰

| 토큰           | 값        | 사용처                                    |
| -------------- | --------- | ----------------------------------------- |
| `--coral-500`  | `#ff5a2b` | CTA 버튼, 활성 메뉴, 진행률 바, 알림 배지 |
| `--coral-100`  | `#ffe5d8` | 활성 메뉴 배경, 배지 배경                 |
| `--sunset-500` | `#ff9248` | 그라디언트 끝 색상                        |
| `--success`    | `#16a34a` | 완료 상태, 체크 아이콘                    |
| `--warning`    | `#f59e0b` | 미완료, 마감 임박(D-3 이하)               |
| `--text`       | `#1a1814` | 제목, 본문                                |
| `--text-muted` | `#5d5a52` | 보조 텍스트, 날짜                         |
| `--bg`         | `#fafaf7` | 페이지 배경                               |
| `--surface`    | `#ffffff` | 카드 배경                                 |
| `--border`     | `#ebe9e2` | 기본 테두리                               |

### 진행률 바 색상 규칙

| 달성률 | 색상           |
| ------ | -------------- |
| 0%     | `--ink-100`    |
| 1~49%  | `--sunset-500` |
| 50~79% | `--coral-500`  |
| 80~99% | `--coral-500`  |
| 100%   | `--success`    |

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

| 상태 종류              | 관리 방법                                  |
| ---------------------- | ------------------------------------------ |
| 서버 데이터 (API 응답) | React Query                                |
| 전역 UI 상태           | Zustand (로그인 정보, accessToken, 토스트) |
| 로컬 UI 상태           | useState / useReducer                      |
| 실시간 채팅 메시지     | useState + STOMP 훅                        |
| 실시간 알림            | SSE + Zustand (미읽음 수)                  |

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

- **디자인 레퍼런스 준수** — 화면 개발 시 `design/{최신버전}/` 참조 (§3 버전 확인 규칙 준수)
- **React Query 우선** — API 데이터는 React Query로 관리, Zustand에 복사 금지
- **MVP에서 구현하지 않는 것**: 소셜 로그인 UI, 피드 댓글, 프로필 이미지 업로드
- **환경 변수**: `VITE_` 접두사 필수 — `VITE_API_BASE_URL`, `VITE_WS_URL`
- **Zod 스키마**: 폼 유효성 검증은 Zod 스키마를 별도 파일로 분리하여 재사용
- **타입 안전성**: API 응답 타입은 `types/`에 정의, `as` 캐스팅 최소화
- **STOMP 연결**: 컴포넌트 마운트/언마운트 시 연결/해제 관리 철저히 (메모리 누수 방지)
