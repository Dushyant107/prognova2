import { useEffect, useRef } from "react"
import { hero, site } from "../content"
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from "../lib/gsap"
import { Chars } from "../lib/split"
import { Button } from "./Button"
import { scrollTo } from "../lib/scroll"

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)

  // Scroll: the headline shows one line at a time. Every scroll position maps to one exact
  // state of the letters, computed fresh each frame, so nothing can be left half-faded by a
  // re-render, a hot update or a jump. Lines leave fully before the next arrives.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const lines = gsap.utils.toArray<HTMLElement>(".hero__line")
        const chars = lines.map((l) => Array.from(l.querySelectorAll<HTMLElement>(".ch")))
        const hint = root.current?.querySelector<HTMLElement>(".hero__hint")
        const dots = root.current?.querySelectorAll<HTMLElement>(".hero__dot")
        const n = lines.length
        const IN = 0.16 // share of a line's segment spent arriving
        const OUT = 0.8 // point in the segment where a line starts to leave
        const STAG = 0.004 // per-letter shift
        const smooth = (k: number) => {
          k = k < 0 ? 0 : k > 1 ? 1 : k
          return k * k * (3 - 2 * k)
        }

        const render = (p: number) => {
          const t = p * n
          for (let i = 0; i < n; i++) {
            const local = t - i
            const cs = chars[i]
            for (let j = 0; j < cs.length; j++) {
              const sh = j * STAG
              const aIn = i === 0 ? 1 : smooth((local - sh) / IN)
              const aOut = i === n - 1 ? 0 : smooth((local - OUT - sh) / (1 - OUT))
              const vis = aIn * (1 - aOut)
              const y = (1 - aIn) * 22 - aOut * 22
              const st = cs[j].style
              st.opacity = String(vis)
              st.transform = `translateY(${y.toFixed(2)}px)`
              st.filter = vis >= 0.999 ? "none" : `blur(${((1 - vis) * 10).toFixed(2)}px)`
            }
          }
          if (hint) {
            const h = 1 - smooth(p / 0.08)
            hint.style.opacity = String(h)
            hint.style.transform = `translateY(${(-10 * (1 - h)).toFixed(2)}px)`
          }
          const active = Math.min(n - 1, Math.floor(p * n))
          dots?.forEach((d, i) => d.classList.toggle("is-on", i === active))
        }

        // a little smoothing of our own, in place of a scrubbed timeline
        let target = 0
        let cur = -1
        const tick = () => {
          if (cur < 0) cur = target
          const d = target - cur
          if (Math.abs(d) < 0.0004) {
            if (cur !== target) {
              cur = target
              render(cur)
            }
            return
          }
          cur += d * 0.14
          render(cur)
        }
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            target = self.progress
          },
          onRefresh: (self) => {
            target = self.progress
            cur = target
            render(cur)
          },
        })
        render(st.progress)
        gsap.ticker.add(tick)
        return () => {
          gsap.ticker.remove(tick)
          st.kill()
        }
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
    // The letters belong to the scroll timeline alone; the entrance moves the title as a block,
    // so replaying it part-way down the page can never leave letters half-faded.
    const title = el.querySelector(".hero__title")
    if (reduced) {
      gsap.set([title, ".hero__corner", ".hero__hint", ".hero__canvas"], { opacity: 1, clearProps: "all" })
      return
    }
    // Landing part-way down (a deep link, or the dev scroll helper): the scrubbed headline
    // already owns the letters, so only reveal the furniture.
    const st = ScrollTrigger.getAll().find((s) => s.trigger === el)
    if (st && st.progress > 0.02) {
      gsap.set([title, ".hero__corner", ".hero__hint", ".hero__canvas"], { opacity: 1, y: 0, filter: "none" })
      return
    }
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } })
    tl.fromTo(".hero__canvas", { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 1.6, ease: "expo.out" }, 0)
      .fromTo(title, { opacity: 0, y: 44, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1 }, 0.15)
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
        {/* the brain in the sky takes this box as its place */}
        <div className="hero__canvas" data-anchor="0" aria-hidden="true" />

        <div className="hero__titlebox">
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
        </div>

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
