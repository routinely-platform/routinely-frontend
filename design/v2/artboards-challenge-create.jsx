// Routinely — Challenge Create (desktop web, v2 — spec'd 3-section structure)
// Challenge + Routine 1:1, single page with 3 sections.
// Category in section 1 only. Invite excluded (MVP).
// Post-create: public → detail / private → invite-link modal.

const LABEL = { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block' };

const SectionCard = ({ num, title, sub, required, children }) => (
  <section className="r-card" style={{ padding: 28 }}>
    <header style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: 'var(--coral-500)', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Geist', fontSize: 14, fontWeight: 800,
      }}>{num}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.015em', margin: 0 }}>{title}</h3>
          {required && <span style={{ fontSize: 11, color: 'var(--coral-600)', fontWeight: 700 }}>· 필수</span>}
        </div>
        {sub && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{sub}</p>}
      </div>
    </header>
    <div>{children}</div>
  </section>
);

const FieldRow = ({ label, required, hint, error, children }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <label style={LABEL}>
        {label} {required && <span style={{ color: 'var(--coral-600)' }}>*</span>}
      </label>
      {hint && <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'Geist' }}>{hint}</span>}
    </div>
    {children}
    {error && <div style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600, marginTop: 6 }}>{error}</div>}
  </div>
);

