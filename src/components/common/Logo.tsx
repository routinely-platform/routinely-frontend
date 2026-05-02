interface RoutinelyMarkProps {
  size?: number
  color?: string
  check?: string
  dotOuter?: string
  dotInner?: string
}

export function RoutinelyMark({
  size = 40,
  color = 'var(--coral-500)',
  check = '#ffffff',
  dotOuter = 'var(--coral-700)',
  dotInner = 'var(--coral-100)',
}: RoutinelyMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <rect width="200" height="200" rx="44" fill={color} />
      <polyline
        points="46,108 82,144 154,68"
        stroke={check}
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="152" cy="52" r="18" fill={dotOuter} />
      <circle cx="152" cy="52" r="11" fill={dotInner} />
    </svg>
  )
}

interface RoutinelyWordmarkProps {
  size?: number
  color?: string
  mark?: string
}

export function RoutinelyWordmark({
  size = 32,
  color = 'var(--text)',
  mark = 'var(--coral-500)',
}: RoutinelyWordmarkProps) {
  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.28 }}
      aria-label="Routinely"
    >
      <RoutinelyMark size={size} color={mark} />
      <span
        style={{
          fontFamily: "'Geist', 'Pretendard', sans-serif",
          fontSize: size * 0.72,
          fontWeight: 700,
          letterSpacing: -size * 0.025,
          color,
          lineHeight: 1,
        }}
      >
        Routinely<span style={{ color: mark }}>.</span>
      </span>
    </div>
  )
}
