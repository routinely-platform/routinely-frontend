// Routinely — Challenge Detail (참여자 전용)
// State variants: ACTIVE (default), WAITING, ENDED, ACTIVE+ownerMenuOpen, ACTIVE+routineDone, ACTIVE+missed, restDay.

// ─── Shared bits ─────────────────────────────────
const StatusPill = ({ status }) => {
  const map = {
    WAITING: { bg: 'rgba(255,255,255,.22)', label: '대기중', dot: '#fff' },
    ACTIVE:  { bg: 'rgba(255,255,255,.22)', label: '진행중', dot: '#fff' },
    ENDED:   { bg: 'rgba(255,255,255,.15)', label: '종료',   dot: 'rgba(255,255,255,.6)' },
  }[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 11px', borderRadius: 999, background: map.bg, color: 'white',
      fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: map.dot }}/>
      {map.label}
    </span>
  );
};

const Dday = ({ status }) => {
  const map = {
    WAITING: { num: '7',  label: '시작까지' },
    ACTIVE:  { num: '8',  label: '종료까지' },
    ENDED:   { num: null, label: '종료됨' },
  }[status];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'baseline', gap: 6,
      padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,.15)',
      color: 'white', backdropFilter: 'blur(8px)',
    }}>
      {map.num ? <>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', opacity: 0.9 }}>{map.label}</span>
        <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Geist', letterSpacing: '-0.02em' }}>D-{map.num}</span>
      </> : <>
        <span style={{ fontSize: 13, fontWeight: 700 }}>· {map.label}</span>
      </>}
    </div>
  );
};

// ─── Section 1: Hero ──────────────────────────────
const DetailHero = ({ status, isOwner, ownerMenuOpen }) => (
  <div style={{ background: 'linear-gradient(135deg, var(--coral-500), var(--sunset-500))', padding: '32px 36px 28px', color: 'white', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: -100, right: -50, width: 350, height: 350, borderRadius: '50%', border: '2px solid rgba(255,255,255,.15)' }}/>
    <div style={{ position: 'absolute', bottom: -80, right: 100, width: 200, height: 200, borderRadius: '50%', border: '2px solid rgba(255,255,255,.1)' }}/>

    <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 22 }}>
      {/* Cover image / emoji */}
      <div style={{
        width: 96, height: 96, borderRadius: 22, flexShrink: 0,
        background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44,
      }}>🏃</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <StatusPill status={status}/>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(255,255,255,.15)', color: 'white',
            fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
          }}>💪 운동</span>
          {isOwner && (
            <span style={{
              padding: '4px 10px', borderRadius: 999,
              background: 'var(--ink-800)', color: 'white',
              fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
            }}>👑 방장</span>
          )}
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.025em', margin: '12px 0 6px', lineHeight: 1.05 }}>
          21일 아침 러닝
        </h1>
        <p style={{ fontSize: 14, opacity: 0.95, lineHeight: 1.55, maxWidth: 560, margin: 0 }}>
          매일 아침 5km. 함께 뛰면 외롭지 않아요. 같이 일어나서 한 발 내딛어봐요!
        </p>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: 14, marginTop: 18, fontSize: 13, opacity: 0.95, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Geist' }}>
            <Icon name="calendar" size={13} color="white"/>2026.05.27 ~ 06.16
          </span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.5)' }}/>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="users" size={13} color="white"/>
            <span style={{ fontFamily: 'Geist' }}>{status === 'ENDED' ? '11/12' : '8/12'}명</span>
          </span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.5)' }}/>
          <Dday status={status}/>
        </div>
      </div>

      {/* Right action column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', position: 'relative' }}>
        <button className="r-btn" style={{ background: 'white', color: 'var(--coral-700)', fontWeight: 700 }}>
          <Icon name="chat" size={15}/>채팅방 <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: 'var(--coral-100)', color: 'var(--coral-700)', marginLeft: 2, letterSpacing: '.08em' }}>v2</span>
        </button>
        {isOwner && (
          <button style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
            color: 'white', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700,
          }}>⋯</button>
        )}

        {/* My progress mini chip */}
        <div style={{
          marginTop: 4,
          padding: '8px 14px', borderRadius: 12,
          background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(8px)',
          color: 'white', textAlign: 'right',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', opacity: 0.85 }}>내 달성률</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, fontFamily: 'Geist' }}>
            <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{status === 'WAITING' ? '—' : status === 'ENDED' ? '78' : '67'}</span>
            {status !== 'WAITING' && <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.85 }}>%</span>}
          </div>
        </div>

        {/* Owner dropdown (when open) */}
        {isOwner && ownerMenuOpen && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 6,
            width: 240, background: 'var(--surface)', color: 'var(--text)',
            border: '1px solid var(--border)', borderRadius: 14,
            boxShadow: '0 20px 50px rgba(0,0,0,.25)', overflow: 'hidden',
            zIndex: 5,
          }}>
            <div style={{ padding: 4 }}>
              {[
                { icon: '✏️', label: '챌린지 정보 수정', sub: '대기중일 때만', disabled: status !== 'WAITING' },
                { icon: '🔗', label: '초대 링크 보기', sub: '비공개 챌린지', disabled: false },
                { icon: '👥', label: '멤버 관리', sub: '강퇴 가능', disabled: status === 'ENDED' },
                { icon: '🛑', label: '챌린지 조기 종료', sub: '되돌릴 수 없음', disabled: status === 'ENDED' },
              ].map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 9,
                  fontSize: 13, fontWeight: 600,
                  color: m.disabled ? 'var(--text-dim)' : 'var(--text)',
                  cursor: m.disabled ? 'not-allowed' : 'pointer',
                  opacity: m.disabled ? 0.55 : 1,
                }}>
                  <span style={{ fontSize: 14 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div>{m.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>{m.sub}</div>
                  </div>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }}/>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 9,
                fontSize: 13, fontWeight: 600, color: 'var(--coral-700)', cursor: 'pointer',
              }}>
                <span style={{ fontSize: 14 }}>🗑</span>
                <div style={{ flex: 1 }}>
                  <div>챌린지 삭제</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>본인만 남았을 때만</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ─── Today's routine card variants ───────────────
