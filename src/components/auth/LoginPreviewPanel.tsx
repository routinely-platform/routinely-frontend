import { useState } from 'react'
import styles from './LoginPreviewPanel.module.css'

interface PreviewRoutine {
  title: string
  meta: string
  status: string
  done: boolean
}

// 로그인 후 홈의 규칙을 그대로 따른다 — 진행바 분모는 지정형만(1 / 3), 빈도형은 "언제든"
const PREVIEW_ROUTINES: PreviewRoutine[] = [
  { title: '아침 물 한 잔', meta: '07:00 · 매일', status: '완료', done: true },
  { title: '명상 10분', meta: '07:30 · 매일', status: '지금', done: false },
  { title: '러닝 5km', meta: '이번 주 3 / 3', status: '언제든', done: false },
]

const previewDateFormat = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

const formatToday = () => previewDateFormat.format(new Date())

export default function LoginPreviewPanel() {
  const [today] = useState(formatToday)

  return (
    <aside className={styles.panel} aria-label="로그인 후 오늘 화면 미리보기">
      <div>
        <p className={styles.kicker}>로그인하면 바로</p>
        <h2 className={styles.title}>
          오늘 해야 할 것만
          <br />
          먼저 보여드려요.
        </h2>
      </div>

      <div className={styles.card} aria-hidden="true">
        <div className={styles.cardHead}>
          <div>
            <small>{today}</small>
            <strong>오늘의 루틴</strong>
          </div>
          <b>1 / 3</b>
        </div>
        <div className={styles.track}>
          <i />
        </div>
        {PREVIEW_ROUTINES.map((routine) => (
          <div
            key={routine.title}
            className={`${styles.row} ${routine.done ? styles.rowDone : ''}`}
          >
            <span>{routine.done ? '✓' : ''}</span>
            <div>
              <strong>{routine.title}</strong>
              <small>{routine.meta}</small>
            </div>
            <b>{routine.status}</b>
          </div>
        ))}
      </div>

      <p className={styles.foot}>통계나 자랑보다, 오늘 할 일을 먼저.</p>
    </aside>
  )
}
