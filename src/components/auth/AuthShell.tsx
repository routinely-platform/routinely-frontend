import styles from './AuthShell.module.css'

interface Props {
  variant: 'split' | 'centered'
  children: React.ReactNode
}

function HeroPanel() {
  return (
    <div className={styles.hero}>
      <div
        className={styles.heroOrb}
        style={{ top: -100, right: -100, width: 400, height: 400, border: '2px solid rgba(255,255,255,.15)' }}
      />
      <div
        className={styles.heroOrb}
        style={{ bottom: -150, left: -50, width: 500, height: 500, border: '2px solid rgba(255,255,255,.1)' }}
      />
      <div className={styles.heroTop}>Streak · Day 21</div>
      <div className={styles.heroBottom}>
        <div className={styles.heroNumber}>
          21<span className={styles.heroFire}>🔥</span>
        </div>
        <p className={styles.heroQuote}>
          "가장 어려운 건 시작이 아니라,
          <br />
          어제도 했다는 사실을 오늘 기억하는 일이에요."
        </p>
        <div className={styles.heroSocialProof}>
          <div className={styles.avatarStack} aria-hidden="true">
            <div className={styles.avatarItem} style={{ background: '#ffd166' }}>
              지
            </div>
            <div className={styles.avatarItem} style={{ background: '#06d6a0' }}>
              민
            </div>
            <div className={styles.avatarItem} style={{ background: '#118ab2' }}>
              준
            </div>
          </div>
          <div className={styles.heroSub}>2,341명이 오늘 인증 완료</div>
        </div>
      </div>
    </div>
  )
}

export default function AuthShell({ variant, children }: Props) {
  if (variant === 'split') {
    return (
      <div className={styles.shell}>
        <div className={styles.formPane}>{children}</div>
        <HeroPanel />
      </div>
    )
  }

  return (
    <div className={styles.shellCentered}>
      <div className={styles.centeredInner}>{children}</div>
    </div>
  )
}