const TodayRoutineCard = ({ state }) => {
  // state: waiting | pending | done | missed | rest | ended
  const wrap = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 18, padding: 22,
  };
  if (state === 'waiting') return (
    <div style={wrap}>
      <SectionLabel/>
      <div style={{ textAlign: 'center', padding: '20px 0 6px' }}>
        <div style={{ fontSize: 38 }}>📅</div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', marginTop: 12 }}>2026.05.27<span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 14, fontWeight: 600 }}>(수)</span></div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>시작 예정 · 7일 남음</div>
      </div>
      <div style={{ padding: 14, marginTop: 12, borderRadius: 12, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        <span style={{ fontSize: 15 }}>🌱</span>
        <span>시작일 전까지는 멤버를 모으는 시간이에요. 시작되면 매일 인증이 활성화됩니다.</span>
      </div>
    </div>
  );

  if (state === 'rest') return (
    <div style={wrap}>
      <SectionLabel/>
      <div style={{ textAlign: 'center', padding: '20px 0 6px' }}>
        <div style={{ fontSize: 38 }}>😌</div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', marginTop: 12 }}>오늘은 휴식일</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>이 챌린지에서는 화·일요일이 휴식일이에요</div>
      </div>
    </div>
  );

  if (state === 'missed') return (
    <div style={wrap}>
      <SectionLabel/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '6px 0' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'var(--text-dim)' }}>🏃</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>5km 러닝</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>2026.05.14 (목)</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 11px', borderRadius: 999, background: 'var(--ink-100)', color: 'var(--ink-600)', letterSpacing: '.04em' }}>누락</span>
      </div>
      <button className="r-btn" disabled style={{ width: '100%', marginTop: 14, background: 'var(--surface-2)', color: 'var(--text-dim)', cursor: 'not-allowed' }}>
        지난 날은 인증할 수 없어요
      </button>
    </div>
  );

  if (state === 'done') return (
    <div style={wrap}>
      <SectionLabel/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, var(--coral-500), var(--sunset-500))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'white',
        }}>🏃</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>5km 러닝</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>오늘 · 매일</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 11px', borderRadius: 999, background: 'var(--success-bg)', color: 'var(--success)', letterSpacing: '.04em' }}>✓ 완료</span>
      </div>
      {/* Proof thumbnail */}
      <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, #FFD166, var(--coral-500))',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,.4), transparent 60%)' }}/>
          <div style={{ position: 'absolute', bottom: 4, left: 6, color: 'white', fontSize: 9, fontWeight: 700 }}>📍 한강</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>"오늘 한강 노을 진짜 죽이네요. 페이스보다 풍경이 좋아서 천천히 뛰었어요 🌅"</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'Geist' }}>07:24 인증</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button className="r-btn r-btn--ghost r-btn--sm" style={{ flex: 1, border: '1px solid var(--border-strong)', justifyContent: 'center' }}>✏️ 수정</button>
        <button className="r-btn r-btn--ghost r-btn--sm" style={{ flex: 1, border: '1px solid var(--border-strong)', justifyContent: 'center', color: 'var(--text-muted)' }}>피드 보기 →</button>
      </div>
    </div>
  );

  if (state === 'ended') return (
    <div style={{ ...wrap, background: 'linear-gradient(135deg, var(--coral-50), var(--surface))' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--coral-700)' }}>최종 결과</div>
      <div style={{ marginTop: 14, textAlign: 'center', padding: '14px 0 8px' }}>
        <div style={{ fontSize: 56, fontWeight: 800, fontFamily: 'Geist', letterSpacing: '-0.04em', color: 'var(--coral-600)', lineHeight: 1 }}>
          78<span style={{ fontSize: 28 }}>%</span>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, fontWeight: 600 }}>
          21일 중 16일 인증 · 잘했어요 🎉
        </div>
      </div>
      <div style={{
        marginTop: 14, padding: '12px 14px', borderRadius: 12,
        background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5,
      }}>
        <span style={{ fontSize: 14 }}>🏆</span>
        <span>완주 배지를 받았어요. <b style={{ color: 'var(--text)' }}>프로필 → 배지</b>에서 확인할 수 있어요.</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button className="r-btn r-btn--ghost r-btn--sm" style={{ flex: 1, border: '1px solid var(--border-strong)', justifyContent: 'center' }}>📊 통계 보기</button>
        <button className="r-btn r-btn--sm" style={{ flex: 1, background: 'var(--coral-500)', color: 'white', justifyContent: 'center' }}>새 챌린지 시작 →</button>
      </div>
    </div>
  );

  // pending (default)
  return (
    <div style={wrap}>
      <SectionLabel/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: 'var(--coral-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'var(--coral-700)',
        }}>🏃</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>5km 러닝</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>오늘 · 매일 · 아침</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 11px', borderRadius: 999, background: 'var(--warning-bg)', color: '#a86a00', letterSpacing: '.04em' }}>아직 인증 전</span>
      </div>
      <button className="r-btn r-btn--primary" style={{ width: '100%', marginTop: 16, padding: '13px', borderRadius: 12, justifyContent: 'center' }}>
        <Icon name="check" size={18} color="white" strokeWidth={3}/> 오늘 인증하기
      </button>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', marginTop: 8 }}>
        매일 23:59 마감 · 사진 한 장이면 충분해요
      </div>
    </div>
  );
};

