import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { nav, site } from "../content"
import { Wordmark } from "./Mark"
import { scrollTo } from "../lib/scroll"

export function Header() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open)
  }, [open])

  const go = (href: string) => (e: React.MouseEvent) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      setOpen(false)
      scrollTo(href, -8)
    }
  }

  return (
    <>
      <motion.header
        className="header"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <a href="#top" className="header__brand" onClick={go("#top")} aria-label="Prognova home">
          <Wordmark tone="current" size={26} sub={false} />
        </a>
        <nav className="header__nav" aria-label="Primary">
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} onClick={go(n.href)} className="header__link mono">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a href={site.chat} className="header__cta mono" target="_blank" rel="noreferrer">
          Try Prognova AI <span aria-hidden="true">→</span>
        </a>
        <button
          type="button"
          className="header__burger"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true" className={`burger ${open ? "is-open" : ""}`}>
            <i />
            <i />
          </span>
        </button>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            className="menu"
            aria-label="Primary, mobile"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul>
              {nav.map((n, i) => (
                <motion.li
                  key={n.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                >
                  <a href={n.href} onClick={go(n.href)} className="menu__link display">
                    {n.label}
                  </a>
                </motion.li>
              ))}
              <li>
                <a href={site.chat} className="btn btn--lime" target="_blank" rel="noreferrer">
                  Try Prognova AI <span className="btn__arrow">→</span>
                </a>
              </li>
            </ul>
            <p className="menu__note small">{site.disclaimer}</p>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
