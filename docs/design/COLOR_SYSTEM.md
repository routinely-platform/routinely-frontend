# Routinely — 컬러 시스템

> 화이트 베이스 + 크림슨 포인트. 깔끔하고 열정적인 UI.

---

## 핵심 원칙

- **배경은 항상 화이트 계열** — 다크 배경, 다크 사이드바 사용 금지
- **크림슨은 포인트만** — 배경 전체를 크림슨으로 채우지 않는다
- **의미 있는 색상 사용** — 완료=초록, 미완료=앰버, 위험=레드로 일관성 유지
- **색상 남용 금지** — 한 화면에 포인트 색상은 2~3개 이하

---

## 색상 토큰 (CSS Variables)

```css
:root {
  /* ── Primary (크림슨 레드) ── */
  --color-primary:        #DC3545;   /* 메인 포인트 색상 */
  --color-primary-dark:   #BF2233;   /* hover, active, pressed */
  --color-primary-light:  #F07080;   /* 아이콘, 강조 텍스트 */
  --color-primary-tint:   #FDEAEC;   /* 배지 배경, 활성 메뉴 배경 */

  /* ── Semantic (상태별 색상) ── */
  --color-success:        #10B981;   /* 완료 상태 */
  --color-success-tint:   #D1FAE5;   /* 완료 배지 배경 */
  --color-warning:        #F59E0B;   /* 미완료, 마감 임박 */
  --color-warning-tint:   #FEF3C7;   /* 미완료 배지 배경 */
  --color-danger:         #DC3545;   /* 오류, 삭제 (Primary와 동일) */
  --color-danger-tint:    #FDEAEC;   /* 오류 배지 배경 */

  /* ── Neutral (텍스트 & 구조) ── */
  --color-text-primary:   #111827;   /* 제목, 본문 텍스트 */
  --color-text-secondary: #6B7280;   /* 보조 텍스트, 날짜, 설명 */
  --color-text-hint:      #9CA3AF;   /* 플레이스홀더, 힌트 */
  --color-text-disabled:  #D1D5DB;   /* 비활성 텍스트 */

  /* ── Background ── */
  --color-bg-page:        #FAFAFA;   /* 페이지 전체 배경 */
  --color-bg-card:        #FFFFFF;   /* 카드, 패널 배경 */
  --color-bg-input:       #FFFFFF;   /* 인풋 필드 배경 */
  --color-bg-hover:       #F9FAFB;   /* 행/아이템 hover 배경 */
  --color-bg-selected:    #FDEAEC;   /* 선택된 항목 배경 */

  /* ── Border ── */
  --color-border:         #E5E7EB;   /* 기본 테두리 */
  --color-border-focus:   #DC3545;   /* 포커스 테두리 */
  --color-border-error:   #DC3545;   /* 에러 테두리 */
  --color-divider:        #F3F4F6;   /* 구분선 (더 연한 버전) */
}
```

---

## 색상 사용 가이드

### Primary `#DC3545` — 이럴 때 써

| 사용처 | 예시 |
|---|---|
| Primary 버튼 | "루틴 완료", "챌린지 참여", "저장" CTA 버튼 |
| 활성 네비 메뉴 | 사이드바 현재 페이지 표시 |
| 진행률 바 | 챌린지 달성률, 루틴 완료율 |
| 알림 배지 | 채팅 미읽음 수, 알림 수 |
| 링크 텍스트 | 클릭 가능한 텍스트 링크 |
| 포커스 링 | 인풋 필드 포커스 시 테두리 |

```tsx
// 버튼 예시
<button className="bg-[#DC3545] hover:bg-[#BF2233] text-white">
  루틴 완료
</button>

// 활성 메뉴 예시
<div className="bg-[#FDEAEC] text-[#DC3545] font-medium">
  홈
</div>
```

---

### Primary Tint `#FDEAEC` — 이럴 때 써

| 사용처 | 예시 |
|---|---|
| 활성 메뉴 배경 | 사이드바 현재 선택 항목 |
| 배지 배경 | D-day 태그, 카테고리 태그 |
| 선택된 카드 배경 | 선택 상태의 루틴 카드 |
| 알림 항목 배경 | 읽지 않은 알림 행 |
| 인풋 에러 배경 | 유효성 검사 실패 인풋 |

