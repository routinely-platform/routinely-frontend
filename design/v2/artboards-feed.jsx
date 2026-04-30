// Routinely — Feed, Chat, Stats, Notifications, Profile artboards

// ─── Feed ──────────────────────
const FeedArtboard = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <AppHeader active="feed" />
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 36px', maxWidth: 760, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>피드</h1>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999 }}>
          {['전체','내 친구','챌린지'].map((t, i) => (
            <span key={t} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: i === 0 ? 'var(--text)' : 'transparent', color: i === 0 ? 'var(--surface)' : 'var(--text-muted)', cursor: 'pointer' }}>{t}</span>
          ))}
        </div>
      </div>

      {[
        { name: '민지', color: '#FFD166', time: '2분 전', routine: '아침 러닝', emoji: '🏃', detail: '5.2km · 26분', streak: 18, reactions: { '🔥': 12, '💪': 5, '👏': 3 }, comment: '오늘 날씨 진짜 좋았어요!', img: true },
        { name: '준호', color: '#06D6A0', time: '12분 전', routine: '독서', emoji: '📚', detail: '《미라클 모닝》 30분', streak: 8, reactions: { '🔥': 4, '✨': 2 } },
        { name: '다은', color: '#9D4EDD', time: '1시간 전', routine: '명상', emoji: '🧘', detail: '저녁 명상 10분 완료', streak: 24, reactions: { '🔥': 18, '🙏': 7, '💛': 4 } },
      ].map((p, i) => (
        <div key={i} className="r-card" style={{ padding: 20, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={p.name[0]} color={p.color} size={42}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>· {p.time}</span></div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🔥 {p.streak}일 연속 · {p.routine}</div>
            </div>
            <span style={{ fontSize: 28 }}>{p.emoji}</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, marginTop: 12, lineHeight: 1.4 }}>{p.detail}</div>
          {p.comment && <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>"{p.comment}"</div>}
          {p.img && <div style={{ marginTop: 14, height: 200, borderRadius: 12, background: 'linear-gradient(135deg, #FFD166, var(--coral-500))', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,.4), transparent 60%)' }}/>
            <div style={{ position: 'absolute', bottom: 14, left: 16, color: 'white', fontWeight: 700, fontSize: 13 }}>📍 한강공원 · 06:42</div>
          </div>}
          <div style={{ display: 'flex', gap: 6, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            {Object.entries(p.reactions).map(([e, n]) => (
              <span key={e} style={{ padding: '5px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 999, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ animation: 'reactionPop .5s' }}>{e}</span>{n}
              </span>
            ))}
            <span style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px dashed var(--border-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer' }}>+</span>
            <div style={{ flex: 1 }}/>
            <button className="r-btn r-btn--ghost r-btn--sm" style={{ color: 'var(--text-muted)' }}><Icon name="chat" size={14}/>댓글</button>
          </div>
          {i === 0 && (
            <div style={{ marginTop: 12, padding: 10, background: 'var(--coral-50)', borderRadius: 12, display: 'flex', gap: 6 }}>
              {['🔥','💪','👏','❤️','✨','🙏','💯'].map(e => (
                <div key={e} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', boxShadow: 'var(--sh-1)' }}>{e}</div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// ─── Chat ──────────────────────
const ChatArtboard = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <AppHeader active="challenges" />
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar: room info */}
      <div style={{ width: 280, borderRight: '1px solid var(--border)', background: 'var(--surface)', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button className="r-btn r-btn--ghost r-btn--sm" style={{ alignSelf: 'flex-start', padding: 0, color: 'var(--text-muted)' }}>← 챌린지로</button>
        <div>
          <div style={{ fontSize: 36 }}>🏃</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>21일 아침 러닝</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>12명 · Day 14/21</div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>온라인 (5)</div>
          {[['민지','#FFD166'],['준호','#06D6A0'],['다은','#9D4EDD'],['시우','#118AB2'],['하준','#EF476F']].map(([n,c]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
              <div style={{ position: 'relative' }}>
                <Avatar name={n[0]} color={c} size={28}/>
                <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, background: 'var(--success)', borderRadius: '50%', border: '2px solid var(--surface)' }}/>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ alignSelf: 'center', fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, padding: '4px 12px', borderRadius: 999, background: 'var(--surface-2)' }}>오늘 · 4월 25일</div>

          {/* System message */}
          <div style={{ alignSelf: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '6px 14px', background: 'var(--coral-50)', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔥</span><span><b>민지</b>님이 18일째 스트릭을 달성했어요!</span>
          </div>

          {/* Other message */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <Avatar name="민" color="#FFD166" size={32}/>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, marginLeft: 12 }}>민지 · 06:42</div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '4px 18px 18px 18px', fontSize: 14, maxWidth: 320 }}>오늘 한강 진짜 죽이는 풍경이었어요 🌅</div>
            </div>
          </div>

          {/* Image message */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginLeft: 42 }}>
            <div style={{ width: 240, height: 160, borderRadius: 18, background: 'linear-gradient(135deg, #FFD166, var(--coral-500))', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,.5), transparent 60%)' }}/>
              <div style={{ position: 'absolute', bottom: 10, left: 14, color: 'white', fontSize: 11, fontWeight: 700 }}>📍 한강공원</div>
            </div>
          </div>

          {/* Other message */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <Avatar name="준" color="#06D6A0" size={32}/>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, marginLeft: 12 }}>준호 · 06:48</div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '4px 18px 18px 18px', fontSize: 14, maxWidth: 320 }}>와 부럽네요 ㅠㅠ 저는 지금 출발</div>
            </div>
          </div>

          {/* My message */}
          <div style={{ alignSelf: 'flex-end', maxWidth: 360 }}>
            <div style={{ background: 'var(--coral-500)', color: 'white', padding: '10px 14px', borderRadius: '18px 18px 4px 18px', fontSize: 14 }}>저도 막 도착했어요! 오늘 페이스 한번 맞춰봐요 💪</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>06:50 · 읽음</div>
          </div>

          {/* Reaction inline */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <Avatar name="다" color="#9D4EDD" size={32}/>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, marginLeft: 12 }}>다은 · 06:51</div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '4px 18px 18px 18px', fontSize: 14, maxWidth: 320, position: 'relative' }}>
                저는 오늘 5번째 인증! 🎉
                <div style={{ position: 'absolute', bottom: -10, left: 14, padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, fontSize: 12, boxShadow: 'var(--sh-1)' }}>🔥 3</div>
              </div>
            </div>
          </div>

          {/* Typing indicator */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
            <Avatar name="시" color="#118AB2" size={28}/>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: 18, display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--text-dim)', animation: `flameWiggle 1.2s ${i*0.15}s infinite` }}/>)}
            </div>
          </div>
        </div>

        {/* Composer */}
        <div style={{ padding: '14px 24px 18px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="r-input" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px 8px 14px' }}>
            <Icon name="image" size={18} color="var(--text-muted)"/>
            <input style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 14 }} placeholder="메시지 보내기..." defaultValue="다들 화이팅"/>
            <button className="r-btn r-btn--primary r-btn--sm" style={{ padding: '7px 12px' }}><Icon name="send" size={14} color="white"/></button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Stats ──────────────────────
const StatsArtboard = () => {
  // Generate heatmap data — 7 rows (days of week) × 18 weeks
  const heat = Array.from({ length: 7 * 18 }).map(() => Math.random());
  const heatColor = (v) => {
    if (v < 0.2) return 'var(--ink-100)';
    if (v < 0.5) return 'var(--coral-200)';
    if (v < 0.75) return 'var(--coral-400)';
    return 'var(--coral-600)';
  };
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <AppHeader active="stats" />
      <div style={{ flex: 1, overflow: 'auto', padding: '32px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>STATS · LAST 4 MONTHS</div>
            <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', margin: '4px 0 0' }}>꾸준함이<br/>모이고 있어요.</h1>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999 }}>
            {['주','월','년','전체'].map((t, i) => (
              <span key={t} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: i === 1 ? 'var(--text)' : 'transparent', color: i === 1 ? 'var(--surface)' : 'var(--text-muted)', cursor: 'pointer' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Big stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'CURRENT STREAK', value: '21', unit: '일', emoji: '🔥', accent: true },
            { label: 'LONGEST STREAK', value: '35', unit: '일', emoji: '🏆' },
            { label: 'TOTAL COMPLETED', value: '142', unit: '회', emoji: '✓' },
            { label: 'COMPLETION RATE', value: '87', unit: '%', emoji: '📈' },
          ].map(s => (
            <div key={s.label} className="r-card" style={{ padding: 20, background: s.accent ? 'linear-gradient(135deg, var(--coral-500), var(--sunset-500))' : undefined, color: s.accent ? 'white' : undefined, border: s.accent ? 'none' : undefined }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', opacity: s.accent ? 0.9 : 0.5 }}>{s.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 800, fontFamily: 'Geist', lineHeight: 1, letterSpacing: '-0.03em' }}>{s.value}</span>
                <span style={{ fontSize: 16, fontWeight: 600, opacity: s.accent ? 0.9 : 0.7 }}>{s.unit}</span>
                <span style={{ marginLeft: 'auto', fontSize: 22 }}>{s.emoji}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="r-card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>활동 히트맵</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
              덜<div style={{ display: 'flex', gap: 2 }}>{['var(--ink-100)','var(--coral-200)','var(--coral-400)','var(--coral-600)'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: 2, background: c }}/>)}</div>더
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, paddingLeft: 24 }}>
            {['1월','2월','3월','4월'].map(m => <div key={m} style={{ flex: 1, fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{m}</div>)}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, paddingTop: 2 }}>
              {['M','','W','','F','',''].map((d, i) => <div key={i} style={{ height: 14 }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18, 1fr)', gridAutoRows: 14, gap: 3, flex: 1 }}>
              {Array.from({ length: 18 }).map((_, w) => (
                Array.from({ length: 7 }).map((__, d) => (
                  <div key={`${w}-${d}`} style={{ background: heatColor(heat[w*7+d]), borderRadius: 3, gridColumn: w + 1, gridRow: d + 1 }}/>
                ))
              ))}
            </div>
          </div>
        </div>

        {/* Per-routine bars */}
        <div className="r-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 700 }}>루틴별 달성률 (이번 달)</h3>
          {[
            { emoji: '💧', name: '아침 물 한 잔', val: 96 },
            { emoji: '🧘', name: '명상 10분', val: 84 },
            { emoji: '📚', name: '독서 30분', val: 72 },
            { emoji: '🏃', name: '러닝 5km', val: 58 },
            { emoji: '💊', name: '비타민', val: 100 },
          ].map(r => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0' }}>
              <div style={{ fontSize: 22 }}>{r.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Geist' }}>{r.val}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--ink-100)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${r.val}%`, height: '100%', background: r.val >= 90 ? 'var(--success)' : r.val >= 70 ? 'var(--coral-500)' : 'var(--sunset-500)' }}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Notifications ──────────────────────
const NotificationsArtboard = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <AppHeader active="home" />
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 36px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>알림</h1>
        <button className="r-btn r-btn--ghost r-btn--sm" style={{ color: 'var(--text-muted)' }}>모두 읽음 처리</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['전체','루틴','챌린지','리액션'].map((t, i) => (
          <span key={t} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: '1px solid var(--border-strong)', background: i === 0 ? 'var(--text)' : 'var(--surface)', color: i === 0 ? 'var(--surface)' : 'var(--text)', cursor: 'pointer' }}>{t}</span>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.1em', margin: '14px 0 10px' }}>오늘</div>
      <div className="r-card">
        {[
          { type: 'reaction', read: false, who: '민지', color: '#FFD166', text: '회원님의 러닝 인증에 🔥를 보냈어요', time: '5분 전', emoji: '🔥' },
          { type: 'challenge', read: false, who: '준호', color: '#06D6A0', text: '님이 \'아침 러닝\' 챌린지에 참여했어요', time: '12분 전', icon: 'users' },
          { type: 'system', read: false, color: 'var(--coral-500)', text: '독서 루틴이 곧 시작돼요 (10분 후)', time: '방금', icon: 'clock' },
        ].map((n, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 18px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', background: !n.read ? 'var(--coral-50)' : 'transparent' }}>
            {n.who ? <Avatar name={n.who[0]} color={n.color} size={40}/> : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--coral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={n.icon} size={18} color="var(--coral-600)"/></div>}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, lineHeight: 1.4 }}>{n.who && <b>{n.who}</b>}{n.text}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{n.time}</div>
            </div>
            {n.emoji && <span style={{ fontSize: 22, alignSelf: 'center' }}>{n.emoji}</span>}
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--coral-500)', alignSelf: 'center' }}/>}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.1em', margin: '24px 0 10px' }}>어제</div>
      <div className="r-card">
        {[
          { who: '다은', color: '#9D4EDD', text: '님이 챌린지를 완료했어요. 축하해주세요!', time: '어제 21:32', emoji: '🏆' },
          { who: '시우', color: '#118AB2', text: '회원님의 명상 인증에 🙏을 보냈어요', time: '어제 19:15', emoji: '🙏' },
          { who: null, color: 'var(--success)', text: '7일 연속 스트릭 달성! 새 기록입니다 🎉', time: '어제 06:42', icon: 'trophy' },
        ].map((n, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 18px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
            {n.who ? <Avatar name={n.who[0]} color={n.color} size={40}/> : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={n.icon} size={18} color="var(--success)"/></div>}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, lineHeight: 1.4 }}>{n.who && <b>{n.who}</b>}{n.text}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{n.time}</div>
            </div>
            {n.emoji && <span style={{ fontSize: 22, alignSelf: 'center' }}>{n.emoji}</span>}
          </div>
        ))}
      </div>
    </div>

    {/* Live toast */}
    <div className="r-toast" style={{ position: 'absolute', top: 84, right: 24, background: 'var(--ink-800)', color: 'white', padding: '12px 16px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--sh-3)', maxWidth: 320 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--coral-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔥</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>민지님이 18일 스트릭 달성!</div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>지금 · 21일 아침 러닝</div>
      </div>
    </div>
  </div>
);

// ─── Profile ──────────────────────
const ProfileArtboard = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    <AppHeader active="home" />
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ background: 'linear-gradient(135deg, var(--coral-500), var(--sunset-500))', height: 160, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', border: '2px solid rgba(255,255,255,.15)' }}/>
      </div>
      <div style={{ padding: '0 36px 32px', marginTop: -56 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
          <div style={{ width: 112, height: 112, borderRadius: '50%', background: '#FF8A65', border: '5px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 44, fontFamily: 'Pretendard' }}>지</div>
          <div style={{ paddingBottom: 16, flex: 1 }}>
            <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>지수 <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: 18 }}>@jisu</span></h1>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>2025년 3월부터 함께 · 4개의 활성 루틴</div>
          </div>
          <button className="r-btn r-btn--ghost" style={{ border: '1.5px solid var(--border-strong)' }}><Icon name="edit" size={14}/>프로필 편집</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 24 }}>
          {[
            { l: 'STREAK', v: '21', u: '일', em: '🔥' },
            { l: 'BEST', v: '35', u: '일', em: '🏆' },
            { l: 'COMPLETED', v: '142', u: '회', em: '✓' },
            { l: 'CHALLENGES', v: '5', u: '개', em: '🎯' },
          ].map(s => (
            <div key={s.l} className="r-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 22 }}>{s.em}</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Geist', marginTop: 6, lineHeight: 1 }}>{s.v}<span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 3, fontWeight: 600 }}>{s.u}</span></div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
          <div className="r-card" style={{ padding: 22 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>획득 배지</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[['🔥','Streak 30'],['🏆','First Win'],['📚','Reader'],['🌅','Early Bird'],['💧','Hydrated'],['🧘','Calm Mind'],['🎯','Goal Crusher'],['👯','Team Player']].map(([e, n], i) => (
                <div key={i} style={{ textAlign: 'center', opacity: i < 5 ? 1 : 0.35 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: i < 5 ? 'var(--coral-100)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto' }}>{e}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, marginTop: 6 }}>{n}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="r-card" style={{ padding: 22 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>설정</h3>
            {[
              { icon: 'bell', label: '알림 설정' },
              { icon: 'moon', label: '다크 모드' },
              { icon: 'lock', label: '개인정보' },
              { icon: 'logout', label: '로그아웃', danger: true },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', color: s.danger ? 'var(--danger)' : 'var(--text)', cursor: 'pointer' }}>
                <Icon name={s.icon} size={18} color={s.danger ? 'var(--danger)' : 'var(--text-muted)'}/>
                <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{s.label}</span>
                <Icon name="chevronRight" size={14} color="var(--text-muted)"/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { FeedArtboard, ChatArtboard, StatsArtboard, NotificationsArtboard, ProfileArtboard });
