import type { ReactNode } from "react"
import { motion } from "motion/react"

const ease = [0.16, 1, 0.3, 1] as const

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
  amount = 0.3,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: "div" | "li" | "p" | "span" | "figure"
  amount?: number
}) {
  const M = motion[as] as typeof motion.div
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </M>
  )
}

export function SectionHead({
  eyebrow,
  titleA,
  titleB,
  text,
  split = true,
  id,
}: {
  eyebrow: string
  titleA: string
  titleB?: string
  text?: string
  split?: boolean
  id?: string
}) {
  return (
    <div className={`head ${split && text ? "head--split" : ""}`}>
      <div>
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="h2" id={id} style={{ marginTop: 18 }}>
            {titleA} {titleB ? <em>{titleB}</em> : null}
          </h2>
        </Reveal>
      </div>
      {text ? (
        <Reveal delay={0.14}>
          <p className="lead">{text}</p>
        </Reveal>
      ) : null}
    </div>
  )
}