```tsx
// D-day 배지
<span className="bg-[#FDEAEC] text-[#DC3545] text-xs px-2 py-0.5 rounded-full">
  D-18
</span>
```

---

### Success `#10B981` — 이럴 때 써

| 사용처 | 예시 |
|---|---|
| 완료 배지 | "완료" 상태 태그 |
| 완료된 루틴 진행바 | 100% 채워진 프로그레스 바 |
| 체크 아이콘 | 완료 항목 체크마크 |
| 긍정 토스트 | "루틴이 완료됐어요!" 알림 |
| 연속 달성 표시 | 스트릭 표시 |

```tsx
// 완료 배지
<span className="bg-[#D1FAE5] text-[#065F46] text-xs px-2 py-0.5 rounded-full">
  완료
</span>

// 완료 진행바
<div className="bg-[#D1FAE5] rounded-full h-1.5">
  <div className="bg-[#10B981] h-full rounded-full" style={{width: '100%'}} />
</div>
```

---

### Warning `#F59E0B` — 이럴 때 써

| 사용처 | 예시 |
|---|---|
| 미완료 배지 | "미완료" 상태 태그 |
| 마감 임박 표시 | 챌린지 D-3 이하 |
| 경고 토스트 | "오늘 루틴을 아직 안 하셨어요!" |
| 부분 달성 진행바 | 50% 미만 달성률 표시 |

```tsx
// 미완료 배지
<span className="bg-[#FEF3C7] text-[#92400E] text-xs px-2 py-0.5 rounded-full">
  미완료
</span>
```

---

### Neutral — 이럴 때 써

| 색상 | 사용처 |
|---|---|
| `#111827` | 카드 제목, 페이지 타이틀, 중요 본문 |
| `#6B7280` | 날짜, 부가 설명, 메타 정보, 비활성 메뉴 |
| `#9CA3AF` | 인풋 플레이스홀더, 힌트 텍스트 |
| `#E5E7EB` | 카드 테두리, 구분선, 인풋 기본 테두리 |
| `#F3F4F6` | 프로그레스 바 배경, 스켈레톤 로딩 |
| `#FAFAFA` | 페이지 배경 (카드를 띄우기 위한 미묘한 회색) |
| `#FFFFFF` | 카드 배경, 모달 배경, 사이드바 배경 |

---

## 컴포넌트별 색상 정의

### 사이드바 네비게이션

```
배경:           #FFFFFF (흰색)
테두리:         border-right: 1px solid #E5E7EB
비활성 메뉴:    텍스트 #6B7280
활성 메뉴 배경: #FDEAEC
활성 메뉴 텍스트: #DC3545 font-weight: 500
배지 (미읽음):  배경 #DC3545, 텍스트 #FFFFFF
```

### 카드

```
배경:     #FFFFFF
테두리:   1px solid #E5E7EB
반경:     border-radius: 10px
그림자:   없음 (flat 스타일)
hover:    border-color: #D1D5DB (약간 진하게)
```

### 버튼

```
Primary:   배경 #DC3545, 텍스트 #FFFFFF, hover: #BF2233
Secondary: 배경 #FFFFFF, 텍스트 #DC3545, 테두리 #DC3545, hover: #FDEAEC
Ghost:     배경 투명, 텍스트 #6B7280, hover: #F9FAFB
Danger:    배경 #DC3545 (Primary와 동일)
Disabled:  배경 #F3F4F6, 텍스트 #9CA3AF
```

### 인풋 필드

```
기본:   배경 #FFFFFF, 테두리 #E5E7EB
focus:  테두리 #DC3545, outline 없음
error:  테두리 #DC3545, 배경 #FDEAEC
```

### 진행률 바 (Progress Bar)

```
배경 트랙:    #F3F4F6
0%:           #F3F4F6 (빈 상태)
1~49%:        #F59E0B (앰버, 시작 단계)
50~99%:       #DC3545 (크림슨, 진행 중)
100%:         #10B981 (초록, 완료)
```