const SectionLabel = () => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 14 }}>
    오늘의 루틴
  </div>
);

// ─── Monthly calendar ────────────────────────────
const MonthlyCalendar = ({ status }) => {
  // For ACTIVE: today = 21 (May 2026), challenge started May 14
  // For ENDED: every day shown
  const today = status === 'ENDED' ? 31 : 21;
  const startDay = 14; // May 14
  const dayState = (d) => {
    if (d < startDay) return null; // before challenge
    if (d > today) return 'future';
    if ([14,15,16,17,19,20].includes(d)) return 'done';
    if ([18].includes(d)) return 'missed';
    if (d === 21) return 'today';
    return 'done';
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>달성 캘린더</div>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Geist', marginTop: 4 }}>2026년 5월</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid var(--border-strong)', background: 'var(--surface)', cursor: 'pointer', fontSize: 11 }}>◀</button>
          <button style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid var(--border-strong)', background: 'var(--surface)', cursor: 'pointer', fontSize: 11 }}>▶</button>
        </div>
      </div>
      {/* DOW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {['월','화','수','목','금','토','일'].map((d, i) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: i >= 5 ? 'var(--coral-600)' : 'var(--text-dim)', letterSpacing: '.04em' }}>{d}</div>
        ))}
      </div>
      {/* Cells — May 1 2026 = 금 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {/* lead: Mon, Tue, Wed, Thu empty before Fri */}
        {[0,1,2,3].map(i => <div key={'l'+i} style={{ aspectRatio: 1 }}/>)}
        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
          const s = dayState(d);
          let bg = 'transparent', color = 'var(--text-dim)', border = '1px solid var(--border)';
          let extra = null;
          if (s === 'done')   { bg = 'var(--coral-500)'; color = 'white'; border = 'none'; extra = '✓'; }
          if (s === 'missed') { bg = '#ffe2e5'; color = 'var(--danger)'; border = 'none'; }
          if (s === 'today')  { bg = 'transparent'; color = 'var(--coral-600)'; border = '2px solid var(--coral-500)'; }
          if (s === 'future') { color = 'var(--text-dim)'; }
          if (s === null)     { color = 'var(--text-dim)'; }
          return (
            <div key={d} style={{
              aspectRatio: 1, borderRadius: 8, background: bg, border,
              color, fontSize: 12, fontWeight: 700, fontFamily: 'Geist',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              opacity: s === null ? 0.4 : 1,
            }}>
              <span>{d}</span>
              {extra && <span style={{ fontSize: 8 }}>{extra}</span>}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 14, fontSize: 11, color: 'var(--text-muted)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--coral-500)' }}/>인증</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#ffe2e5' }}/>누락</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, border: '2px solid var(--coral-500)' }}/>오늘</span>
      </div>
    </div>
  );
};

