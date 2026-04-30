// Routinely — Routines, Challenges, Routine Detail/Complete artboards

const ROUTINE_CATEGORIES = [
  { id: 'all', name: '전체', emoji: '✨', color: 'var(--ink-600)' },
  { id: 'fitness', name: '운동', emoji: '💪', color: 'var(--coral-500)' },
  { id: 'study', name: '공부', emoji: '📚', color: 'var(--info)' },
  { id: 'mind', name: '마음챙김', emoji: '🧘', color: '#9D4EDD' },
  { id: 'life', name: '생활', emoji: '🌱', color: 'var(--success)' },
  { id: 'hobby', name: '취미', emoji: '🎨', color: 'var(--sunset-500)' },
  { id: 'health', name: '건강', emoji: '💊', color: '#EF476F' },
];

// ─── My Routines (split layout — list + month calendar) ─────────
// Left rail: routine cards with progress bar + actions.
// Right rail: month calendar showing aggregated daily completion across
// ALL routines + recent activity heatmap. Today is April 29, 2026 (수요일).
const RoutinesArtboard = () => {
  const [activeCat, setActiveCat] = React.useState('all');
  const allRoutines = [
    { name: '아침 러닝 30분', emoji: '🏃', cat: 'fitness', time: '07:00', since: '03.01', tag: '3월 러닝', progress: 83, status: 'done', total: 31, achieved: 25 },
    { name: '독서 20페이지', emoji: '📖', cat: 'study',   time: '09:00', since: '02.15', progress: 90, status: 'done', total: 31, achieved: 28 },
    { name: '명상 10분',     emoji: '🧘', cat: 'mind',    time: '12:00', since: '03.01', progress: 60, status: 'progress', total: 31, achieved: 18 },
    { name: '비타민',         emoji: '💊', cat: 'health',  time: '08:00', since: '01.10', progress: 95, status: 'done', total: 31, achieved: 30 },
    { name: '저녁 산책',       emoji: '🚶', cat: 'life',    time: '20:00', since: '03.10', progress: 45, status: 'progress', total: 25, achieved: 11 },
  ];
  const filtered = activeCat === 'all' ? allRoutines : allRoutines.filter(r => r.cat === activeCat);

  // April 2026 calendar (today = 29, 수요일)
  // Apr 1 2026 = 수요일 → first row [_,_,_,1,2,3,4]
  const today = 29;
  // mock daily completion: how many of the day's scheduled routines were done
  const dayData = {};
  for (let d = 1; d <= 30; d++) {
    if (d > today) dayData[d] = { state: 'future' };
    else if (d === today) dayData[d] = { state: 'today', count: 2, total: 5 };
    else if ([3, 12, 22].includes(d)) dayData[d] = { state: 'miss' };
    else dayData[d] = { state: 'done', count: Math.random() > 0.3 ? 5 : 4, total: 5 };
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <AppHeader active="routines" />
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>루틴 관리</h1>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>내 루틴을 만들고 수행 현황을 확인하세요</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="r-btn r-btn--ghost r-btn--sm" style={{ border: '1px solid var(--border-strong)' }}>📅 달력 보기</button>
            <button className="r-btn r-btn--primary r-btn--sm"><Icon name="plus" size={14}/>루틴 추가</button>
          </div>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {ROUTINE_CATEGORIES.map(c => {
            const on = activeCat === c.id;
            return (
              <button key={c.id} onClick={() => setActiveCat(c.id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 999,
                border: on ? 'none' : '1.5px solid var(--border-strong)',
                background: on ? 'var(--coral-500)' : 'var(--surface)',
                color: on ? 'white' : 'var(--text)',
                fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                boxShadow: on ? 'var(--sh-coral)' : 'none',
              }}>
                <span>{c.emoji}</span><span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Split layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* ── Left: Routine list ─────────────────────────── */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>활성 루틴 ({filtered.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((r, i) => {
                const cat = ROUTINE_CATEGORIES.find(c => c.id === r.cat);
                const barColor = r.progress >= 80 ? 'var(--success)' : r.progress >= 50 ? 'var(--sunset-500)' : 'var(--coral-500)';
                const statusBadge = r.status === 'done'
                  ? { label: '완료', bg: 'var(--success-bg)', fg: 'var(--success)' }
                  : { label: '진행중', bg: '#ede4ff', fg: '#7a4ad9' };
                return (
                  <div key={i} className="r-card" style={{ padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ fontSize: 26, lineHeight: 1, marginTop: 2 }}>{r.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{r.name}</div>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: statusBadge.bg, color: statusBadge.fg, flexShrink: 0 }}>{statusBadge.label}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>매일 · {r.time}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>{cat.emoji} {cat.name}</span>
                          <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>📅 {r.since}~</span>
                          {r.tag && <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>🏃 {r.tag}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 12, marginBottom: 5 }}>
                        <span style={{ color: 'var(--text-muted)' }}>이번 달 달성률</span>
                        <span style={{ fontWeight: 700, fontFamily: 'Geist', color: barColor, fontSize: 14 }}>{r.progress}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--ink-100)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${r.progress}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width .4s' }}/>
                      </div>
                    </div>

                    {/* Action row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="r-btn r-btn--ghost r-btn--sm" style={{ padding: '5px 10px', fontSize: 12, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>✏️ 수정</button>
                        <button className="r-btn r-btn--ghost r-btn--sm" style={{ padding: '5px 10px', fontSize: 12, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>📋 상세</button>
                      </div>
                      <button className="r-btn r-btn--sm" style={{ padding: '5px 12px', fontSize: 12, background: 'var(--coral-50)', color: 'var(--coral-700)', fontWeight: 600 }}>삭제</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: Calendar + heatmap ───────────────────── */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>4월 수행 달력</div>
            <div className="r-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Geist', letterSpacing: '-0.02em' }}>2026년 4월</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border-strong)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12 }}>◀</button>
                  <button style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border-strong)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12 }}>▶</button>
                </div>
              </div>

              {/* DOW header */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
                {['월','화','수','목','금','토','일'].map((d, i) => (
                  <div key={d} style={{ fontSize: 10, fontWeight: 700, color: i >= 5 ? 'var(--coral-600)' : 'var(--text-dim)', textAlign: 'center', letterSpacing: '.04em' }}>{d}</div>
                ))}
              </div>

              {/* Day cells — Apr 1 2026 = 수, so [_,_,_,1,2,3,4] etc */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {/* Empty leading cells: Mon, Tue (Wed is index 2) */}
                {[0,1].map(i => <div key={'e'+i} style={{ aspectRatio: '1' }}/>)}
                {Array.from({ length: 30 }, (_, i) => i + 1).map(d => {
                  const data = dayData[d];
                  const isWeekend = (d + 2) % 7 === 5 || (d + 2) % 7 === 6; // sat/sun
                  let bg = 'transparent', color = 'var(--text-muted)', border = '1px solid var(--border)';
                  if (data.state === 'today') { bg = 'var(--coral-500)'; color = 'white'; border = 'none'; }
                  else if (data.state === 'done') {
                    bg = 'var(--success-bg)'; color = 'var(--success)'; border = 'none';
                  } else if (data.state === 'miss') {
                    bg = '#ffe2e5'; color = 'var(--danger)'; border = 'none';
                  } else if (data.state === 'future') {
                    bg = 'transparent'; color = isWeekend ? 'var(--coral-300)' : 'var(--text-dim)';
                  }
                  return (
                    <div key={d} style={{
                      aspectRatio: '1', borderRadius: 8, background: bg, border,
                      color, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: data.state === 'today' || data.state === 'miss' ? 700 : 600,
                      fontFamily: 'Geist',
                      position: 'relative',
                    }}>
                      <span>{d}</span>
                      {data.state === 'done' && <span style={{ fontSize: 8, opacity: 0.7 }}>{data.count}/{data.total}</span>}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--success-bg)' }}/>완료</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#ffe2e5' }}/>미완료</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--coral-500)' }}/>오늘</span>
              </div>
            </div>

            {/* Heatmap — last 12 weeks */}
            <div className="r-card" style={{ padding: 18, marginTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>최근 12주별 활동</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, 1fr)', gap: 3 }}>
                {Array.from({ length: 7 * 12 }).map((_, i) => {
                  const v = Math.random();
                  const lvl = v < 0.2 ? 0 : v < 0.45 ? 1 : v < 0.7 ? 2 : v < 0.9 ? 3 : 4;
                  const colors = ['var(--ink-100)', '#c9ecd2', '#7fd496', '#16a34a', '#0e6f33'];
                  return <div key={i} style={{ aspectRatio: '1', borderRadius: 3, background: colors[lvl] }}/>;
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                낮음
                {['var(--ink-100)', '#c9ecd2', '#7fd496', '#16a34a', '#0e6f33'].map((c, i) => (
                  <span key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }}/>
                ))}
                높음
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Routine Detail ─────────────────────────
// Shows full info + 30-day calendar history + completion CTA.
// Tapping "오늘 완료" opens the RoutineCompleteModal artboard.
const RoutineDetailArtboard = () => {
  // 30-day mock history (1 = done, 0 = miss, -1 = future)
  const today = 17;
  const history = Array.from({ length: 30 }, (_, i) => {
    if (i > today) return -1;
    if (i === today) return 0; // today, not yet
    return Math.random() > 0.18 ? 1 : 0;
  });
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <AppHeader active="routines"/>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Hero */}
        <div style={{ padding: '24px 36px 20px', borderBottom: '1px solid var(--border)' }}>
          <button className="r-btn r-btn--ghost r-btn--sm" style={{ marginBottom: 12, color: 'var(--text-muted)' }}>← 내 루틴</button>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ width: 88, height: 88, borderRadius: 22, background: 'var(--coral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, flexShrink: 0 }}>🏃</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'var(--coral-100)', color: 'var(--coral-700)', letterSpacing: '.04em' }}>💪 운동</span>
              <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: '6px 0 4px' }}>러닝 5km</h1>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 540 }}>아침 공원에서 가볍게 한 바퀴. 페이스보다는 나가는 것 자체에 의미.</div>
              <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: 13, color: 'var(--text-muted)' }}>
                <span><Icon name="clock" size={13} style={{ verticalAlign: -2 }}/> 매일 18:00</span>
                <span><Icon name="bell" size={13} style={{ verticalAlign: -2 }}/> 알림 켜짐</span>
                <span><Icon name="trophy" size={13} style={{ verticalAlign: -2 }}/> 21일 챌린지 연결</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="r-btn r-btn--ghost r-btn--sm" style={{ border: '1px solid var(--border-strong)' }}><Icon name="settings" size={14}/> 수정</button>
            </div>
          </div>

          {/* Stat strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
            {[
              { label: 'CURRENT STREAK', value: '7', sub: '🔥 days', color: 'var(--coral-500)' },
              { label: 'BEST STREAK', value: '12', sub: 'days', color: 'var(--text)' },
              { label: '이번 달 완료율', value: '87%', sub: '20/23', color: 'var(--success)' },
              { label: '총 완료', value: '64', sub: 'times', color: 'var(--info)' },
            ].map(s => (
              <div key={s.label} className="r-card" style={{ padding: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', color: 'var(--text-dim)' }}>{s.label}</div>
                <div style={{ fontSize: 30, fontWeight: 700, fontFamily: 'Geist', color: s.color, lineHeight: 1.1, marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px 36px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          {/* 30-day history */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>최근 30일</h3>
            <div className="r-card" style={{ padding: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8 }}>
                {history.map((v, i) => (
                  <div key={i} title={`Day ${i+1}`} style={{
                    aspectRatio: '1', borderRadius: 8,
                    background: v === 1 ? 'var(--coral-500)' : v === 0 && i === today ? 'var(--coral-100)' : v === 0 ? 'var(--ink-100)' : 'transparent',
                    border: v === -1 ? '1.5px dashed var(--border)' : v === 0 && i === today ? '2px solid var(--coral-500)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: v === 1 ? 'white' : 'var(--text-dim)', fontFamily: 'Geist',
                  }}>{i + 1}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', marginTop: 14, flexWrap: 'wrap' }}>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--coral-500)', verticalAlign: -1, marginRight: 4 }}/>완료</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--ink-100)', verticalAlign: -1, marginRight: 4 }}/>놓침</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, border: '2px solid var(--coral-500)', verticalAlign: -1, marginRight: 4 }}/>오늘</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, border: '1.5px dashed var(--border-strong)', verticalAlign: -1, marginRight: 4 }}/>예정</span>
              </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '20px 0 12px' }}>최근 인증</h3>
            <div className="r-card" style={{ padding: 6 }}>
              {[
                { day: '어제', note: '한강 노을 죽임', img: true, likes: 12 },
                { day: '2일 전', note: '비 와서 짧게만', img: false, likes: 5 },
                { day: '4일 전', note: '오늘은 7km까지!', img: true, likes: 18 },
              ].map((p, i, arr) => (
                <div key={i} style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: p.img ? 'linear-gradient(135deg, #FFD166, var(--coral-500))' : 'var(--surface-2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{p.img ? '📷' : '✓'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.note}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{p.day} · ❤️ {p.likes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right rail — today's CTA */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>오늘</h3>
            <div className="r-card" style={{ padding: 24, background: 'linear-gradient(140deg, var(--coral-50), var(--surface))', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', border: '2px solid var(--coral-100)' }}/>
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'var(--coral-600)' }}>4월 25일 · 토요일</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>오늘도 5km<br/>나갈 시간이에요.</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>예정 18:00 · 지금 17:42</div>
                <button className="r-btn r-btn--primary r-btn--lg" style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}>
                  <Icon name="check" size={18} color="white" strokeWidth={3}/> 완료 인증하기
                </button>
                <button className="r-btn r-btn--ghost" style={{ width: '100%', marginTop: 6, justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  오늘은 쉬어가기
                </button>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: 'var(--surface-2)', border: '1px dashed var(--border-strong)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>💡 TIP</div>
              <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 4, lineHeight: 1.5 }}>완료 시 사진/메모를 첨부하면 챌린지 채팅방과 피드에 함께 공유돼요.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Routine Complete MODAL (image + memo) ──────
// Triggered after tapping "완료 인증하기". User adds proof image + note,
// chooses where to share, then submits → success animation.
const RoutineCompleteArtboard = () => (
  <div style={{ width: '100%', height: '100%', background: 'rgba(20,18,12,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
    <div className="r-card" style={{ width: '100%', maxWidth: 540, padding: 0, overflow: 'hidden', boxShadow: 'var(--sh-3)' }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: 'var(--coral-600)' }}>오늘의 인증</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>🏃 러닝 5km</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="r-btn r-btn--ghost r-btn--sm" style={{ width: 32, height: 32, padding: 0, borderRadius: '50%', background: 'var(--surface-2)' }}>✕</button>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {/* Image upload */}
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>인증 사진 (선택)</label>
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ aspectRatio: '4/3', borderRadius: 14, background: 'linear-gradient(135deg, #FFD166, var(--coral-500))', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: 8, left: 10, color: 'white', fontSize: 10, fontWeight: 700 }}>📍 한강공원</div>
            <button style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'rgba(20,18,12,.7)', color: 'white', fontSize: 12, cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ aspectRatio: '4/3', borderRadius: 14, border: '2px dashed var(--border-strong)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', gap: 4 }}>
            <Icon name="image" size={22}/>
            <span style={{ fontSize: 11, fontWeight: 600 }}>사진 추가</span>
          </div>
        </div>

        {/* Memo */}
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 18 }}>메모</label>
        <textarea className="r-input" rows={3} defaultValue="오늘 한강 노을이 진짜 죽이네요. 페이스보다 풍경이 좋아서 천천히 뛰었어요 🌅"
          style={{ marginTop: 8, resize: 'none', fontSize: 14 }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-dim)' }}>
          <span>친근하게 적을수록 멤버들이 좋아해요</span>
          <span>43 / 200</span>
        </div>

        {/* Share targets */}
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 18 }}>공유 위치</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {[
            { id: 'feed', label: '내 피드', sub: '팔로워 24명에게 보여요', on: true, icon: 'feed' },
            { id: 'challenge', label: '21일 아침 러닝', sub: '챌린지 채팅방에 인증', on: true, icon: 'trophy', accent: true },
            { id: 'private', label: '비공개로 기록만', sub: '나만 볼 수 있어요', on: false, icon: 'user' },
          ].map(o => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, border: o.on ? '2px solid var(--coral-500)' : '1.5px solid var(--border-strong)', background: o.on ? 'var(--coral-50)' : 'transparent', cursor: 'pointer' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: o.accent ? 'var(--coral-500)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={o.icon} size={16} color={o.accent ? 'white' : 'var(--text-muted)'}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{o.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.sub}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: 6, border: o.on ? 'none' : '2px solid var(--border-strong)', background: o.on ? 'var(--coral-500)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {o.on && <Icon name="check" size={12} color="white" strokeWidth={3.5}/>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--surface-2)' }}>
        <button className="r-btn r-btn--ghost" style={{ flex: 1, justifyContent: 'center' }}>저장 안 함</button>
        <button className="r-btn r-btn--primary" style={{ flex: 2, justifyContent: 'center' }}>
          <Icon name="check" size={16} color="white" strokeWidth={3}/> 완료 인증 + 공유
        </button>
      </div>
    </div>
  </div>
);

// ─── Routine Complete SUCCESS (after submit) ─────
const RoutineSuccessArtboard = () => (
  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg, var(--coral-500) 0%, var(--sunset-500) 100%)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 40 }}>
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const dist = 180 + Math.random() * 120;
      const colors = ['#FFD166','#FFFFFF','#06D6A0','#FFEFE5','#FFB088'];
      return <div key={i} style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 8 + Math.random() * 8, height: 8 + Math.random() * 8,
        background: colors[i % colors.length],
        borderRadius: i % 3 === 0 ? '50%' : 2,
        '--dx': Math.cos(angle) * dist + 'px', '--dy': Math.sin(angle) * dist + 'px',
        animation: `confettiBurst 1.4s ${i * 0.02}s ease-out forwards`,
      }}/>;
    })}
    <div style={{ width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'successPop .7s cubic-bezier(.2,.9,.3,1.4)', backdropFilter: 'blur(12px)' }}>
      <div style={{ width: 130, height: 130, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="check" size={84} color="var(--coral-500)" strokeWidth={3.5}/>
      </div>
    </div>
    <div style={{ fontSize: 70, fontWeight: 800, color: 'white', marginTop: 36, letterSpacing: '-0.04em', lineHeight: 1, animation: 'successPop .9s .1s both' }}>완료!</div>
    <div style={{ fontSize: 18, color: 'rgba(255,255,255,.95)', fontWeight: 500, marginTop: 12, textAlign: 'center', animation: 'successPop 1s .25s both' }}>러닝 5km · 피드 + 챌린지에 공유됨</div>
    <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(12px)', borderRadius: 999, animation: 'successPop 1s .4s both' }}>
      <span className="r-flame" style={{ fontSize: 28 }}>🔥</span>
      <div style={{ color: 'white' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', opacity: 0.9 }}>STREAK · UP!</div>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, fontFamily: 'Geist' }}>7 → 8 days</div>
      </div>
    </div>
    <div style={{ marginTop: 28, display: 'flex', gap: 10, animation: 'successPop 1s .55s both' }}>
      <button className="r-btn" style={{ background: 'white', color: 'var(--coral-700)' }}>피드 보기 →</button>
      <button className="r-btn r-btn--ghost" style={{ color: 'white', border: '1.5px solid rgba(255,255,255,.4)' }}>홈으로</button>
    </div>
  </div>
);

// ─── Routine Create form ────────────────────
const RoutineCreateArtboard = () => {
  const [cat, setCat] = React.useState('fitness');
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 56, padding: '0 28px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <button className="r-btn r-btn--ghost r-btn--sm">← 취소</button>
        <div style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700 }}>새 루틴</div>
        <div style={{ flex: 1 }}/>
        <button className="r-btn r-btn--primary r-btn--sm">저장</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--coral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, cursor: 'pointer' }}>🏃</div>
          <input className="r-input" defaultValue="러닝 5km" style={{ fontSize: 20, fontWeight: 700 }}/>
        </div>
        <textarea className="r-input" defaultValue="아침 공원에서 가볍게 한 바퀴." rows={2} style={{ resize: 'none', marginBottom: 18, fontSize: 13 }}/>

        {/* Category */}
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>카테고리</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, marginBottom: 18 }}>
          {ROUTINE_CATEGORIES.filter(c => c.id !== 'all').map(c => {
            const on = cat === c.id;
            return (
              <button key={c.id} onClick={() => setCat(c.id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 999,
                border: on ? 'none' : '1.5px solid var(--border-strong)',
                background: on ? c.color : 'var(--surface)',
                color: on ? 'white' : 'var(--text)',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                <span>{c.emoji}</span><span>{c.name}</span>
              </button>
            );
          })}
        </div>

        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>수행 요일</label>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, marginBottom: 18 }}>
          {['월','화','수','목','금','토','일'].map((d, i) => {
            const on = [true, false, true, false, true, false, false][i];
            return <div key={d} style={{ flex: 1, height: 44, borderRadius: 11, border: on ? 'none' : '1.5px solid var(--border-strong)', background: on ? 'var(--coral-500)' : 'transparent', color: on ? 'white' : 'var(--text)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{d}</div>;
          })}
        </div>

        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>알림 시간</label>
        <div className="r-input" style={{ marginTop: 8, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 13 }}>
          <span><Icon name="bell" size={14} style={{ verticalAlign: -3, marginRight: 8 }}/>매일 18:00</span>
          <Icon name="chevronRight" size={14} color="var(--text-muted)"/>
        </div>

        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>색상</label>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {['var(--coral-500)','var(--info)','var(--success)','#9D4EDD','var(--sunset-500)','#EF476F'].map((c, i) => (
            <div key={c} style={{ width: 32, height: 32, borderRadius: '50%', background: c, boxShadow: i === 0 ? '0 0 0 3px var(--surface), 0 0 0 5px var(--coral-500)' : 'none', cursor: 'pointer' }}/>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Challenge Detail + Leaderboard ──────────
const ChallengeDetailArtboard = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <AppHeader active="challenges" />
    <div style={{ flex: 1, overflow: 'auto' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--coral-500), var(--sunset-500))', padding: '40px 36px 36px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -50, width: 350, height: 350, borderRadius: '50%', border: '2px solid rgba(255,255,255,.15)' }}/>
        <div style={{ position: 'absolute', bottom: -80, right: 100, width: 200, height: 200, borderRadius: '50%', border: '2px solid rgba(255,255,255,.1)' }}/>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="r-badge" style={{ background: 'rgba(255,255,255,.2)', color: 'white' }}>● ACTIVE</span>
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>Day 14 of 21 · D-7</span>
            </div>
            <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.035em', margin: '12px 0 8px', lineHeight: 1 }}>21일<br/>아침 러닝 🏃</h1>
            <div style={{ fontSize: 15, opacity: 0.95, maxWidth: 520, lineHeight: 1.5 }}>매일 아침 7시 전에 5km. 함께 뛰면 외롭지 않아요. 같이 일어나서 한 발 내딛어봐요!</div>
            <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
              <div><div style={{ fontSize: 11, opacity: 0.85, fontWeight: 700, letterSpacing: '.1em' }}>MEMBERS</div><div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Geist', lineHeight: 1 }}>12</div></div>
              <div><div style={{ fontSize: 11, opacity: 0.85, fontWeight: 700, letterSpacing: '.1em' }}>완료율</div><div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Geist', lineHeight: 1 }}>87%</div></div>
              <div><div style={{ fontSize: 11, opacity: 0.85, fontWeight: 700, letterSpacing: '.1em' }}>NEXT</div><div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Geist', lineHeight: 1 }}>06:00</div></div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <button className="r-btn" style={{ background: 'white', color: 'var(--coral-700)' }}><Icon name="chat" size={16}/>채팅방 열기</button>
            <button className="r-btn r-btn--ghost" style={{ color: 'white', border: '1.5px solid rgba(255,255,255,.3)' }}><Icon name="link" size={16}/>초대 링크</button>
          </div>
        </div>
      </div>

      <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28 }}>
        {/* Leaderboard */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>🏆 리더보드</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>이번 주 완료 횟수</span>
          </div>

          {/* Podium */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 14, marginBottom: 28 }}>
            {[
              { rank: 2, name: '준호', color: '#06D6A0', count: 17, h: 88 },
              { rank: 1, name: '민지', color: '#FFD166', count: 19, h: 116 },
              { rank: 3, name: '지수', color: '#FF8A65', count: 16, h: 70, me: true },
            ].map(p => (
              <div key={p.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <Avatar name={p.name[0]} color={p.color} size={p.rank === 1 ? 56 : 44} ring={p.rank === 1}/>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}{p.me && <span style={{ fontSize: 10, color: 'var(--coral-600)', marginLeft: 4 }}>YOU</span>}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{p.count}회</div>
                <div style={{ width: 88, height: p.h, background: p.rank === 1 ? 'linear-gradient(180deg, var(--coral-400), var(--coral-500))' : 'var(--surface-2)', border: p.rank !== 1 ? '1px solid var(--border)' : 'none', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Geist', fontSize: 32, fontWeight: 800, color: p.rank === 1 ? 'white' : 'var(--text-muted)' }}>{p.rank}</div>
              </div>
            ))}
          </div>

          {/* List */}
          <div className="r-card" style={{ padding: 6 }}>
            {[
              { rank: 4, name: '다은', color: '#9D4EDD', count: 14, change: '↑2' },
              { rank: 5, name: '서윤', color: '#118AB2', count: 13, change: '—' },
              { rank: 6, name: '하준', color: '#EF476F', count: 12, change: '↓1' },
              { rank: 7, name: '시우', color: '#06D6A0', count: 10, change: '↑1' },
              { rank: 8, name: '예린', color: '#FFD166', count: 9, change: '—' },
            ].map((p, i) => (
              <div key={p.rank} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Geist', width: 24, color: 'var(--text-muted)' }}>{p.rank}</div>
                <Avatar name={p.name[0]} color={p.color} size={32}/>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: p.change.startsWith('↑') ? 'var(--success)' : p.change.startsWith('↓') ? 'var(--danger)' : 'var(--text-dim)' }}>{p.change}</div>
                <div style={{ width: 80, height: 6, background: 'var(--ink-100)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${p.count/19*100}%`, height: '100%', background: 'var(--coral-500)' }}/>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Geist', width: 28, textAlign: 'right' }}>{p.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail — members + activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="r-card" style={{ padding: 20 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>오늘 인증한 멤버 (10/12)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {[
                ['민','#FFD166',1],['준','#06D6A0',1],['지','#FF8A65',1],['다','#9D4EDD',1],
                ['서','#118AB2',1],['하','#EF476F',1],['시','#06D6A0',1],['예','#FFD166',1],
                ['윤','#FF8A65',1],['은','#9D4EDD',1],['진','#118AB2',0],['솔','#EF476F',0],
              ].map(([n,c,d], i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <Avatar name={n} color={c} size={36}/>
                  {d ? <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={9} color="white" strokeWidth={3.5}/></div> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="r-card" style={{ padding: 20 }}>
            <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>최근 활동</h4>
            {[
              { name: '민지', color: '#FFD166', text: '5.2km 완료 · 26분', time: '12분 전', emoji: '🏃' },
              { name: '준호', color: '#06D6A0', text: '5km 완료 · 28분', time: '24분 전', emoji: '🏃' },
              { name: '다은', color: '#9D4EDD', text: '5.1km 완료 · 30분', time: '38분 전', emoji: '🏃' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <Avatar name={a.name[0]} color={a.color} size={28}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}><b>{a.name}</b>님이 {a.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{a.time}</div>
                </div>
                <span style={{ fontSize: 18 }}>{a.emoji}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Challenge Browse ──────────────────────────
const ChallengeBrowseArtboard = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <AppHeader active="challenges" />
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 36px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>EXPLORE</div>
          <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', margin: '4px 0 0' }}>같이 할 사람,<br/>찾고 있어요?</h1>
        </div>
        <button className="r-btn r-btn--primary"><Icon name="plus" size={16}/>챌린지 만들기</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center' }}>
        <div className="r-input" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px' }}>
          <Icon name="search" size={16} color="var(--text-muted)"/>
          <input style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontFamily: 'inherit', fontSize: 14 }} placeholder="러닝, 독서, 명상..." defaultValue=""/>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['전체', '🔥 인기', '🏃 운동', '📚 독서', '🧘 마음', '🌅 모닝'].map((t, i) => (
            <span key={t} style={{ padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: i === 0 ? 'var(--text)' : 'var(--surface)', color: i === 0 ? 'var(--surface)' : 'var(--text)', border: i === 0 ? 'none' : '1px solid var(--border-strong)', cursor: 'pointer' }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { name: '21일 아침 러닝', emoji: '🏃', members: 12, days: 21, host: '민지', bg: 'linear-gradient(135deg, var(--coral-500), var(--sunset-500))', joined: true },
          { name: '하루 한 권 독서', emoji: '📚', members: 8, days: 30, host: '준호', bg: 'linear-gradient(135deg, #118AB2, #06D6A0)' },
          { name: '저녁 9시 명상', emoji: '🧘', members: 24, days: 14, host: '다은', bg: 'linear-gradient(135deg, #9D4EDD, #5D4EDD)' },
          { name: '물 2L 마시기', emoji: '💧', members: 16, days: 30, host: '시우', bg: 'linear-gradient(135deg, #06D6A0, #06A67D)' },
          { name: '주 3회 헬스장', emoji: '💪', members: 6, days: 28, host: '하준', bg: 'linear-gradient(135deg, #EF476F, #C9184A)' },
          { name: '아침 6시 기상', emoji: '🌅', members: 20, days: 21, host: '서윤', bg: 'linear-gradient(135deg, #FFD166, var(--sunset-500))' },
        ].map((c, i) => (
          <div key={i} className="r-card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ background: c.bg, padding: '20px 18px 60px', position: 'relative', minHeight: 100 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="r-badge" style={{ background: 'rgba(255,255,255,.25)', color: 'white' }}>{c.joined ? '● JOINED' : '● ACTIVE'}</span>
                <span style={{ fontSize: 38 }}>{c.emoji}</span>
              </div>
            </div>
            <div style={{ padding: '0 18px 18px', marginTop: -32 }}>
              <AvatarStack items={Array.from({length: 4}).map((_,j) => ({ name: ['지','민','준','다'][j], color: ['#FF8A65','#FFD166','#06D6A0','#9D4EDD'][j] }))} size={32}/>
              <div style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 10 }}>
                <span><Icon name="users" size={11} style={{ verticalAlign: -1, marginRight: 3 }}/>{c.members}명</span>
                <span><Icon name="calendar" size={11} style={{ verticalAlign: -1, marginRight: 3 }}/>{c.days}일</span>
              </div>
              <button className="r-btn r-btn--sm" style={{ marginTop: 14, width: '100%', background: c.joined ? 'var(--surface-2)' : 'var(--coral-500)', color: c.joined ? 'var(--text)' : 'white', boxShadow: c.joined ? 'none' : 'var(--sh-coral)' }}>
                {c.joined ? '진행중' : '참여하기'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);


Object.assign(window, { RoutinesArtboard, RoutineDetailArtboard, RoutineCompleteArtboard, RoutineSuccessArtboard, RoutineCreateArtboard, ChallengeDetailArtboard, ChallengeBrowseArtboard });
