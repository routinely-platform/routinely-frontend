import { Link, useNavigate } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

type DayState = 'done' | 'miss' | 'today' | 'future'

const WEEK_DAYS: Array<{ label: string; state: DayState }> = [
  { label: '월', state: 'done' },
  { label: '화', state: 'done' },
  { label: '수', state: 'done' },
  { label: '목', state: 'done' },
  { label: '금', state: 'miss' },
  { label: '토', state: 'today' },
  { label: '일', state: 'future' },
]

const CELL_CLASS: Record<DayState, string> = {
  done: styles.calCellDone,
  miss: styles.calCellMiss,
  today: styles.calCellToday,
  future: styles.calCellFuture,
}

const CELL_LABEL: Record<DayState, string> = {
  done: '✓',
  miss: '?',
  today: String(new Date().getDate()),
  future: '·',
}


export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div aria-hidden className={styles.backdrop}>404</div>

      <div className={styles.content}>
        <div className={styles.copy}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} />
            ERROR · 404
          </span>

          <h1 className={styles.heading}>
            잠깐 길을 <span className={styles.headingAccent}>잃었</span>네요.
          </h1>

          <p className={styles.sub}>
            주소가 바뀌었거나, 사라진 페이지일 수 있어요.<br />
            하지만 당신의 스트릭은 안전해요. 🔥
          </p>

          <div className={styles.actions}>
            <Link to="/" className={styles.btnPrimary}>
              홈으로 돌아가기
            </Link>
            <button type="button" className={styles.btnGhost} onClick={() => navigate(-1)}>
              ← 이전 페이지
            </button>
          </div>

        </div>

        <div className={styles.visual}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardEyebrow}>THIS WEEK</div>
                <div className={styles.cardTitle}>이번 주 진행</div>
              </div>
              <span className={styles.flame}>🔥</span>
            </div>

            <div className={styles.calendar}>
              {WEEK_DAYS.map(({ label, state }) => (
                <div key={label} className={styles.calDay}>
                  <div className={styles.calDayLabel}>{label}</div>
                  <div className={`${styles.calCell} ${CELL_CLASS[state]}`}>
                    {CELL_LABEL[state]}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.cardNote}>
              <div className={styles.cardNoteIcon}>?</div>
              <p className={styles.cardNoteText}>
                <strong className={styles.cardNoteStrong}>금요일</strong>처럼 잠깐 길을
                잃을 수도 있죠.<br />다시 시작하면 돼요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
