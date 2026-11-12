import { Suspense, useEffect, useRef, useState } from "react"
import { hero, site } from "../content"
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from "../lib/gsap"
import { Chars } from "../lib/split"
import { Button } from "./Button"
import type { Progress } from "./three/Emblem"
import { LazyEmblem } from "./three/lazy"
import { scrollTo } from "../lib/scroll"

function useNarrow() {
  const [narrow, setNarrow] = useState(() => (typeof window === "undefined" ? false : window.innerWidth < 900))
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)")
    const on = () => setNarrow(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return narrow
}

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const progress = useRef<Progress>({ current: 0 }).current
  const narrow = useNarrow()

  // Scroll: the headline cycles with a letter blur, the emblem turns, the hint fades.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const lines = gsap.utils.toArray<HTMLElement>(".hero__line")
        const n = lines.length
        lines.forEach((l, i) => i > 0 && gsap.set(l.querySelectorAll(".ch"), { opacity: 0, y: 22, filter: "blur(10px)" }))

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.7,
            onUpdate: (self) => {
              progress.current = self.progress
              const dots = root.current?.querySelectorAll<HTMLElement>(".hero__dot")
              const active = Math.min(n - 1, Math.floor(self.progress * n))
              dots?.forEach((d, i) => d.classList.toggle("is-on", i === active))
            },
          },
        })
        tl.to(".hero__hint", { opacity: 0, y: -10, duration: 0.3 }, 0)
        for (let i = 1; i < n; i++) {
          const out = lines[i - 1].querySelectorAll(".ch")
          const inn = lines[i].querySelectorAll(".ch")
          const at = i - 0.55
          tl.to(out, { opacity: 0, y: -22, filter: "blur(10px)", stagger: 0.012, duration: 0.45, ease: "power2.in" }, at)
          tl.to(inn, { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.012, duration: 0.5, ease: "power2.out" }, at + 0.25)
        }
        tl.to({}, { duration: 0.2 })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  // Entrance, once the preloader has left.
  useEffect(() => {
    if (!ready || !root.current) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const el = root.current
    const first = el.querySelectorAll(".hero__line:first-child .ch")
    if (reduced) {
      gsap.set([first, ".hero__eyebrow", ".hero__corner", ".hero__hint", ".hero__canvas"], { opacity: 1, clearProps: "all" })
      return
    }
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } })
    tl.fromTo(".hero__canvas", { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 1.6, ease: "expo.out" }, 0)
      .fromTo(first, { opacity: 0, y: 44, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.018, duration: 0.9 }, 0.15)
      .fromTo(".hero__eyebrow", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.7 }, 0.4)
      .fromTo(".hero__corner", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.7)
      .fromTo(".hero__hint", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.1)
    return () => {
      tl.kill()
      ScrollTrigger.refresh()
    }
  }, [ready])

  return (
    <section className="hero" id="top" ref={root} aria-labelledby="hero-title">
      <div className="hero__sticky">
        <div className="hero__canvas">
          <Suspense fallback={null}>
            <LazyEmblem progress={progress} scale={narrow ? 0.46 : 0.82} position={narrow ? [0.05, 0.08, 0] : [1.3, -0.05, 0]} />
          </Suspense>
        </div>

        <div className="hero__eyebrow">
          <span className="eyebrow">{hero.eyebrow}</span>
        </div>

        <h1 className="hero__title display" id="hero-title">
          {hero.lines.map((l, i) => (
            <span className="hero__line" key={i} aria-hidden={i > 0}>
              <span className="hero__row">
                <Chars text={l.a} />
              </span>
              <span className="hero__row hero__row--b">
                <Chars text={l.b} />
              </span>
            </span>
          ))}
        </h1>

        <div className="hero__corner hero__corner--bl">
          <p className="hero__lead">{hero.lead}</p>
          <div className="hero__ctas">
            <Button href={site.chat} variant="lime" external>
              {hero.ctaPrimary}
            </Button>
            <Button
              href="#proof"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault()
                scrollTo("#proof")
              }}
            >
              {hero.ctaSecondary}
            </Button>
          </div>
        </div>

        <div className="hero__corner hero__corner--br">
          <span className="mono hero__label">{hero.cornerLabel}</span>
          <ul className="hero__stack mono">
            {hero.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <div className="ticker" aria-hidden="true">
            <div className="ticker__track">
              {[...hero.ticker, ...hero.ticker].map((t, i) => (
                <span key={i} className="mono">
                  {t} <i>·</i>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="hero__hint mono">
          {hero.hint} <span aria-hidden="true">↓</span>
        </div>

        <div className="hero__dots" aria-hidden="true">
          {hero.lines.map((_, i) => (
            <i key={i} className={`hero__dot ${i === 0 ? "is-on" : ""}`} />
          ))}
        </div>
      </div>
    </section>
  )
}