// ─── Main create screen ────────────────────────────
const ChallengeCreateArtboard = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <AppHeader active="challenges" />

    {/* Action bar */}
    <div style={{
      height: 56, padding: '0 36px',
      display: 'flex', alignItems: 'center', gap: 16,
      borderBottom: '1px solid var(--border)', background: 'var(--surface)',
    }}>
      <button className="r-btn r-btn--ghost r-btn--sm" style={{ color: 'var(--text-muted)' }}>← 챌린지 목록</button>
      <div style={{ flex: 1 }}/>
      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>임시저장됨 · 18:42</span>
    </div>

    <div style={{ flex: 1, overflow: 'auto', padding: '40px 36px 60px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: 'var(--coral-700)', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 700 }}>NEW CHALLENGE</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.025em', margin: '6px 0 0', lineHeight: 1.05 }}>
            같이 할 사람, 모아볼까요?
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 10, maxWidth: 580, lineHeight: 1.55 }}>
            챌린지는 하나의 루틴을 멤버들과 함께 수행하는 형식이에요. 3단계만 입력하면 시작할 수 있어요.
          </p>
        </div>

        {/* Step indicator */}
        <ol style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          {[
            { n: 1, label: '기본 정보' },
            { n: 2, label: '기간 · 참여' },
            { n: 3, label: '루틴' },
          ].map((s, i) => (
            <li key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'Geist', color: 'var(--text)', fontWeight: 700 }}>0{s.n}</span>
              <span>{s.label}</span>
              {i < 2 && <span style={{ width: 18, height: 1, background: 'var(--border-strong)', marginLeft: 4 }}/>}
            </li>
          ))}
        </ol>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* ── Section 1: 기본 정보 ──────────────── */}
          <SectionCard num={1} title="기본 정보" sub="챌린지의 이름과 카테고리, 분위기를 정해요">
            <FieldRow label="챌린지 이름" required hint="9 / 100">
              <input className="r-input" defaultValue="21일 아침 러닝" style={{ fontSize: 16, fontWeight: 600, padding: '11px 14px' }} maxLength={100}/>
            </FieldRow>

            <FieldRow label="카테고리" required hint="챌린지와 루틴 모두에 적용돼요">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ROUTINE_CATEGORIES.filter(c => c.id !== 'all').map(c => {
                  const on = c.id === 'fitness';
                  return (
                    <button key={c.id} style={{
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
            </FieldRow>

            <FieldRow label="대표 이미지" hint="선택 · 챌린지 카드에 노출돼요">
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* Cover preview */}
                <div style={{
                  width: 140, height: 140, borderRadius: 16, flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--coral-500), var(--sunset-500))',
                  position: 'relative', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56,
                  color: 'white',
                }}>
                  🏃
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 90, height: 90, borderRadius: '50%', border: '2px solid rgba(255,255,255,.25)' }}/>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    이미지를 올리거나, 이모지로 간단히 표현할 수 있어요. JPG · PNG · 최대 5MB.
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="r-btn r-btn--sm" style={{ background: 'var(--text)', color: 'var(--surface)' }}>🖼 이미지 업로드</button>
                    <button className="r-btn r-btn--sm" style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-strong)' }}>이모지 선택</button>
                    <button className="r-btn r-btn--sm" style={{ background: 'transparent', color: 'var(--text-muted)' }}>제거</button>
                  </div>
                </div>
              </div>
            </FieldRow>
          </SectionCard>

          {/* ── Section 2: 기간 + 참여 설정 ──────── */}
          <SectionCard num={2} title="기간 및 참여 설정" sub="언제 어떻게 모일지 정해요">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FieldRow label="시작일" required>
                <div className="r-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 14 }}>
                  <span style={{ fontFamily: 'Geist', fontWeight: 600 }}>2026.05.27 (수)</span>
                  <Icon name="calendar" size={15} color="var(--text-muted)"/>
                </div>
              </FieldRow>
              <FieldRow label="종료일" required hint="21일">
                <div className="r-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 14 }}>
                  <span style={{ fontFamily: 'Geist', fontWeight: 600 }}>2026.06.16 (화)</span>
                  <Icon name="calendar" size={15} color="var(--text-muted)"/>
                </div>
              </FieldRow>
            </div>

            <FieldRow label="최대 참여 인원" required hint="최소 2명">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <input type="range" min="2" max="50" defaultValue="12" style={{ flex: 1, accentColor: 'var(--coral-500)' }}/>
                <div style={{
                  minWidth: 72, textAlign: 'right',
                  fontSize: 22, fontWeight: 800, fontFamily: 'Geist', color: 'var(--coral-600)',
                }}>
                  12<span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4, fontWeight: 600 }}>명</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>친근한 그룹은 5–15명을 추천해요</div>
            </FieldRow>

            <FieldRow label="공개 설정" required hint="비공개는 만든 후 초대 링크로 모집해요">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { v: 'public', icon: '🌍', label: '공개', sub: '공개 챌린지 목록에 노출돼요', on: true },
                  { v: 'private', icon: '🔒', label: '비공개', sub: '초대 링크로만 참여 가능' },
                ].map(o => (
                  <div key={o.v} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 12,
                    border: o.on ? '2px solid var(--coral-500)' : '1.5px solid var(--border-strong)',
                    background: o.on ? 'var(--coral-50)' : 'transparent',
                    cursor: 'pointer',
                  }}>
                    <span style={{ fontSize: 22 }}>{o.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{o.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{o.sub}</div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: o.on ? 'none' : '2px solid var(--border-strong)',
                      background: o.on ? 'var(--coral-500)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>{o.on && <Icon name="check" size={12} color="white" strokeWidth={3.5}/>}</div>
                  </div>
                ))}
              </div>
            </FieldRow>

            {/* ── 친구 초대: 닉네임 풀네임 검색 ───────────── */}
            <FieldRow
              label="친구 초대"
              hint="선택 · 3 / 12명"
            >
              <div style={{
                border: '1.5px solid var(--border-strong)', borderRadius: 12,
                background: 'var(--surface)', overflow: 'visible',
              }}>
                {/* Search input */}
                <div style={{ position: 'relative', padding: 10, borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10,
                    background: 'var(--surface-2)',
                  }}>
                    <Icon name="search" size={15} color="var(--text-muted)"/>
                    <input
                      defaultValue="달리는수달"
                      placeholder="닉네임 풀네임을 정확히 입력하세요"
                      style={{
                        flex: 1, border: 'none', outline: 'none', background: 'transparent',
                        fontSize: 14, fontWeight: 600, color: 'var(--text)',
                        fontFamily: 'inherit',
                      }}
                    />
                    <span style={{
                      fontSize: 11, color: 'var(--text-dim)', fontFamily: 'Geist',
                      padding: '2px 7px', borderRadius: 6, background: 'var(--surface)',
                      border: '1px solid var(--border)',
                    }}>Enter</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, paddingLeft: 4, lineHeight: 1.5 }}>
                    오타나 부분 일치는 검색되지 않아요. 닉네임은 대소문자를 구분해요.
                  </div>
                </div>

                {/* Search result — exact match found */}
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: 'var(--text-dim)',
                    letterSpacing: '.08em', textTransform: 'uppercase',
                    padding: '4px 6px 6px',
                  }}>검색 결과 · 1명</div>
                  {[
                    { nick: '달리는수달', handle: '@otter_run', avatar: '🦦', color: 'var(--coral-500)', mutual: '함께한 챌린지 2회' },
                  ].map(u => (
                    <div key={u.nick} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                      background: 'var(--coral-50)',
                    }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                        background: u.color, color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                      }}>{u.avatar}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{u.nick}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'Geist' }}>{u.handle}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{u.mutual}</div>
                      </div>
                      <button className="r-btn r-btn--sm" style={{
                        background: 'var(--coral-500)', color: 'white', fontWeight: 700,
                        padding: '6px 12px',
                      }}>
                        <Icon name="plus" size={12} color="white" strokeWidth={3}/> 초대
                      </button>
                    </div>
                  ))}
                </div>

                {/* Selected invitees */}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                      초대할 친구 <span style={{ fontFamily: 'Geist', color: 'var(--coral-600)', marginLeft: 4 }}>3</span>
                    </div>
                    <button style={{
                      border: 'none', background: 'transparent', cursor: 'pointer',
                      fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
                    }}>모두 지우기</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      { nick: '아침러너_지수', avatar: '🌅', color: 'var(--sunset-500)' },
                      { nick: '바다보러가자',   avatar: '🌊', color: 'var(--coral-600)' },
                      { nick: 'morning_kim',  avatar: '☀',  color: 'var(--coral-500)' },
                    ].map(c => (
                      <div key={c.nick} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '5px 8px 5px 5px', borderRadius: 999,
                        background: 'var(--surface-2)', border: '1px solid var(--border-strong)',
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: c.color, color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                        }}>{c.avatar}</div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{c.nick}</span>
                        <button style={{
                          width: 18, height: 18, borderRadius: '50%',
                          border: 'none', background: 'var(--border-strong)', color: 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', fontSize: 11, fontWeight: 700,
                        }}>×</button>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: 12, padding: '8px 10px', borderRadius: 8,
                    background: 'var(--surface-2)', display: 'flex', alignItems: 'flex-start', gap: 8,
                    fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.55,
                  }}>
                    <span style={{ fontSize: 12 }}>📨</span>
                    <span>챌린지를 만들면 초대장이 바로 발송돼요. 수락해야 멤버로 합류돼요.</span>
                  </div>
                </div>
              </div>
            </FieldRow>
          </SectionCard>

          {/* ── Section 3: 루틴 설정 ─────────────── */}
          <SectionCard num={3} title="루틴 설정" sub="이 챌린지에서 함께 수행할 루틴을 정해요">
            <div style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 16,
              background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5,
            }}>
              <span style={{ fontSize: 15 }}>💡</span>
              <span>챌린지 하나에는 루틴이 <b style={{ color: 'var(--text)' }}>한 개</b>만 들어가요. 카테고리는 위에서 정한 <b style={{ color: 'var(--coral-700)' }}>💪 운동</b>으로 적용돼요.</span>
            </div>

            <FieldRow label="루틴 이름" required hint="예: 5km 러닝">
              <input className="r-input" defaultValue="5km 러닝" style={{ fontSize: 15, fontWeight: 600 }}/>
            </FieldRow>

            <FieldRow label="반복 유형" required>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { v: 'daily',   label: '매일',     sub: '하루 한 번', on: true },
                  { v: 'weekly',  label: '매주',     sub: '주 1회 고정' },
                  { v: 'nweek',   label: '주 N회',   sub: '주마다 N번' },
                  { v: 'nmonth',  label: '월 N회',   sub: '월마다 N번' },
                ].map(o => (
                  <button key={o.v} style={{
                    padding: '12px 10px', borderRadius: 12,
                    border: o.on ? '2px solid var(--coral-500)' : '1.5px solid var(--border-strong)',
                    background: o.on ? 'var(--coral-50)' : 'var(--surface)',
                    color: o.on ? 'var(--coral-700)' : 'var(--text)',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{o.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{o.sub}</div>
                  </button>
                ))}
              </div>
            </FieldRow>

            {/* Conditional: repeat count — hidden state demo (commented overlay) */}
            <FieldRow label="반복 횟수" hint="'주 N회' 또는 '월 N회' 선택 시 표시">
              <div style={{ position: 'relative' }}>
                <div className="r-input" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: 14, opacity: 0.45, pointerEvents: 'none',
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>주 N회를 선택하면 활성화돼요</span>
                  <span style={{ fontFamily: 'Geist', fontWeight: 700 }}>—</span>
                </div>
              </div>
            </FieldRow>

            <FieldRow label="선호 수행 시간" hint="선택 · 멤버에게 권장 시간으로 표시돼요">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { v: 'dawn',    label: '새벽',   sub: '4–7시' },
                  { v: 'morning', label: '아침',   sub: '7–11시', on: true },
                  { v: 'noon',    label: '낮',     sub: '11–17시' },
                  { v: 'evening', label: '저녁',   sub: '17–22시' },
                  { v: 'night',   label: '밤',     sub: '22–4시' },
                  { v: 'custom',  label: '직접 입력', sub: '시간 지정' },
                  { v: 'none',    label: '없음',     sub: '자유롭게' },
                ].map(o => (
                  <button key={o.v} style={{
                    padding: '10px 8px', borderRadius: 10,
                    border: o.on ? '2px solid var(--coral-500)' : '1.5px solid var(--border-strong)',
                    background: o.on ? 'var(--coral-50)' : 'var(--surface)',
                    color: o.on ? 'var(--coral-700)' : 'var(--text)',
                    cursor: 'pointer', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{o.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2, fontFamily: 'Geist' }}>{o.sub}</div>
                  </button>
                ))}
              </div>
            </FieldRow>
          </SectionCard>
        </div>

        {/* Footer CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            필수 항목을 모두 입력하면 만들 수 있어요 <span style={{ color: 'var(--success)', fontWeight: 700, marginLeft: 6 }}>✓ 입력 완료</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="r-btn r-btn--ghost" style={{ border: '1px solid var(--border-strong)' }}>임시저장</button>
            <button className="r-btn r-btn--primary r-btn--lg">
              <Icon name="check" size={16} color="white" strokeWidth={3}/> 챌린지 만들기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Post-create: private → invite link modal ─────
const ChallengeCreatedInviteModalArtboard = () => (
  <div style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
    <AppHeader active="challenges" />
    {/* Dim layer */}
    <div style={{ flex: 1, opacity: 0.4, padding: '40px 36px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ fontSize: 11, color: 'var(--coral-700)', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 700 }}>NEW CHALLENGE</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.025em', margin: '6px 0 0' }}>같이 할 사람, 모아볼까요?</h1>
      </div>
    </div>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,18,12,.5)' }}/>

    {/* Centered modal */}
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 520, background: 'var(--surface)', borderRadius: 18, boxShadow: '0 30px 80px rgba(0,0,0,.3)', overflow: 'hidden' }}>
        {/* Hero strip */}
        <div style={{
          padding: '28px 28px 22px',
          background: 'linear-gradient(135deg, var(--coral-500), var(--sunset-500))',
          color: 'white', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -40, width: 180, height: 180, borderRadius: '50%', border: '2px solid rgba(255,255,255,.18)' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>🎉</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', opacity: 0.9 }}>비공개 챌린지가 만들어졌어요</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2, letterSpacing: '-0.01em' }}>21일 아침 러닝</div>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 13, opacity: 0.95, lineHeight: 1.5, position: 'relative' }}>
            아래 링크를 보내서 친구들을 초대해보세요. 링크로 들어온 사람만 참여할 수 있어요.
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <label style={{ ...LABEL, marginBottom: 8 }}>초대 링크</label>
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center',
            padding: '12px 14px', borderRadius: 12,
            border: '1.5px solid var(--border-strong)', background: 'var(--surface-2)',
          }}>
            <span style={{ fontSize: 14, fontFamily: 'Geist', color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              https://routinely.app/c/k7gM2xa9
            </span>
            <button className="r-btn r-btn--sm" style={{ background: 'var(--text)', color: 'var(--surface)' }}>
              <Icon name="link" size={13} color="white"/> 복사
            </button>
          </div>

          {/* Share quick row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {[
              { v: 'kakao', label: '카카오톡', emoji: '💬', bg: '#FEE500', color: '#3C1E1E' },
              { v: 'sms', label: '메시지', emoji: '✉', bg: 'var(--surface-2)', color: 'var(--text)' },
              { v: 'more', label: '다른 앱', emoji: '⋯', bg: 'var(--surface-2)', color: 'var(--text)' },
            ].map(s => (
              <button key={s.v} className="r-btn r-btn--sm" style={{
                flex: 1, justifyContent: 'center',
                background: s.bg, color: s.color, fontWeight: 700,
                border: s.bg === 'var(--surface-2)' ? '1px solid var(--border-strong)' : 'none',
              }}>
                <span style={{ marginRight: 4 }}>{s.emoji}</span>{s.label}
              </button>
            ))}
          </div>

          <div style={{
            marginTop: 18, padding: 12, borderRadius: 10,
            background: 'var(--surface-2)', display: 'flex', alignItems: 'flex-start', gap: 10,
            fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5,
          }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <span>비공개 챌린지는 검색에 노출되지 않아요. 시작일까지 누구든 링크로 들어올 수 있어요.</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', gap: 8,
          padding: '14px 24px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)',
        }}>
          <button className="r-btn" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-strong)' }}>나중에 공유</button>
          <button className="r-btn r-btn--primary">챌린지로 이동 →</button>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { ChallengeCreateArtboard, ChallengeCreatedInviteModalArtboard });
