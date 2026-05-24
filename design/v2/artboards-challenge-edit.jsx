// Routinely — Challenge Edit modal (owner, WAITING only)
// Constraints:
//  • 챌린지: 제목, 소개, 공개여부(비공개→공개만), 최대 인원(현재 멤버 수 이상), 시작일(늦추기만), 종료일(늘리기만)
//  • 루틴: 제목, 선호 수행 시간만

const ChallengeEditModalArtboard = () => {
  const STATE = {
    initial: { title: '21일 아침 러닝', desc: '매일 아침 5km. 함께 뛰면 외롭지 않아요. 같이 일어나서 한 발 내딛어봐요!', visibility: 'private', maxMembers: 12, currentMembers: 8, start: '2026.05.27', end: '2026.06.16', routineName: '5km 러닝', preferredTime: 'morning' },
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader active="challenges" />
      {/* Dimmed background — challenge detail abstract */}
      <div style={{ flex: 1, opacity: 0.35, padding: 36, overflow: 'hidden' }}>
        <div style={{ height: 220, borderRadius: 18, background: 'linear-gradient(135deg, var(--coral-500), var(--sunset-500))' }}/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 18 }}>
          <div className="r-card" style={{ height: 220 }}/>
          <div className="r-card" style={{ height: 220 }}/>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,18,12,.5)' }}/>

      {/* Modal */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{
          width: 640, maxHeight: '92%',
          background: 'var(--surface)', borderRadius: 18,
          boxShadow: '0 30px 80px rgba(0,0,0,.3)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            padding: '20px 24px 18px', borderBottom: '1px solid var(--border)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.015em', margin: 0 }}>챌린지 정보 수정</h3>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.08em', padding: '3px 8px', borderRadius: 5, background: 'var(--ink-800)', color: 'white' }}>👑 방장</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, marginRight: 6 }}>● 대기중</span>
                시작 전이어야 수정할 수 있어요
              </div>
            </div>
            <button style={{ background: 'transparent', border: 'none', fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>

          {/* Notice */}
          <div style={{
            padding: '12px 24px', background: 'var(--coral-50)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
            fontSize: 12, color: 'var(--coral-700)', lineHeight: 1.5,
            borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 14 }}>ℹ️</span>
            <span>
              일부 항목은 <b>되돌릴 수 없는 방향으로만</b> 수정할 수 있어요 — 공개로만, 인원 늘리기만, 시작일 늦추기만, 종료일 늘리기만.
            </span>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
            {/* === 챌린지 정보 === */}
            <SubHeader title="챌린지 정보"/>

            <EditField label="챌린지 이름" hint="자유 변경">
              <input className="r-input" defaultValue={STATE.initial.title} style={{ fontSize: 14, fontWeight: 600 }} maxLength={100}/>
            </EditField>

            <EditField label="챌린지 소개" hint="자유 변경 · 200자">
              <textarea className="r-input" rows={2} defaultValue={STATE.initial.desc} style={{ resize: 'none', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5 }}/>
            </EditField>

            <EditField label="공개 여부" hint="비공개 → 공개로만">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <RadioCard icon="🔒" label="비공개" sub="현재 설정 · 변경 불가" disabled current/>
                <RadioCard icon="🌍" label="공개" sub="공개 목록에 노출돼요" arrow/>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>한번 공개로 바꾸면 다시 비공개로 되돌릴 수 없어요</div>
            </EditField>

            <EditField label="최대 참여 인원" hint={`현재 ${STATE.initial.currentMembers}명 · ${STATE.initial.currentMembers}명 이상으로만`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <input type="range" min={STATE.initial.currentMembers} max="50" defaultValue={STATE.initial.maxMembers} style={{ flex: 1, accentColor: 'var(--coral-500)' }}/>
                <div style={{ minWidth: 88, textAlign: 'right' }}>
                  <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Geist', color: 'var(--coral-600)' }}>12</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 3, fontWeight: 600 }}>명</span>
                </div>
              </div>
              {/* Tick markers */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'Geist', marginTop: 4 }}>
                <span style={{ color: 'var(--ink-300)' }}>8 (현재)</span>
                <span style={{ color: 'var(--coral-600)', fontWeight: 700 }}>12 (지금)</span>
                <span>50</span>
              </div>
            </EditField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <EditField label="시작일" hint="늦추기만">
                <div className="r-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 13 }}>
                  <span style={{ fontFamily: 'Geist', fontWeight: 600 }}>2026.05.30 (토)</span>
                  <Icon name="calendar" size={14} color="var(--text-muted)"/>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>원래 5.27 → <b style={{ color: 'var(--text)' }}>5.30</b> · +3일 늦춤</div>
              </EditField>
              <EditField label="종료일" hint="늘리기만">
                <div className="r-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 13 }}>
                  <span style={{ fontFamily: 'Geist', fontWeight: 600 }}>2026.06.20 (토)</span>
                  <Icon name="calendar" size={14} color="var(--text-muted)"/>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>원래 6.16 → <b style={{ color: 'var(--text)' }}>6.20</b> · +4일 늘림</div>
              </EditField>
            </div>

            {/* === 루틴 정보 === */}
            <div style={{ height: 1, background: 'var(--border)', margin: '22px 0 18px' }}/>
            <SubHeader title="루틴 정보" sub="이 챌린지의 단일 루틴 · 일부만 수정 가능"/>

            <EditField label="루틴 이름" hint="자유 변경">
              <input className="r-input" defaultValue={STATE.initial.routineName} style={{ fontSize: 14, fontWeight: 600 }}/>
            </EditField>

            <EditField label="선호 수행 시간" hint="자유 변경">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {[
                  { v: 'dawn',    label: '새벽', sub: '4–7시' },
                  { v: 'morning', label: '아침', sub: '7–11시', on: true },
                  { v: 'noon',    label: '낮',   sub: '11–17시' },
                  { v: 'evening', label: '저녁', sub: '17–22시' },
                  { v: 'night',   label: '밤',   sub: '22–4시' },
                  { v: 'custom',  label: '직접', sub: '시간 지정' },
                  { v: 'none',    label: '없음', sub: '자유' },
                ].map(o => (
                  <button key={o.v} style={{
                    padding: '10px 6px', borderRadius: 10,
                    border: o.on ? '2px solid var(--coral-500)' : '1.5px solid var(--border-strong)',
                    background: o.on ? 'var(--coral-50)' : 'var(--surface)',
                    color: o.on ? 'var(--coral-700)' : 'var(--text)',
                    cursor: 'pointer', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{o.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2, fontFamily: 'Geist' }}>{o.sub}</div>
                  </button>
                ))}
              </div>
            </EditField>

            {/* === Locked fields (read-only) === */}
            <div style={{ marginTop: 22, padding: 14, borderRadius: 12, background: 'var(--surface-2)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>🔒 수정할 수 없는 항목</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  ['카테고리', '💪 운동'],
                  ['반복 유형', '매일'],
                  ['대표 이미지', '🏃'],
                  ['공개 → 비공개', '불가능'],
                  ['인원 줄이기', '불가능'],
                  ['시작일 앞당기기', '불가능'],
                  ['종료일 앞당기기', '불가능'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 11 }}>
                    <span style={{ color: 'var(--text-dim)' }}>{k}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>· {v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
            padding: '16px 24px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              <b style={{ color: 'var(--success)' }}>5개 변경</b> · 저장하면 멤버들에게 알림이 가요
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="r-btn" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-strong)' }}>취소</button>
              <button className="r-btn r-btn--primary">변경사항 저장</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── State 2: ACTIVE / ENDED — edit disabled state ──
const ChallengeEditLockedArtboard = () => (
  <div style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
    <AppHeader active="challenges" />
    <div style={{ flex: 1, opacity: 0.35, padding: 36 }}>
      <div style={{ height: 220, borderRadius: 18, background: 'linear-gradient(135deg, var(--coral-500), var(--sunset-500))' }}/>
    </div>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,18,12,.5)' }}/>

    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{
        width: 460, background: 'var(--surface)',
        borderRadius: 18, boxShadow: '0 30px 80px rgba(0,0,0,.3)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.015em' }}>지금은 수정할 수 없어요</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.55 }}>
            챌린지 정보 수정은 <b style={{ color: 'var(--text)' }}>대기중</b>일 때만 가능해요.<br/>
            이미 시작된 챌린지는 멤버 모두에게 영향을 주기 때문에<br/>
            일정/규칙을 바꿀 수 없도록 잠겨 있어요.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
              <span>📣</span><span style={{ color: 'var(--text-muted)' }}>대신 채팅방으로 멤버들과 소통해보세요</span>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
              <span>🛑</span><span style={{ color: 'var(--text-muted)' }}>꼭 멈춰야 한다면 <b style={{ color: 'var(--coral-700)' }}>조기 종료</b>를 사용하세요</span>
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 24px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="r-btn r-btn--primary">확인</button>
        </div>
      </div>
    </div>
  </div>
);

// ─── shared subcomponents ──────────────────────
const SubHeader = ({ title, sub }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--coral-700)' }}>{title}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>}
  </div>
);

const EditField = ({ label, hint, children }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</label>
      {hint && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const RadioCard = ({ icon, label, sub, on, current, disabled, arrow }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 13px', borderRadius: 12,
    border: on ? '2px solid var(--coral-500)' : '1.5px solid var(--border-strong)',
    background: on ? 'var(--coral-50)' : current ? 'var(--surface-2)' : 'var(--surface)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled && !current ? 0.5 : 1,
    position: 'relative',
  }}>
    <span style={{ fontSize: 18 }}>{icon}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
        {label}
        {current && <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.06em', padding: '2px 6px', borderRadius: 4, background: 'var(--ink-800)', color: 'white' }}>현재</span>}
        {arrow && <span style={{ fontSize: 10, color: 'var(--coral-600)' }}>→ 변경</span>}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>
    </div>
  </div>
);

Object.assign(window, { ChallengeEditModalArtboard, ChallengeEditLockedArtboard });
