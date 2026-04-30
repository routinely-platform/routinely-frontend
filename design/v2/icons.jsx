// Routinely — Icon library + Logo system
// All inline SVG. Stroke-based, 1.8 width to match modern editorial feel.

const Icon = ({ name, size = 20, color = 'currentColor', strokeWidth = 1.8, ...props }) => {
  const s = strokeWidth;
  const paths = {
    flame: <><path d="M12 2c0 4-5 5-5 10a5 5 0 0010 0c0-2-1-3.5-2-4.5C13 9 12 6.5 12 2z"/><path d="M12 22a3 3 0 003-3c0-1.5-1-2.5-3-4-2 1.5-3 2.5-3 4a3 3 0 003 3z"/></>,
    flameSolid: <path fill={color} stroke="none" d="M12 2c0 4-5 5-5 10a5 5 0 0010 0c0-2-1-3.5-2-4.5C13 9 12 6.5 12 2zm0 20a3 3 0 003-3c0-1.5-1-2.5-3-4-2 1.5-3 2.5-3 4a3 3 0 003 3z"/>,
    check: <path d="M4 12l5 5L20 6"/>,
    checkCircle: <><circle cx="12" cy="12" r="10"/><path d="M8 12.5l3 3 5-6"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    bell: <><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9z"/><path d="M10 21a2 2 0 004 0"/></>,
    home: <path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z"/>,
    chart: <><path d="M3 21h18"/><rect x="5" y="11" width="3" height="8"/><rect x="11" y="6" width="3" height="13"/><rect x="17" y="14" width="3" height="5"/></>,
    chat: <path d="M21 12a8 8 0 01-11.5 7.2L3 21l1.8-6.5A8 8 0 1121 12z"/>,
    users: <><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5" /><path d="M16 14c2.5 0 5 1.7 5 5"/></>,
    feed: <><path d="M4 6h16M4 12h10M4 18h16"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>,
    trophy: <><path d="M8 4h8v6a4 4 0 01-8 0V4z"/><path d="M16 6h3v2a3 3 0 01-3 3M8 6H5v2a3 3 0 003 3"/><path d="M9 19h6M10 14v5h4v-5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></>,
    send: <path d="M21 3L3 10l7 3 3 7 8-17z"/>,
    arrowRight: <path d="M5 12h14M13 6l6 6-6 6"/>,
    arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6"/>,
    chevronDown: <path d="M6 9l6 6 6-6"/>,
    chevronUp: <path d="M6 15l6-6 6 6"/>,
    chevronRight: <path d="M9 6l6 6-6 6"/>,
    close: <path d="M18 6L6 18M6 6l12 12"/>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    link: <><path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1"/><path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/></>,
    sparkle: <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z"/>,
    heart: <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>,
    play: <path fill={color} stroke="none" d="M6 4l14 8-14 8V4z"/>,
    edit: <><path d="M11 4H4v16h16v-7"/><path d="M18 2l4 4-10 10H8v-4L18 2z"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>,
    moon: <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff: <><path d="M2 2l20 20"/><path d="M6.7 6.7C3.6 8.7 2 12 2 12s3.5 7 10 7c2 0 3.7-.6 5.2-1.5"/><path d="M9.5 5.2A10 10 0 0112 5c6.5 0 10 7 10 7-1 1.7-2 3-3.3 4"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill={color} stroke="none"/></>,
    medal: <><circle cx="12" cy="14" r="7"/><path d="M8 4l4 6 4-6"/></>,
    repeat: <><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></>,
    smile: <><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="0.6" fill={color} stroke="none"/><circle cx="15" cy="10" r="0.6" fill={color} stroke="none"/></>,
    lock: <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={s} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {paths[name]}
    </svg>
  );
};

// ─────────────────────────────────────────────────────
// Logo system
// Concept: a circle made of check segments forming a loop.
// Three dots/checks rotate around — symbolizing "꾸준히 반복되는 습관".
// ─────────────────────────────────────────────────────

// Routinely mark — same shape as uploaded brand asset, themed to system accent.
// Coral tile + white check + accent-700 dot with light tint center.
const RoutinelyMark = ({ size = 40, color = 'var(--coral-500)', check = '#ffffff', dotOuter = 'var(--coral-700)', dotInner = 'var(--coral-100)' }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
    <rect width="200" height="200" rx="44" fill={color}/>
    <polyline points="46,108 82,144 154,68" stroke={check} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="152" cy="52" r="18" fill={dotOuter}/>
    <circle cx="152" cy="52" r="11" fill={dotInner}/>
  </svg>
);

const RoutinelyWordmark = ({ size = 32, color = 'var(--text)', mark = 'var(--coral-500)' }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.28 }}>
    <RoutinelyMark size={size} color={mark} />
    <span style={{
      fontFamily: "'Geist', 'Pretendard', sans-serif",
      fontSize: size * 0.72, fontWeight: 700, letterSpacing: -size * 0.025,
      color, lineHeight: 1,
    }}>
      Routinely<span style={{ color: mark }}>.</span>
    </span>
  </div>
);

// Vertical version
const RoutinelyVertical = ({ size = 80, color = 'var(--text)', mark = 'var(--coral-500)' }) => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
    <RoutinelyMark size={size} color={mark} />
    <span style={{
      fontFamily: "'Geist', 'Pretendard', sans-serif",
      fontSize: size * 0.34, fontWeight: 700, letterSpacing: -size * 0.012, color, lineHeight: 1,
    }}>Routinely<span style={{ color: mark }}>.</span></span>
  </div>
);

Object.assign(window, { Icon, RoutinelyMark, RoutinelyWordmark, RoutinelyVertical });
