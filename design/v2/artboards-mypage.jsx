// Routinely — My Page (DESKTOP WEB) · MVP only
// Patterns: GitHub/Linear/Notion settings — single content column for MVP, sidebar nav for v2.
// Edit = centered modal dialog (not bottom sheet — that's mobile).

const HeaderDropdownOpenArtboard = () => (
  <div style={{ width: '100%', height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
    <AppHeader active="profile-menu" />
    <div style={{ flex: 1, padding: 36, color: 'var(--text-dim)', fontSize: 13 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>State</div>
      <div style={{ fontSize: 18, color: 'var(--text)', fontWeight: 700 }}>로그아웃은 여기 드롭다운에서</div>
      <div style={{ marginTop: 8 }}>마이페이지에는 로그아웃 버튼 없음 — 헤더 메뉴에 위치</div>
    </div>
  </div>
);

// ─── Page heading ──────────────────────────────────
const PageHeading = ({ badge, badgeColor }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em', margin: 0 }}>마이페이지</h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>프로필 정보를 관리하세요</p>
    </div>
    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', padding: '5px 11px', borderRadius: 6, background: badgeColor, color: 'white' }}>{badge}</span>
  </div>
);

// ─── Profile card (horizontal, web layout) ─────────
const ProfileCardDesktop = () => (
  <div className="r-card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
    {/* warm decorative halo — quiet, behind content */}
    <div aria-hidden style={{
      position: 'absolute', top: -160, right: -120, width: 380, height: 380,
      borderRadius: '50%', background: 'radial-gradient(circle, var(--coral-100), transparent 70%)',
      pointerEvents: 'none',
    }}/>

    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 28 }}>
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 112, height: 112, borderRadius: '50%',
          background: 'linear-gradient(135deg,#FF8A65,#FF5A2B)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 48, fontWeight: 700, fontFamily: 'Geist',
          boxShadow: '0 8px 24px -10px rgba(255,90,43,.45)',
        }}>지</div>
      </div>

      {/* Identity */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>지수</h2>
          <span style={{ fontSize: 12, color: 'var(--coral-700)', fontWeight: 700 }}>· 함께한 지 <span style={{ fontFamily: 'Geist' }}>178일째</span></span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.5 }}>
          꾸준히, 천천히, 함께.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, fontSize: 13, color: 'var(--text-dim)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Geist' }}>
            <span>✉</span>ji•••@routinely.app
          </span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-dim)' }}/>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>📅</span><span style={{ fontFamily: 'Geist' }}>2025.11.12 가입</span>
          </span>
        </div>
      </div>

      {/* Edit CTA */}
      <button className="r-btn" style={{
        background: 'var(--surface)', border: '1px solid var(--border-strong)',
        color: 'var(--text)', fontWeight: 600, padding: '10px 18px', borderRadius: 10,
        flexShrink: 0, alignSelf: 'flex-start',
      }}>✎ 프로필 수정</button>
    </div>
  </div>
);

// ─── Section heading ───────────────────────────────
const SectionHeading = ({ title, sub }) => (
  <div style={{ marginBottom: 14 }}>
    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
    {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>{sub}</p>}
  </div>
);

// ─── MVP: 마이페이지 메인 (single column, web) ─────
const MyPageMvpArtboard = () => (
  <div style={{ width: '100%', height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
    <AppHeader active="" />
    <div style={{ flex: 1, overflow: 'auto', padding: '40px 0' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px' }}>
        <PageHeading badge="MVP" badgeColor="var(--ink-800)"/>
        <ProfileCardDesktop/>
      </div>
    </div>
  </div>
);

// ─── MVP: 프로필 수정 모달 (centered dialog) ───────
const EditProfileModalArtboard = () => (
  <div style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
    <AppHeader active="" />
    {/* Dimmed page behind */}
    <div style={{ flex: 1, overflow: 'hidden', padding: '40px 0', opacity: .5 }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px' }}>
        <PageHeading badge="MVP" badgeColor="var(--ink-800)"/>
        <ProfileCardDesktop/>
      </div>
    </div>

    {/* Backdrop */}
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,18,12,.45)' }}/>

    {/* Centered modal */}
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: 520, background: 'var(--surface)',
        borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,.22)',
        overflow: 'hidden',
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>프로필 수정</h3>
          <button style={{ background: 'transparent', border: 'none', fontSize: 18, color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 24px 8px' }}>
          {/* Avatar row — horizontal, web style */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg,#FF8A65,#FF5A2B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 30, fontWeight: 700, fontFamily: 'Geist',
              flexShrink: 0,
            }}>지</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>프로필 사진</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="r-btn r-btn--sm" style={{ background: 'var(--text)', color: 'var(--surface)' }}>사진 업로드</button>
                <button className="r-btn r-btn--sm" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-strong)' }}>기본 이미지로</button>
              </div>
            </div>
          </div>

          {/* Nickname */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>닉네임</label>
              <span style={{ fontSize: 11, color: '#a86a00', fontWeight: 600 }}>30일에 한 번 변경 가능</span>
            </div>
            <input className="r-input" defaultValue="지수" style={{ width: '100%', fontWeight: 600, padding: '10px 12px' }}/>
            <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600, marginTop: 6 }}>✓ 사용 가능한 닉네임</div>
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>한 줄 소개</label>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'Geist' }}>13/100</span>
            </div>
            <textarea className="r-input" rows={2} defaultValue="꾸준히, 천천히, 함께." style={{ width: '100%', resize: 'none', fontFamily: 'inherit', padding: '10px 12px' }}/>
          </div>

          {/* Email — read only */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>이메일</label>
            <div style={{
              padding: '10px 12px', borderRadius: 8,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Geist',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>ji•••@routinely.app</span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>변경 불가</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          padding: '16px 24px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)',
        }}>
          <button className="r-btn" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-strong)' }}>취소</button>
          <button className="r-btn r-btn--primary">저장</button>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { HeaderDropdownOpenArtboard, MyPageMvpArtboard, EditProfileModalArtboard });
