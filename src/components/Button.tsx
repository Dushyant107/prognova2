import type { ReactNode } from "react"
import { useScramble } from "../lib/useScramble"

type Props = {
  href: string
  children: string
  variant?: "solid" | "lime" | "ghost" | "text"
  arrow?: boolean
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  external?: boolean
  className?: string
  icon?: ReactNode
}

export function Button({ href, children, variant = "solid", arrow = true, onClick, external, className = "", icon }: Props) {
  const { out, play } = useScramble(children)
  const cls = ["btn", variant !== "solid" ? `btn--${variant}` : "", className].filter(Boolean).join(" ")
  return (
    <a
      href={href}
      className={cls}
      onMouseEnter={play}
      onFocus={play}
      onClick={onClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      {icon}
      <span aria-hidden="true" style={{ fontVariantNumeric: "tabular-nums" }}>
        {out}
      </span>
      <span className="sr-only">{children}</span>
      {arrow && (
        <span className="btn__arrow" aria-hidden="true">
          →
        </span>
      )}
    </a>
  )
}