// ─── Leaderboard ─────────────────────────────────
const LeaderboardCard = ({ status }) => {
  const ended = status === 'ENDED';
  const rows = [
    { rank: 1, name: '김루틴', color: '#FFD166', rate: 95, medal: '🥇' },
    { rank: 2, name: '박루틴', color: '#06D6A0', rate: 92, medal: '🥈' },
    { rank: 3, name: '최루틴', color: '#9D4EDD', rate: 88, medal: '🥉' },
  ];
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 22, display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 14 }}>
        {ended ? '최종 순위' : '리더보드'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((p, i) => (
          <div key={p.rank} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 4px',
            borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ width: 22, textAlign: 'center', fontSize: p.medal ? 18 : 13, fontWeight: 700, fontFamily: 'Geist', color: 'var(--text-muted)' }}>
              {p.medal || p.rank}
            </div>
            <Avatar name={p.name[0]} color={p.color} size={32}/>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{p.name}</div>
            <div style={{ width: 60, height: 5, background: 'var(--ink-100)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${p.rate}%`, height: '100%', background: 'var(--coral-500)' }}/>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Geist', width: 36, textAlign: 'right' }}>{p.rate}%</div>
          </div>
        ))}
      </div>

      {/* Gap with dots indicating omitted ranks */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 5, padding: '20px 0', minHeight: 28,
      }}>
        {[0,1,2].map(i => <span key={i} style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--ink-200)' }}/>)}
      </div>

      {/* Sticky bottom: my rank */}
      <div style={{
        marginTop: 8, padding: '12px 12px',
        borderRadius: 12, background: 'var(--coral-50)',
        border: '2px solid var(--coral-500)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ width: 22, textAlign: 'center', fontSize: 13, fontWeight: 800, fontFamily: 'Geist', color: 'var(--coral-700)' }}>12</div>
        <Avatar name="지" color="#FF8A65" size={32} ring/>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>
          나 <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--coral-700)', marginLeft: 6, letterSpacing: '.06em' }}>YOU</span>
        </div>
        <div style={{ width: 60, height: 5, background: 'rgba(255,255,255,.6)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${ended ? 78 : 67}%`, height: '100%', background: 'var(--coral-500)' }}/>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Geist', width: 36, textAlign: 'right', color: 'var(--coral-700)' }}>{ended ? 78 : 67}%</div>
      </div>
    </div>
  );
};

