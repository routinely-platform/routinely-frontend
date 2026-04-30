// Routinely — Error states (404, 500, empty)

// ─── 404 — Lost & Found ──────────────────────────
// Tone: 친근하지만 단단한 Bold Editorial. 큰 타이포 + 위트 있는 카피.
// "오늘은 이 페이지를 못 찾는 게 루틴이 됐네요" 같은 도메인 농담.
const NotFoundArtboard = () => (
  <div style={{ width: '100%', height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
    {/* Background numerals — huge editorial 404 */}
    <div aria-hidden style={{
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none', userSelect: 'none', zIndex: 0,
    }}>
      <div style={{
        fontFamily: 'Geist', fontWeight: 800, fontSize: 'clamp(280px, 38vw, 520px)',
        letterSpacing: '-0.06em', lineHeight: 0.85,
        color: 'transparent',
        WebkitTextStroke: '2px var(--coral-100)',
      }}>404</div>
    </div>

    {/* Top bar */}
    <div style={{ position: 'relative', zIndex: 2, height: 64, padding: '0 36px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
      <RoutinelyWordmark size={26}/>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button className="r-btn r-btn--ghost r-btn--sm" style={{ color: 'var(--text-muted)' }}>도움말</button>
        <button className="r-btn r-btn--ghost r-btn--sm" style={{ color: 'var(--text-muted)' }}>로그인</button>
      </div>
    </div>

    {/* Main */}
    <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'grid', gridTemplateColumns: '1.15fr 1fr', alignItems: 'center', gap: 60, padding: '40px 60px' }}>
      {/* Left — copy */}
      <div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'var(--coral-100)', color: 'var(--coral-700)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--coral-500)' }}/>
          ERROR · 404
        </span>
        <h1 style={{ fontSize: 'clamp(56px, 7vw, 96px)', fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.95, margin: '20px 0 0' }}>
          이 페이지는<br/>
          <span style={{ color: 'var(--coral-500)' }}>오늘</span>도 안 보이네요.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 520, lineHeight: 1.55, marginTop: 24 }}>
          주소가 바뀌었거나, 사라진 페이지일 수 있어요.<br/>
          하지만 당신의 스트릭은 안전해요. 🔥
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
          <button className="r-btn r-btn--primary r-btn--lg">
            <Icon name="home" size={16} color="white"/> 홈으로 돌아가기
          </button>
          <button className="r-btn r-btn--ghost r-btn--lg" style={{ border: '1.5px solid var(--border-strong)' }}>
            ← 이전 페이지
          </button>
        </div>

        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12 }}>이건 어때요?</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { label: '오늘의 루틴', icon: 'check' },
              { label: '내 챌린지', icon: 'trophy' },
              { label: '피드 둘러보기', icon: 'feed' },
              { label: '통계', icon: 'chart' },
            ].map(s => (
              <button key={s.label} className="r-btn r-btn--ghost r-btn--sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <Icon name={s.icon} size={13} color="var(--text-muted)"/>{s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right — visual: a "missed" calendar week */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="r-card" style={{ padding: 28, transform: 'rotate(-2deg)', boxShadow: 'var(--sh-3)', maxWidth: 380 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: 'var(--text-dim)' }}>THIS WEEK</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>이번 주 진행</div>
            </div>
            <span className="r-flame" style={{ fontSize: 28 }}>🔥</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginTop: 22 }}>
            {[
              { d: '월', state: 'done' }, { d: '화', state: 'done' }, { d: '수', state: 'done' },
              { d: '목', state: 'done' }, { d: '금', state: 'miss' }, { d: '토', state: 'today' },
              { d: '일', state: 'future' },
            ].map((c, i) => {
              const styles = {
                done: { bg: 'var(--coral-500)', fg: 'white', label: '✓', sub: 'var(--coral-700)' },
                miss: { bg: 'transparent', fg: 'var(--coral-500)', label: '?', sub: 'var(--coral-500)', border: '2px dashed var(--coral-500)' },
                today: { bg: 'var(--ink-800)', fg: 'white', label: i + 1 + 23, sub: 'var(--text-dim)' },
                future: { bg: 'var(--surface-2)', fg: 'var(--text-dim)', label: '·', sub: 'var(--text-dim)' },
              }[c.state];
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)' }}>{c.d}</div>
                  <div style={{
                    width: '100%', aspectRatio: 1, borderRadius: 10,
                    background: styles.bg, color: styles.fg,
                    border: styles.border || 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Geist', fontSize: 16, fontWeight: 700,
                  }}>{styles.label}</div>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: 18, padding: 14, borderRadius: 12,
            background: 'var(--surface-2)', border: '1px dashed var(--border-strong)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--coral-100)', color: 'var(--coral-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>?</div>
            <div style={{ flex: 1, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45 }}>
              <b style={{ color: 'var(--text)' }}>금요일</b>처럼 잠깐 길을 잃을 수도 있죠.<br/>다시 시작하면 돼요.
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div style={{ position: 'relative', zIndex: 2, padding: '14px 36px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-dim)' }}>
      <span>그래도 문제가 계속되면 <a style={{ color: 'var(--coral-600)', fontWeight: 600, textDecoration: 'none' }}>고객지원에 알려주세요 →</a></span>
      <span style={{ fontFamily: 'Geist', letterSpacing: '.04em' }}>routinely.app · 0xR404</span>
    </div>
  </div>
);

Object.assign(window, { NotFoundArtboard });
