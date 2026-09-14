# Routinely Frontend

소규모 그룹 챌린지로 루틴을 인증하고 꾸준함을 만드는 웹 서비스 **Routinely**의 프론트엔드다.

> **이 저장소만 보고는 무엇을 만들어야 하는지 알 수 없다.** 기획 · 화면 명세 · 프로토타입은
> 문서 저장소 [routinely-docs](https://github.com/routinely-platform/routinely-docs)에 있다. 먼저 거기서 시작한다.

## 먼저 읽기

| 순서 | 문서 | 왜 |
|---|---|---|
| 1 | routinely-docs `docs/onboarding.md` | 프로젝트 전체를 **어떤 순서로** 읽나 |
| 2 | routinely-docs `docs/product/prototype.html` → `screens.md` | 화면이 **무엇이어야 하나**. 프로토타입은 브라우저로 열어 직접 누른다 |
| 3 | routinely-docs `docs/product/policies.md` | 무엇을 할 수 있고 없나 — 제품 규약의 단일 출처 |
| 4 | 이 저장소 [`AGENTS.md`](AGENTS.md) | **프론트 규칙 전부** — 상태 관리 · 라우팅 · 디자인 시스템 · 백엔드 접점 · 실시간 통신 |
| 5 | [`design/v2/`](design/v2/) | 화면을 만들기 전에 **그 화면의 `artboards-*.jsx`** 를 읽는다 |

## 스택

| 용도 | 선택 |
|---|---|
| 기반 | React 19 · TypeScript (strict) · Vite 8 · React Router v7 |
| 서버 상태 | TanStack Query |
| 전역 상태 | Zustand — 로그인 사용자 · access token · UI 상태만 |
| HTTP | axios (`src/api/client.ts` — 토큰 첨부 · 401 갱신) |
| 폼 | React Hook Form + Zod |
| 스타일 | Tailwind CSS 4 |
| 실시간 | `@stomp/stompjs`(채팅) · SSE(알림) |

## 시작하기

**준비** — Node.js 22 LTS 이상 권장(Vite 8)

```bash
npm install
cp .env.example .env.local
npm run dev
```

| 환경 변수 | 로컬 기본값 | 설명 |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | **게이트웨이 한 곳**. 서비스 포트로 직접 호출하지 않는다 |
| `VITE_WS_URL` | `ws://localhost:8080/ws/chat` | 채팅 STOMP |

### 백엔드를 함께 띄우려면

화면 대부분이 게이트웨이(8080)를 부른다. [routinely-backend](https://github.com/routinely-platform/routinely-backend) 저장소에서 —

```bash
./scripts/local-up.sh                                                    # PostgreSQL · Redis · Kafka
./gradlew :services:gateway-service:bootRun --args='--spring.profiles.active=local'
./gradlew :services:user-service:bootRun --args='--spring.profiles.active=local'   # 필요한 서비스만
```

registry(Eureka)와 서비스 목록은 백엔드 `README.md` · `AGENTS.md`를 본다.

## 명령

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | `tsc -b && vite build` — **타입 오류가 있으면 실패한다.** 테스트 러너가 없어 이게 검증이다 |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (`src/`) |

## 폴더

```
src/
├── api/          axios 클라이언트 · 도메인별 API 함수
├── components/   auth · common · layout · profile
├── hooks/        useInitAuth(새로고침 시 세션 복구) · useProfile
├── pages/        라우트 단위 페이지
├── stores/       Zustand (authStore)
├── types/        API 응답 타입
└── utils/        cn · authSession
design/
├── v2/           ← 최신. tokens.css · icons.jsx · Routinely.html(전체 캔버스) · artboards-*.jsx
└── v1/           옛 디자인 — 참고하지 않는다
docs/             프론트 설정 변경 기록
```

## 작업 방식

- **이슈 하나당 워크트리 하나** · 브랜치 `{타입}/#{번호}-{한글설명}` · 커밋 `{타입}: #{번호} {이슈 제목}` · PR 본문에 `Closes #{번호}`
- 자세한 규칙은 [`AGENTS.md`](AGENTS.md) §0

### 로컬 배치

문서끼리 상대경로로 가리키므로 **문서 저장소 안에** 클론한다.

```
routinely/                  ← routinely-docs
├── routinely-backend/
└── routinely-frontend/     ← 이 저장소
```