// ─── Feed ────────────────────────────────────────
const ChallengeFeed = ({ disabled }) => (
  <section style={{ marginTop: 32, maxWidth: 880, marginLeft: 'auto', marginRight: 'auto' }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>챌린지 피드</div>
        <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.015em', margin: '4px 0 0' }}>멤버들의 오늘</h3>
      </div>
      <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999 }}>
        {['최신순', '인기순'].map((t, i) => (
          <span key={t} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: i === 0 ? 'var(--text)' : 'transparent', color: i === 0 ? 'var(--surface)' : 'var(--text-muted)' }}>{t}</span>
        ))}
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[
        { name: '민지', color: '#FFD166', time: '12분 전', text: '오늘 한강 노을 진짜 죽이네요. 페이스보다 풍경이 좋아서 천천히 뛰었어요 🌅 5.2km · 26분, 평균 페이스 5\'00".', distance: '5.2km · 26분', img: 'linear-gradient(135deg, #FFD166, var(--coral-500))', loc: '한강공원', reactions: { '🔥': 12, '💪': 5, '🌅': 3 } },
        { name: '준호', color: '#06D6A0', time: '24분 전', text: '5km · 28분. 컨디션 좋음. 다들 어제 푹 쉬셨나봐요 페이스 빨라진 느낌 ㅎㅎ', distance: '5.0km · 28분', img: 'linear-gradient(135deg, #06D6A0, #06A67D)', loc: '집 앞 공원', reactions: { '🔥': 6, '💪': 2 } },
        { name: '다은', color: '#9D4EDD', time: '38분 전', text: '비 와서 짧게만 뛰고 들어왔어요. 그래도 안 빼먹은 거에 의미를 두자고…', distance: '3.0km · 18분', img: 'linear-gradient(135deg, #9D4EDD, #5D4EDD)', loc: '동네 한 바퀴', reactions: { '👏': 4, '🌧': 2 } },
      ].map((p, i) => (
        <article key={i} className="r-card" style={{
          padding: 0, overflow: 'hidden',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          opacity: disabled ? 0.6 : 1,
        }}>
          {/* Left: image */}
          <div style={{ position: 'relative', background: p.img, minHeight: 280 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,.32), transparent 60%)' }}/>
            {/* Location pill */}
            <div style={{
              position: 'absolute', top: 14, left: 14,
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 999,
              background: 'rgba(20,18,12,.45)', backdropFilter: 'blur(8px)',
              color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
            }}>📍 {p.loc}</div>
            {/* Distance bottom-right */}
            <div style={{
              position: 'absolute', bottom: 14, right: 14,
              padding: '5px 11px', borderRadius: 8,
              background: 'rgba(255,255,255,.95)', color: 'var(--coral-700)',
              fontSize: 12, fontWeight: 800, fontFamily: 'Geist', letterSpacing: '-0.01em',
            }}>{p.distance}</div>
          </div>

          {/* Right: text + reactions */}
          <div style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Avatar name={p.name[0]} color={p.color} size={36}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{p.time}</div>
              </div>
              <button style={{
                width: 28, height: 28, borderRadius: 8, border: 'none',
                background: 'transparent', color: 'var(--text-dim)',
                cursor: 'pointer', fontSize: 16, lineHeight: 1, fontWeight: 700,
              }}>⋯</button>
            </header>

            {/* Body */}
            <p style={{
              fontSize: 14, lineHeight: 1.6, color: 'var(--text)',
              margin: 0, flex: 1,
            }}>{p.text}</p>

            {/* Reactions */}
            <footer style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)',
              flexWrap: 'wrap',
            }}>
              {Object.entries(p.reactions).map(([e, n]) => (
                <span key={e} style={{
                  padding: '4px 10px', background: 'var(--surface-2)',
                  border: '1px solid var(--border)', borderRadius: 999,
                  fontSize: 13, fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                  <span>{e}</span><span style={{ fontFamily: 'Geist', color: 'var(--text-muted)' }}>{n}</span>
                </span>
              ))}
              {!disabled && (
                <span style={{
                  width: 30, height: 30, borderRadius: '50%',
                  border: '1.5px dashed var(--border-strong)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer',
                }}>+</span>
              )}
              <div style={{ flex: 1 }}/>
              <button className="r-btn r-btn--ghost r-btn--sm" style={{ color: 'var(--text-muted)', padding: '5px 10px' }}>
                <Icon name="chat" size={13} color="currentColor"/>댓글 3
              </button>
            </footer>
          </div>
        </article>
      ))}
    </div>

    {!disabled && (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <button className="r-btn r-btn--ghost" style={{ border: '1px solid var(--border-strong)', color: 'var(--text-muted)' }}>더 보기</button>
      </div>
    )}
  </section>
);

