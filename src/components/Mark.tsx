type Props = {
  size?: number
  /** forest green on light, or inherit currentColor */
  tone?: "brand" | "current" | "dark"
  className?: string
  title?: string
}

/**
 * The Prognova Health mark, redrawn as vectors from the supplied logo:
 * a crescent, a head and a sage leaf, the figure leaning into the curve.
 */
export function Mark({ size = 40, tone = "brand", className, title = "Prognova" }: Props) {
  const forest = tone === "brand" ? "#053F35" : tone === "dark" ? "#EEF3EE" : "currentColor"
  const sage = tone === "brand" ? "#879D78" : tone === "dark" ? "#C9E27A" : "currentColor"
  const id = `mk-${tone}`
  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 400 440"
      role="img"
      aria-label={title}
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        <mask id={id}>
          <rect width="400" height="440" fill="#000" />
          <circle cx="195" cy="205" r="195" fill="#fff" />
          <circle cx="92" cy="205" r="188" fill="#000" />
        </mask>
      </defs>
      <circle cx="195" cy="205" r="195" fill={forest} mask={`url(#${id})`} />
      <circle cx="112" cy="128" r="50" fill={forest} />
      <path
        d="M 258 128 C 222 222 148 262 92 322 C 60 358 42 396 36 440 C 92 390 170 362 222 300 C 258 258 266 194 258 128 Z"
        fill={sage}
      />
    </svg>
  )
}

export function Wordmark({ tone = "brand", size = 28, sub = true }: { tone?: "brand" | "current" | "dark"; size?: number; sub?: boolean }) {
  const color = tone === "brand" ? "#053F35" : tone === "dark" ? "#EEF3EE" : "currentColor"
  const subColor = tone === "brand" ? "#879D78" : tone === "dark" ? "#B9C9BE" : "currentColor"
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, color }}>
      <Mark size={size} tone={tone} />
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: size * 0.82,
            letterSpacing: "-0.03em",
          }}
        >
          prognova
        </span>
        {sub ? (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: size * 0.3,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: subColor,
              marginTop: 3,
            }}
          >
            Health
          </span>
        ) : null}
      </span>
    </span>
  )
}