### 배지 / 태그

```
완료:     배경 #D1FAE5, 텍스트 #065F46
미완료:   배경 #FEF3C7, 텍스트 #92400E
진행중:   배경 #FDEAEC, 텍스트 #DC3545
D-day:    배경 #FDEAEC, 텍스트 #DC3545
종료:     배경 #F3F4F6, 텍스트 #6B7280
```

### 토스트 알림

```
성공:  배경 #D1FAE5, 텍스트 #065F46, 아이콘 #10B981
경고:  배경 #FEF3C7, 텍스트 #92400E, 아이콘 #F59E0B
오류:  배경 #FDEAEC, 텍스트 #9B1C1C, 아이콘 #DC3545
정보:  배경 #F3F4F6, 텍스트 #111827, 아이콘 #6B7280
```

---

## 기능별 색상 매핑

### 루틴 상태

| 상태 | 색상 | 배지 배경 | 배지 텍스트 |
|---|---|---|---|
| 완료 | `#10B981` | `#D1FAE5` | `#065F46` |
| 미완료 | `#F59E0B` | `#FEF3C7` | `#92400E` |
| 건너뜀 | `#9CA3AF` | `#F3F4F6` | `#6B7280` |

### 챌린지 상태

| 상태 | 색상 | 배지 배경 | 배지 텍스트 |
|---|---|---|---|
| 진행중 | `#DC3545` | `#FDEAEC` | `#DC3545` |
| 마감임박 (D-3 이하) | `#F59E0B` | `#FEF3C7` | `#92400E` |
| 대기중 | `#6B7280` | `#F3F4F6` | `#6B7280` |
| 종료 | `#9CA3AF` | `#F3F4F6` | `#6B7280` |

### 달성률 색상 (진행률 바)

| 달성률 | 진행 바 색상 | 의미 |
|---|---|---|
| 0% | `#F3F4F6` | 시작 전 |
| 1~49% | `#F59E0B` | 분발 필요 |
| 50~79% | `#DC3545` | 순항 중 |
| 80~99% | `#DC3545` | 거의 완료 |
| 100% | `#10B981` | 달성! |

---

## Tailwind CSS 커스텀 설정

`tailwind.config.js`에 아래 내용 추가:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#DC3545',
          dark:    '#BF2233',
          light:   '#F07080',
          tint:    '#FDEAEC',
        },
        success: {
          DEFAULT: '#10B981',
          tint:    '#D1FAE5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          tint:    '#FEF3C7',
        },
      },
    },
  },
}
```

사용 예시:
```tsx
<button className="bg-primary hover:bg-primary-dark text-white">
  완료 처리
</button>

<span className="bg-primary-tint text-primary">
  진행중
</span>

<span className="bg-success-tint text-[#065F46]">
  완료
</span>
```

---

## 절대 하지 말아야 할 것들

```
❌ 사이드바 배경을 어두운 색으로 설정
❌ 페이지 배경 전체를 #DC3545로 채우기
❌ 버튼/링크가 아닌 일반 텍스트에 크림슨 사용
❌ 같은 화면에 success/warning/primary 모두 동시 사용
❌ 진행바 배경에 크림슨 사용 (배경은 항상 #F3F4F6)
❌ 흰 배경에 흰 텍스트 (당연하지만)
❌ 배지 배경과 텍스트를 같은 색상 계열로 사용 (명도 차이 확보 필수)
```

---

## 색상 접근성 (Contrast Ratio)

| 조합 | 비율 | 기준 |
|---|---|---|
| `#DC3545` on `#FFFFFF` | 4.9:1 | ✅ AA |
| `#111827` on `#FFFFFF` | 16.1:1 | ✅ AAA |
| `#6B7280` on `#FFFFFF` | 4.6:1 | ✅ AA |
| `#FFFFFF` on `#DC3545` | 4.9:1 | ✅ AA |
| `#065F46` on `#D1FAE5` | 6.2:1 | ✅ AA |
| `#92400E` on `#FEF3C7` | 5.1:1 | ✅ AA |
