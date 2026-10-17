interface AuthIntroProps {
  eyebrow?: string
  title: React.ReactNode
  description: string
  containerMarginTop: number
  titleMarginTop: number
  /** 숫자(px) 또는 clamp() 같은 CSS 값 */
  titleFontSize: number | string
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
        <p
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: 'var(--coral-600)',
          }}
        >
          {eyebrow}
        </p>
      )}

      {/* 강제 줄바꿈 없이 폭이 되면 한 줄, 모자라면 단어 단위(keep-all)로 균형 있게 접는다 */}
      <h1
        style={{
          fontSize: titleFontSize,
          lineHeight: 1.08,
          letterSpacing: titleLetterSpacing,
          fontWeight: 700,
          marginTop: titleMarginTop,
          wordBreak: 'keep-all',
          textWrap: 'balance',
        }}
      >
        {title}
      </h1>

      <p
        style={{
          color: 'var(--text-muted)',
          marginTop: descriptionMarginTop,
          fontSize: 15,
          wordBreak: 'keep-all',
          textWrap: 'pretty',
        }}
      >
        {description}
      </p>
    </div>
  )
}
