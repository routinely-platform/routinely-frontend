// Routinely — Interactive prototype flow (clickable: login → home → challenge → chat)

const useProtoState = () => {
  const [screen, setScreen] = React.useState('login');
  const [completing, setCompleting] = React.useState(false);
  const [streak, setStreak] = React.useState(7);
  return { screen, setScreen, completing, setCompleting, streak, setStreak };
};

const ProtoLogin = ({ go }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', background: 'var(--bg)' }}>
    <div style={{ flex: 1, padding: '50px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 460 }}>
      <RoutinelyWordmark size={28} />
      <div style={{ marginTop: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--coral-600)' }}>WELCOME BACK</div>
        <h1 style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, margin: '10px 0 0' }}>오늘도<br/>시작해볼까요?</h1>
      </div>
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input className="r-input" defaultValue="hello@routinely.app" />
        <input className="r-input" type="password" defaultValue="••••••••" />
        <button className="r-btn r-btn--primary r-btn--lg" style={{ marginTop: 6 }} onClick={() => go('home')}>로그인 →</button>
      </div>
    </div>
    <div style={{ flex: 1.1, background: 'linear-gradient(140deg, var(--coral-500), var(--sunset-500))', padding: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -100, right: -100, width: 350, height: 350, borderRadius: '50%', border: '2px solid rgba(255,255,255,.15)' }}/>
      <div style={{ fontSize: 100, lineHeight: 1, fontWeight: 700, color: 'white', letterSpacing: '-0.04em' }}>21<span style={{ fontSize: 40 }}>🔥</span></div>
      <div style={{ color: 'rgba(255,255,255,.95)', fontSize: 18, fontWeight: 500, marginTop: 10, maxWidth: 340 }}>2,341명이 오늘 인증 완료</div>
    </div>
  </div>
);

const ProtoHome = ({ go, completing, setCompleting, streak, setStreak }) => {
  const [routines, setRoutines] = React.useState([
    { done: true, name: '아침 물 한 잔', time: '07:00', emoji: '💧', streak: 21 },
    { done: true, name: '명상 10분', time: '07:30', emoji: '🧘', streak: 14 },
    { done: false, name: '러닝 5km', time: '18:00', emoji: '🏃', streak: streak },
    { done: false, name: '독서 30분', time: '22:00', emoji: '📚', streak: 12 },
  ]);
  const completeRoutine = (i) => {
    if (routines[i].done) return;
    setCompleting(true);
    setTimeout(() => {
      setRoutines(rs => rs.map((r, j) => j === i ? { ...r, done: true, streak: r.streak + 1 } : r));
      setStreak(s => s + 1);
      setCompleting(false);
    }, 2200);
  };
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative' }}>
      <AppHeader active="home" />
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>4월 25일 토요일</div>
            <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', margin: '4px 0 0', lineHeight: 1.05 }}>좋은 아침, <span style={{ color: 'var(--coral-600)' }}>지수</span>님 ☀️</h1>
          </div>
          <div className="r-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="r-flame" style={{ fontSize: 26 }}>🔥</span>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Geist', lineHeight: 1 }}>{21}</div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>Day Streak</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>오늘의 루틴</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{routines.filter(r => r.done).length}/{routines.length} 완료</span>
        </div>
        <div className="r-card" style={{ padding: 6 }}>
          {routines.map((r, i) => (
            <div key={i} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < routines.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, border: r.done ? 'none' : '2px solid var(--border-strong)', background: r.done ? 'var(--coral-500)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: r.done ? 'default' : 'pointer', transition: 'all .2s' }} onClick={() => completeRoutine(i)}>
                {r.done && <Icon name="check" size={14} color="white" strokeWidth={3.5}/>}
              </div>
              <div style={{ fontSize: 20 }}>{r.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, textDecoration: r.done ? 'line-through' : 'none', color: r.done ? 'var(--text-muted)' : 'var(--text)' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{r.time} · 🔥 {r.streak}일</div>
              </div>
              {!r.done && <button className="r-btn r-btn--primary r-btn--sm" onClick={() => completeRoutine(i)}>완료</button>}
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '24px 0 10px' }}>참여 중인 챌린지</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { name: '21일 아침 러닝', members: 12, day: 14, total: 21, color: 'var(--coral-500)', emoji: '🏃', clickable: true },
            { name: '하루 한 권 독서', members: 8, day: 5, total: 30, color: 'var(--info)', emoji: '📚' },
          ].map((c, i) => (
            <div key={i} className="r-card" style={{ padding: 16, cursor: c.clickable ? 'pointer' : 'default', transition: 'transform .15s' }} onClick={() => c.clickable && go('challenge')} onMouseEnter={e => c.clickable && (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseLeave={e => c.clickable && (e.currentTarget.style.transform = '')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="r-badge r-badge--active">● Active</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>D-{c.total - c.day}</span>
              </div>
              <div style={{ fontSize: 26, marginTop: 8 }}>{c.emoji}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{c.name}</div>
              <div style={{ height: 5, background: 'var(--ink-100)', borderRadius: 3, marginTop: 10 }}>
                <div style={{ width: `${c.day/c.total*100}%`, height: '100%', background: c.color, borderRadius: 3 }}/>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Day {c.day} of {c.total} {c.clickable && '· 자세히 →'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Success overlay */}
      {completing && (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, var(--coral-500), var(--sunset-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: 10, padding: 30 }}>
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            const dist = 160 + Math.random() * 100;
            const colors = ['#FFD166','#FFFFFF','#06D6A0','#FFEFE5'];
            return <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 8 + Math.random() * 8, height: 8 + Math.random() * 8,
              background: colors[i % 4], borderRadius: i % 3 === 0 ? '50%' : 2,
              '--dx': Math.cos(angle) * dist + 'px', '--dy': Math.sin(angle) * dist + 'px',
              animation: `confettiBurst 1.4s ${i * 0.02}s ease-out forwards`,
            }}/>;
          })}
          <div style={{ width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'successPop .7s cubic-bezier(.2,.9,.3,1.4)' }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={64} color="var(--coral-500)" strokeWidth={3.5}/>
            </div>
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, color: 'white', marginTop: 24, animation: 'successPop .9s .1s both' }}>완료!</div>
          <div style={{ marginTop: 16, padding: '10px 20px', background: 'rgba(255,255,255,.2)', borderRadius: 999, color: 'white', display: 'flex', alignItems: 'center', gap: 10, animation: 'successPop 1s .3s both' }}>
            <span className="r-flame" style={{ fontSize: 22 }}>🔥</span>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Geist' }}>스트릭 +1!</div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProtoChallenge = ({ go }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <AppHeader active="challenges" />
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--coral-500), var(--sunset-500))', padding: '24px 32px 28px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -50, width: 280, height: 280, borderRadius: '50%', border: '2px solid rgba(255,255,255,.15)' }}/>
        <button className="r-btn r-btn--ghost r-btn--sm" style={{ color: 'white', marginBottom: 12 }} onClick={() => go('home')}>← 홈으로</button>
        <span className="r-badge" style={{ background: 'rgba(255,255,255,.25)', color: 'white' }}>● ACTIVE · D-7</span>
        <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', margin: '10px 0 4px', lineHeight: 1 }}>21일 아침 러닝 🏃</h1>
        <div style={{ fontSize: 14, opacity: 0.95, maxWidth: 460 }}>매일 아침 7시 전에 5km. 함께 뛰면 외롭지 않아요.</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 18 }}>
          <div><div style={{ fontSize: 10, opacity: 0.85, fontWeight: 700, letterSpacing: '.1em' }}>MEMBERS</div><div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Geist', lineHeight: 1 }}>12</div></div>
          <div><div style={{ fontSize: 10, opacity: 0.85, fontWeight: 700, letterSpacing: '.1em' }}>완료율</div><div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Geist', lineHeight: 1 }}>87%</div></div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button className="r-btn" style={{ background: 'white', color: 'var(--coral-700)' }} onClick={() => go('chat')}><Icon name="chat" size={16}/>채팅방 열기 →</button>
        </div>
      </div>
      <div style={{ padding: 28 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 700 }}>🏆 리더보드</h3>
        <div className="r-card" style={{ padding: 6 }}>
          {[
            { rank: 1, name: '민지', color: '#FFD166', count: 19 },
            { rank: 2, name: '준호', color: '#06D6A0', count: 17 },
            { rank: 3, name: '지수', color: '#FF8A65', count: 16, me: true },
            { rank: 4, name: '다은', color: '#9D4EDD', count: 14 },
            { rank: 5, name: '서윤', color: '#118AB2', count: 13 },
          ].map(p => (
            <div key={p.rank} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: p.me ? 'var(--coral-50)' : 'transparent', borderRadius: 10, borderBottom: p.rank < 5 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Geist', width: 20, color: p.rank === 1 ? 'var(--coral-600)' : 'var(--text-muted)' }}>{p.rank}</div>
              <Avatar name={p.name[0]} color={p.color} size={32}/>
              <div style={{ flex: 1, fontSize: 14, fontWeight: p.me ? 700 : 500 }}>{p.name}{p.me && <span style={{ fontSize: 10, color: 'var(--coral-600)', marginLeft: 6 }}>YOU</span>}</div>
              <div style={{ width: 100, height: 6, background: 'var(--ink-100)', borderRadius: 3 }}><div style={{ width: `${p.count/19*100}%`, height: '100%', background: 'var(--coral-500)', borderRadius: 3 }}/></div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Geist', width: 28, textAlign: 'right' }}>{p.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ProtoChat = ({ go }) => {
  const [msgs, setMsgs] = React.useState([
    { type: 'sys', text: '🔥 민지님이 18일 스트릭 달성!' },
    { mine: false, name: '민지', color: '#FFD166', time: '06:42', text: '오늘 한강 진짜 죽이는 풍경이었어요 🌅' },
    { mine: false, name: '준호', color: '#06D6A0', time: '06:48', text: '와 부럽네요 ㅠㅠ 저는 지금 출발' },
    { mine: true, time: '06:50', text: '저도 막 도착했어요! 페이스 맞춰봐요 💪' },
    { mine: false, name: '다은', color: '#9D4EDD', time: '06:51', text: '저는 오늘 5번째 인증! 🎉' },
  ]);
  const [draft, setDraft] = React.useState('');
  const send = () => {
    if (!draft.trim()) return;
    setMsgs(m => [...m, { mine: true, time: '지금', text: draft }]);
    setDraft('');
  };
  const scrollRef = React.useRef(null);
  React.useEffect(() => { scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight); }, [msgs]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <AppHeader active="challenges" />
      <div style={{ height: 60, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 28px', background: 'var(--surface)' }}>
        <button className="r-btn r-btn--ghost r-btn--sm" style={{ color: 'var(--text-muted)' }} onClick={() => go('challenge')}>← 챌린지</button>
        <span style={{ fontSize: 26 }}>🏃</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>21일 아침 러닝</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>12명 · 5명 온라인</div>
        </div>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => m.type === 'sys' ? (
          <div key={i} style={{ alignSelf: 'center', fontSize: 11, color: 'var(--text-muted)', padding: '5px 12px', background: 'var(--coral-50)', borderRadius: 999 }}>{m.text}</div>
        ) : m.mine ? (
          <div key={i} style={{ alignSelf: 'flex-end', maxWidth: 360 }}>
            <div style={{ background: 'var(--coral-500)', color: 'white', padding: '9px 13px', borderRadius: '16px 16px 4px 16px', fontSize: 13.5 }}>{m.text}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, textAlign: 'right' }}>{m.time}</div>
          </div>
        ) : (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <Avatar name={m.name[0]} color={m.color} size={28}/>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, marginLeft: 10, fontWeight: 600 }}>{m.name} · {m.time}</div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '9px 13px', borderRadius: '4px 16px 16px 16px', fontSize: 13.5, maxWidth: 320 }}>{m.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 28px 18px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="r-input" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 6px 6px 14px' }}>
          <Icon name="image" size={18} color="var(--text-muted)"/>
          <input style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 14 }} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="메시지 보내기..."/>
          <button className="r-btn r-btn--primary r-btn--sm" onClick={send} style={{ padding: '7px 12px' }}><Icon name="send" size={14} color="white"/></button>
        </div>
      </div>
    </div>
  );
};

const ProtoFlow = () => {
  const s = useProtoState();
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {s.screen === 'login' && <ProtoLogin go={s.setScreen}/>}
      {s.screen === 'home' && <ProtoHome go={s.setScreen} completing={s.completing} setCompleting={s.setCompleting} streak={s.streak} setStreak={s.setStreak}/>}
      {s.screen === 'challenge' && <ProtoChallenge go={s.setScreen}/>}
      {s.screen === 'chat' && <ProtoChat go={s.setScreen}/>}
      {/* Floating breadcrumb */}
      <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, padding: 4, background: 'rgba(20,18,12,.85)', backdropFilter: 'blur(12px)', borderRadius: 999, zIndex: 100 }}>
        {[['login','로그인'],['home','홈'],['challenge','챌린지'],['chat','채팅']].map(([k, l]) => (
          <button key={k} onClick={() => s.setScreen(k)} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', background: s.screen === k ? 'var(--coral-500)' : 'transparent', color: s.screen === k ? 'white' : 'rgba(255,255,255,.7)', fontFamily: 'inherit' }}>{l}</button>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { ProtoFlow });
