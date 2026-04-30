// Routinely — Auth + Home Dashboard artboards

const Avatar = ({ name = '김', color = '#FF8A65', size = 36, ring = false }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', background: color,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: 700, fontSize: size * 0.42,
    boxShadow: ring ? '0 0 0 2.5px var(--surface), 0 0 0 4px var(--coral-500)' : 'none',
    flexShrink: 0,
    fontFamily: "'Pretendard', sans-serif",
  }}>{name}</div>
);

const AvatarStack = ({ items, size = 28 }) => (
  <div style={{ display: 'flex' }}>
    {items.map((it, i) => (
      <div key={i} style={{ marginLeft: i ? -size * 0.32 : 0, border: '2px solid var(--surface)', borderRadius: '50%', display: 'flex' }}>
        <Avatar {...it} size={size} />
      </div>
    ))}
  </div>
);

// ─── Login ─────────────────────────────────
const LoginArtboard = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', background: 'var(--bg)' }}>
    <div style={{ flex: 1, padding: '60px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 520 }}>
      <RoutinelyWordmark size={36} />
      <div style={{ marginTop: 60 }}>
        <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--coral-600)' }}>WELCOME BACK</div>
        <h1 style={{ fontSize: 56, lineHeight: 1, letterSpacing: '-0.035em', fontWeight: 700, margin: '12px 0 0' }}>오늘도<br/>시작해볼까요?</h1>
        <div style={{ color: 'var(--text-muted)', marginTop: 14, fontSize: 15 }}>21일째 함께하는 친구들이 기다리고 있어요.</div>
      </div>
      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>이메일</label>
          <input className="r-input" defaultValue="hello@routinely.app" style={{ marginTop: 6 }}/>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>비밀번호</label>
          <input className="r-input" type="password" defaultValue="••••••••••" style={{ marginTop: 6 }}/>
        </div>
        <button className="r-btn r-btn--primary r-btn--lg" style={{ marginTop: 8, width: '100%' }}>로그인 →</button>
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <button className="r-btn r-btn--ghost" style={{ flex: 1, border: '1.5px solid var(--border-strong)' }}>Google로 계속</button>
          <button className="r-btn r-btn--ghost" style={{ flex: 1, border: '1.5px solid var(--border-strong)' }}>Apple로 계속</button>
        </div>
        <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
          처음이신가요? <a style={{ color: 'var(--coral-600)', fontWeight: 600 }}>회원가입</a>
        </div>
      </div>
    </div>
    <div style={{ flex: 1.1, background: 'linear-gradient(140deg, var(--coral-500), var(--sunset-500))', padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', border: '2px solid rgba(255,255,255,.15)' }}/>
      <div style={{ position: 'absolute', bottom: -150, left: -50, width: 500, height: 500, borderRadius: '50%', border: '2px solid rgba(255,255,255,.1)' }}/>
      <div style={{ color: 'rgba(255,255,255,.8)', fontWeight: 600, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase' }}>Streak · Day 21</div>
      <div>
        <div style={{ fontSize: 130, lineHeight: 1, fontWeight: 700, color: 'white', letterSpacing: '-0.04em' }}>21<span style={{ fontSize: 50, marginLeft: 8 }}>🔥</span></div>
        <div style={{ color: 'rgba(255,255,255,.95)', fontSize: 22, fontWeight: 500, marginTop: 12, maxWidth: 380, lineHeight: 1.3 }}>"가장 어려운 건 시작이 아니라, 어제도 했다는 사실을 오늘 기억하는 일이에요."</div>
        <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AvatarStack items={[{name:'지',color:'#FFD166'},{name:'민',color:'#06D6A0'},{name:'준',color:'#118AB2'}]} size={32}/>
          <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>2,341명이 오늘 인증 완료</span>
        </div>
      </div>
    </div>
  </div>
);

// ─── Signup ─────────────────────────────────
const SignupArtboard = () => (
  <div style={{ width: '100%', height: '100%', background: 'var(--bg)', padding: '50px 60px', display: 'flex', flexDirection: 'column' }}>
    <RoutinelyWordmark size={28} />
    <div style={{ display: 'flex', gap: 4, marginTop: 36 }}>
      {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= 2 ? 'var(--coral-500)' : 'var(--ink-100)' }}/>)}
    </div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontWeight: 600 }}>Step 2 of 3 · 프로필 만들기</div>
    <h1 style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, margin: '24px 0 8px' }}>어떻게<br/>불러드릴까요?</h1>
    <div style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28 }}>친구들이 피드에서 보게 될 이름이에요.</div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 460 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600 }}>닉네임</label>
        <input className="r-input" defaultValue="지수" style={{ marginTop: 6 }}/>
        <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 6, fontWeight: 600 }}>✓ 사용 가능한 닉네임이에요</div>
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600 }}>아바타 색상</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {['#FF8A65','#FFD166','#06D6A0','#118AB2','#9D4EDD','#EF476F'].map((c, i) => (
            <div key={c} style={{ width: 44, height: 44, borderRadius: '50%', background: c, cursor: 'pointer', boxShadow: i === 0 ? '0 0 0 3px var(--surface), 0 0 0 5px var(--coral-500)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>지</div>
          ))}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600 }}>가장 만들고 싶은 루틴은?</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {['🏃 운동', '📚 독서', '🧘 명상', '💧 물 마시기', '🌅 일찍 일어나기', '✍️ 글쓰기'].map((g, i) => (
            <span key={g} style={{ padding: '8px 14px', borderRadius: 999, border: i === 0 ? '1.5px solid var(--coral-500)' : '1.5px solid var(--border-strong)', background: i === 0 ? 'var(--coral-100)' : 'var(--surface)', fontSize: 13, fontWeight: 600, color: i === 0 ? 'var(--coral-700)' : 'var(--text)', cursor: 'pointer' }}>{g}</span>
          ))}
        </div>
      </div>
    </div>
    <div style={{ marginTop: 'auto', paddingTop: 32, display: 'flex', gap: 10 }}>
      <button className="r-btn r-btn--ghost">← 이전</button>
      <button className="r-btn r-btn--primary r-btn--lg" style={{ marginLeft: 'auto' }}>다음 →</button>
    </div>
  </div>
);

