import { Suspense, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { jobs } from "../content"
import { gsap, useGSAP, MOTION_OK } from "../lib/gsap"
import type { Mood } from "./three/Bot"
import { LazyBot } from "./three/lazy"
import { scrollTo } from "../lib/scroll"

const CHIP_POS = [
  { left: "4%", top: "18%" },
  { right: "2%", top: "26%" },
  { left: "6%", bottom: "20%" },
  { right: "6%", bottom: "14%" },
]

/**
 * Four jobs, one bot. The section pins; scrolling steps through the list and the bot
 * changes its face: alert for Read, wide-eyed for Remember, dimmed for Reason (off until
 * validated), bright and turning for Run.
 */
export function Jobs() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const n = jobs.items.length

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.to(".jobs__bar", {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              const i = Math.min(n - 1, Math.floor(self.progress * n * 0.999))
              setActive((prev) => (prev === i ? prev : i))
            },
          },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const jump = (i: number) => {
    const el = root.current
    if (!el) return
    const top = el.offsetTop
    const range = el.offsetHeight - window.innerHeight
    scrollTo(top + (range * (i + 0.5)) / n)
    setActive(i)
  }

  const item = jobs.items[active]

  return (
    <section className="jobs" id="layers" ref={root} aria-labelledby="jobs-title">
      <div className="jobs__sticky">
        <div className="wrap jobs__grid">
          <div className="jobs__visual">
            <div className="jobs__canvas">
              <Suspense fallback={null}>
                <LazyBot mood={active as Mood} />
              </Suspense>
            </div>
            <AnimatePresence mode="popLayout">
              {item.tags.map((t, i) => (
                <motion.span
                  key={`${active}-${t}`}
                  className="jobs__chip chip"
                  style={CHIP_POS[i % CHIP_POS.length]}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                  transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <i className="jobs__chip-dot" />
                  {t}
                </motion.span>
              ))}
            </AnimatePresence>
            <span className="mono jobs__model">{jobs.model}</span>
          </div>

          <div className="jobs__list">
            <span className="eyebrow">{jobs.eyebrow}</span>
            <h2 className="h2" id="jobs-title" style={{ marginTop: 16, marginBottom: 12 }}>
              {jobs.title}
            </h2>
            <p className="lead" style={{ marginBottom: 28 }}>
              {jobs.text}
            </p>
            <ol className="jobs__items">
              <li className="jobs__track" aria-hidden="true">
                <i className="jobs__bar" />
              </li>
              {jobs.items.map((j, i) => {
                const on = i === active
                return (
                  <li key={j.n} className={`jobs__item ${on ? "is-on" : ""}`}>
                    <button type="button" className="jobs__btn" onClick={() => jump(i)} aria-expanded={on}>
                      <span className="jobs__n mono">{j.n}</span>
                      <span className="jobs__name h3">{j.name}</span>
                      <span className={`chip ${j.live ? "chip--live" : ""}`}>{j.status}</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.p
                          className="jobs__text body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {j.text}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}
            </ol>
            <p className="small jobs__foot">{jobs.footnote}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
