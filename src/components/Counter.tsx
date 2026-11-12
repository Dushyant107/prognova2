import { useEffect, useRef, useState } from "react"
import { animate, useInView } from "motion/react"

export function Counter({
  value,
  decimals = 0,
  suffix = "",
  duration = 1.8,
  className,
}: {
  value: number
  decimals?: number
  suffix?: string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10% 0px" })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value)
      return
    }
    const c = animate(0, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(v) })
    return () => c.stop()
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {n.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}