// ─── App Header (reused) ──────────────────────
const AppHeader = ({ active = 'home', notifs = 3 }) => {
  const items = [
    { id: 'home', label: '홈', icon: 'home' },
    { id: 'routines', label: '내 루틴', icon: 'repeat' },
    { id: 'challenges', label: '챌린지', icon: 'trophy' },
    { id: 'feed', label: '피드', icon: 'feed' },
    { id: 'stats', label: '통계', icon: 'chart' },
  ];
  return (
    <div style={{ height: 64, borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 24, flexShrink: 0 }}>
      <RoutinelyWordmark size={22} />
      <nav style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
        {items.map(it => (
          <a key={it.id} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: it.id === active ? 'var(--text)' : 'var(--text-muted)', background: it.id === active ? 'var(--surface-2)' : 'transparent', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <Icon name={it.icon} size={16}/>{it.label}
          </a>
        ))}
      </nav>
      <div style={{ flex: 1 }}/>
      <div style={{ position: 'relative', padding: 8, cursor: 'pointer' }}>
        <Icon name="bell" size={20}/>
        {notifs > 0 && <div style={{ position: 'absolute', top: 4, right: 4, background: 'var(--coral-500)', color: 'white', fontSize: 9, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid var(--surface)' }}>{notifs}</div>}
      </div>
      <Avatar name="지" color="#FF8A65" size={32}/>
    </div>
  );
};

// ─── Home Dashboard ────────────────────────
const HomeArtboard = ({ darkVariant = false }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <AppHeader active="home" />
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 36px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{new Date().toLocaleDateString('ko-KR', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', margin: '4px 0 0', lineHeight: 1.05 }}>
                좋은 아침이에요,<br/><span style={{ color: 'var(--coral-600)' }}>지수</span>님 ☀️
              </h1>
            </div>
            <div className="r-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="r-flame" style={{ fontSize: 32 }}>🔥</span>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, fontFamily: 'Geist' }}>21</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>Day Streak</div>
              </div>
            </div>
          </div>

          {/* Today's routines */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>오늘의 루틴</h3>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· 4개 중 2개 완료</span>
            <div style={{ flex: 1 }}/>
            <button className="r-btn r-btn--ghost r-btn--sm" style={{ color: 'var(--text-muted)' }}><Icon name="plus" size={14}/>추가</button>
          </div>
          <div className="r-card" style={{ padding: 6 }}>
            {[
              { done: true, name: '아침 물 한 잔', time: '07:00', emoji: '💧', streak: 21 },
              { done: true, name: '명상 10분', time: '07:30', emoji: '🧘', streak: 14 },
              { done: false, name: '러닝 5km', time: '18:00', emoji: '🏃', streak: 7 },
              { done: false, name: '독서 30분', time: '22:00', emoji: '📚', streak: 12 },
            ].map((r, i) => (
              <div key={i} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 9, border: r.done ? 'none' : '2px solid var(--border-strong)', background: r.done ? 'var(--coral-500)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {r.done && <Icon name="check" size={16} color="white" strokeWidth={3}/>}
                </div>
                <div style={{ fontSize: 22 }}>{r.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, textDecoration: r.done ? 'line-through' : 'none', color: r.done ? 'var(--text-muted)' : 'var(--text)' }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', gap: 10 }}>
                    <span><Icon name="clock" size={11} style={{ marginRight: 3, verticalAlign: -1 }}/>{r.time}</span>
                    <span>🔥 {r.streak}일</span>
                  </div>
                </div>
                {!r.done && <button className="r-btn r-btn--primary r-btn--sm">완료</button>}
              </div>
            ))}
          </div>

          {/* Active challenges */}
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '32px 0 12px' }}>참여 중인 챌린지</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { name: '21일 아침 러닝', members: 12, day: 14, total: 21, color: 'var(--coral-500)', emoji: '🏃' },
              { name: '하루 한 권 독서', members: 8, day: 5, total: 30, color: 'var(--info)', emoji: '📚' },
            ].map((c, i) => (
              <div key={i} className="r-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="r-badge r-badge--active">● Active</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>D-{c.total - c.day}</span>
                </div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{c.emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <AvatarStack items={[{name:'지',color:'#FF8A65'},{name:'민',color:'#FFD166'},{name:'준',color:'#06D6A0'}]} size={20}/>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>+{c.members - 3}명</span>
                </div>
                <div style={{ height: 6, background: 'var(--ink-100)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${c.day/c.total*100}%`, height: '100%', background: c.color }}/>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Day {c.day} of {c.total}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="r-card" style={{ padding: 20, background: 'linear-gradient(135deg, var(--coral-500), var(--sunset-500))', color: 'white', border: 'none' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', opacity: 0.9 }}>WEEKLY GOAL</div>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 6, lineHeight: 1 }}>5/7 days</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>목표까지 2일 남았어요!</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
              {['월','화','수','목','금','토','일'].map((d, i) => (
                <div key={d} style={{ flex: 1, height: 36, borderRadius: 6, background: i < 5 ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i < 5 ? 'var(--coral-600)' : 'rgba(255,255,255,.8)' }}>{d}</div>
              ))}
            </div>
          </div>

          <div className="r-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>알림</h4>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--coral-600)' }}>3개 새로움</span>
            </div>
            {[
              { color: '#FFD166', name: '민지', text: '님이 회원님의 루틴에 🎉를 보냈어요', time: '5분 전' },
              { color: '#06D6A0', name: '준호', text: '님이 \'아침 러닝\' 챌린지에 참여했어요', time: '12분 전' },
              { color: 'var(--coral-500)', name: '시스템', text: '오늘의 독서 루틴이 곧 시작돼요 (10분 후)', time: '방금' },
            ].map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <Avatar name={n.name[0]} color={n.color} size={28}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, lineHeight: 1.4 }}><b>{n.name}</b>{n.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{n.time}</div>
                </div>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--coral-500)', flexShrink: 0, marginTop: 6 }}/>
              </div>
            ))}
          </div>

          <div className="r-card" style={{ padding: 20 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>이번 주 동료</h4>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>아침 러닝 챌린지 · 리더보드</div>
            {[
              { rank: 1, name: '민지', color: '#FFD166', count: 18, me: false },
              { rank: 2, name: '지수', color: '#FF8A65', count: 16, me: true },
              { rank: 3, name: '준호', color: '#06D6A0', count: 14, me: false },
            ].map(p => (
              <div key={p.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <div style={{ fontFamily: 'Geist', fontSize: 14, fontWeight: 700, width: 18, color: p.rank === 1 ? 'var(--coral-600)' : 'var(--text-muted)' }}>{p.rank}</div>
                <Avatar name={p.name[0]} color={p.color} size={24}/>
                <div style={{ flex: 1, fontSize: 13, fontWeight: p.me ? 700 : 500 }}>{p.name}{p.me && <span style={{ fontSize: 10, color: 'var(--coral-600)', marginLeft: 6, fontWeight: 700 }}>YOU</span>}</div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Geist' }}>{p.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { Avatar, AvatarStack, AppHeader, LoginArtboard, SignupArtboard, HomeArtboard });
