interface AuthIntroProps {
  eyebrow?: string
  title: React.ReactNode
  description: string
  containerMarginTop: number
  titleMarginTop: number
  titleFontSize: number
  titleLetterSpacing: string
  descriptionMarginTop: number
}

export default function AuthIntro({
  eyebrow,
  title,
  description,
  containerMarginTop,
  titleMarginTop,
  titleFontSize,
  titleLetterSpacing,
  descriptionMarginTop,
}: AuthIntroProps) {
  return (
    <div style={{ marginTop: containerMarginTop }}>
      {eyebrow && (
        <div
          style={{
            fontSize: 11,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: 'var(--coral-600)',
          }}
        >
          {eyebrow}
        </div>
      )}

      <h1
        style={{
          fontSize: titleFontSize,
          lineHeight: 1.05,
          letterSpacing: titleLetterSpacing,
          fontWeight: 700,
          marginTop: titleMarginTop,
        }}
      >
        {title}
      </h1>

      <p style={{ color: 'var(--text-muted)', marginTop: descriptionMarginTop, fontSize: 15 }}>
        {description}
      </p>
    </div>
  )
}