// ─── Composable detail screen ────────────────────
const ChallengeDetail = ({ status = 'ACTIVE', routineState = 'pending', isOwner = false, ownerMenuOpen = false }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <AppHeader active="challenges"/>
    <div style={{ flex: 1, overflow: 'auto' }}>
      <DetailHero status={status} isOwner={isOwner} ownerMenuOpen={ownerMenuOpen}/>

      <div style={{ padding: '24px 36px 36px' }}>
        {/* Section 2 — split. Left: routine card + leaderboard. Right: calendar. */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TodayRoutineCard state={status === 'ENDED' ? 'ended' : status === 'WAITING' ? 'waiting' : routineState}/>
            <div style={{ flex: 1, display: 'flex' }}>
              <LeaderboardCard status={status}/>
            </div>
          </div>
          <MonthlyCalendar status={status}/>
        </div>

        {/* Section 3 — feed */}
        <ChallengeFeed disabled={status === 'ENDED' || status === 'WAITING'}/>
      </div>
    </div>
  </div>
);

// ─── Public exported variants ────────────────────
const ChallengeDetailArtboard          = () => <ChallengeDetail status="ACTIVE" routineState="pending"/>;
const ChallengeDetailWaitingArtboard   = () => <ChallengeDetail status="WAITING"/>;
const ChallengeDetailDoneArtboard      = () => <ChallengeDetail status="ACTIVE" routineState="done"/>;
const ChallengeDetailRestArtboard      = () => <ChallengeDetail status="ACTIVE" routineState="rest"/>;
const ChallengeDetailMissedArtboard    = () => <ChallengeDetail status="ACTIVE" routineState="missed"/>;
const ChallengeDetailEndedArtboard     = () => <ChallengeDetail status="ENDED"/>;
const ChallengeDetailOwnerMenuArtboard = () => <ChallengeDetail status="ACTIVE" routineState="pending" isOwner ownerMenuOpen/>;

Object.assign(window, {
  ChallengeDetailArtboard,
  ChallengeDetailWaitingArtboard,
  ChallengeDetailDoneArtboard,
  ChallengeDetailRestArtboard,
  ChallengeDetailMissedArtboard,
  ChallengeDetailEndedArtboard,
  ChallengeDetailOwnerMenuArtboard,
});
