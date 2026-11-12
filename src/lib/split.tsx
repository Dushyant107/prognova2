/** Splits a line into words and characters so GSAP can stagger them. Words never break. */
export function Chars({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ")
  return (
    <span className={`split ${className}`} aria-label={text} role="text">
      {words.map((w, wi) => (
        <span className="word" key={wi} aria-hidden="true">
          {Array.from(w).map((c, ci) => (
            <span className="ch" key={ci}>
              {c}
            </span>
          ))}
          {wi < words.length - 1 ? <span className="ch sp"> </span> : null}
        </span>
      ))}
    </span>
  )
}
