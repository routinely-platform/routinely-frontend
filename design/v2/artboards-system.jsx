// Routinely — Design System & Logo showcase artboards

const LogoSystemArtboard = () => (
  <div style={{ width: '100%', height: '100%', padding: 40, background: 'var(--bg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 28 }}>
    <div>
      <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>Identity / Logo System</div>
      <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>Routinely<span style={{ color: 'var(--coral-500)' }}>.</span></div>
      <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4, maxWidth: 420 }}>
        루프와 체크의 결합 — 끝없이 반복되는 루틴 위에 완료의 체크가 얹힌다.
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr', gap: 16 }}>
      <div className="r-card" style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RoutinelyWordmark size={56} />
      </div>
      <div className="r-card" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RoutinelyVertical size={64} />
      </div>
      <div className="r-card" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RoutinelyMark size={88} />
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={{ padding: 32, background: 'var(--ink-800)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RoutinelyWordmark size={48} color="white" mark="var(--coral-400)" />
      </div>
      <div style={{ padding: 32, background: 'var(--coral-500)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RoutinelyWordmark size={48} color="white" mark="white" />
      </div>
    </div>

    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 8 }}>
        <RoutinelyMark size={18} /><span style={{ fontWeight: 600, fontSize: 13 }}>Favicon</span>
      </div>
      <div style={{ background: 'var(--ink-800)', padding: '14px', borderRadius: 12, display: 'inline-flex' }}>
        <RoutinelyMark size={32} color="var(--coral-400)" accent="white" />
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: 14, borderRadius: 12, display: 'inline-flex' }}>
        <RoutinelyMark size={32} />
      </div>
    </div>
  </div>
);

const ColorSystemArtboard = () => {
  const ramp = (name, prefix) => (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>{name}</div>
      <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', height: 56 }}>
        {[100, 200, 300, 400, 500, 600, 700, 800].map(s => (
          <div key={s} style={{ flex: 1, background: `var(--${prefix}-${s})`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6, fontSize: 10, fontWeight: 600, color: s >= 500 ? 'white' : 'var(--ink-700)' }}>{s}</div>
        ))}
      </div>
    </div>
  );
  return (
    <div style={{ width: '100%', height: '100%', padding: 40, background: 'var(--bg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>Foundation / Color</div>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>Coral & Sunset</div>
      </div>
      {ramp('Primary · Coral', 'coral')}
      {ramp('Neutral · Ink', 'ink')}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Semantic</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[['Success', 'var(--success)'], ['Warning', 'var(--warning)'], ['Danger', 'var(--danger)'], ['Info', 'var(--info)']].map(([n, c]) => (
            <div key={n} style={{ background: c, color: 'white', padding: 14, borderRadius: 10, fontWeight: 600, fontSize: 13 }}>{n}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TypographyArtboard = () => (
  <div style={{ width: '100%', height: '100%', padding: 40, background: 'var(--bg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 18 }}>
    <div>
      <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>Foundation / Typography</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Geist (EN) · Pretendard (KR)</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Display · 80/700</div><div style={{ fontSize: 80, fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.04em' }}>Show up.</div></div>
      <div><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>H1 · 42/700</div><div style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.025em' }}>오늘도 한 번 더</div></div>
      <div><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>H3 · 22/600</div><div style={{ fontSize: 22, fontWeight: 600 }}>아침 6시 러닝 챌린지</div></div>
      <div><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Body · 15/400</div><div style={{ fontSize: 15, lineHeight: 1.55, maxWidth: 480 }}>작은 약속을 매일 지키면 큰 변화가 됩니다. 친구들과 함께라면 훨씬 가볍게.</div></div>
      <div><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Caption · 11/600 · uppercase</div><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--coral-600)' }}>21 day streak</div></div>
    </div>
  </div>
);

const ComponentsArtboard = () => (
  <div style={{ width: '100%', height: '100%', padding: 40, background: 'var(--bg)', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
    <div>
      <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>Components</div>
      <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>Building blocks</div>
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>BUTTONS</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="r-btn r-btn--primary r-btn--lg"><Icon name="check" size={18}/>완료하기</button>
        <button className="r-btn r-btn--primary">참여하기</button>
        <button className="r-btn r-btn--secondary">초대 보내기</button>
        <button className="r-btn r-btn--ghost">취소</button>
        <button className="r-btn r-btn--primary r-btn--sm">+ 추가</button>
      </div>
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>BADGES · CHALLENGE STATUS</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className="r-badge r-badge--waiting">● Waiting</span>
        <span className="r-badge r-badge--active">● Active</span>
        <span className="r-badge r-badge--ended">● Ended</span>
        <span className="r-badge r-badge--success"><Icon name="check" size={11}/>Completed</span>
      </div>
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>INPUTS & AVATARS</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input className="r-input" placeholder="닉네임" style={{ maxWidth: 200 }} />
        <div style={{ display: 'flex' }}>
          {['#FF8A65', '#FFD166', '#A5D8FF', '#B5EAD7'].map((c, i) => (
            <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: c, marginLeft: i ? -8 : 0, border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12 }}>{['김','이','박','최'][i]}</div>
          ))}
        </div>
      </div>
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>STREAK COUNTER</div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div className="r-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="r-flame" style={{ fontSize: 24 }}>🔥</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, fontFamily: 'Geist' }}>21<span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>일</span></div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>Current streak</div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>TOAST</div>
      <div style={{ background: 'var(--ink-800)', color: 'white', padding: '14px 18px', borderRadius: 14, display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: 'var(--sh-3)' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--coral-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={16} color="white"/></div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>지수님이 챌린지에 참여했어요</div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>방금 전 · 아침 6시 러닝</div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { LogoSystemArtboard, ColorSystemArtboard, TypographyArtboard, ComponentsArtboard });
