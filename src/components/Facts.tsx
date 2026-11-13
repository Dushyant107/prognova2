import { useRef } from "react"
import { facts } from "../content"
import { gsap, useGSAP, MOTION_OK } from "../lib/gsap"
import { getLenis } from "../lib/scroll"

/**
 * The pinned statement stack. Five lines climb through the screen one at a time while
 * the ground turns from forest to lime; the closing statement lands on the bright ground
 * and the ground settles to paper so the next section continues without a seam.
 */
export function Facts() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const lines = gsap.utils.toArray<HTMLElement>(".facts__line")
        const n = lines.length
        gsap.set(lines, { opacity: 0, y: 140 })
        gsap.set(".facts__statement .ch", { opacity: 0, y: 30 })

        // Each line gets a slot of 1 unit: it climbs in over 0.55, rests sharp until the
        // next slot, then leaves while the next one climbs in. The rest zone is where the
        // scroll snaps, so a wheel tick never parks a line half-blurred.
        const IN = 0.55
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        })
        lines.forEach((l, i) => {
          tl.fromTo(l, { opacity: 0, y: 140, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: IN }, i)
          tl.fromTo(l.querySelector(".facts__note"), { opacity: 0 }, { opacity: 1, duration: 0.25 }, i + IN - 0.1)
          tl.to(l, { opacity: 0, y: -140, filter: "blur(10px)", duration: IN }, i + 1)
        })
        // the ground turns lime as the last line leaves
        tl.to(".facts__ground--lime", { opacity: 1, duration: 1.6, ease: "power1.inOut" }, n - 0.4)
        tl.to(".facts__waves", { opacity: 1, duration: 1.2 }, n)
        // statement
        tl.to(".facts__statement .ch", { opacity: 1, y: 0, duration: 0.9, stagger: 0.012, ease: "power2.out" }, n + 0.9)
        tl.fromTo(".facts__tag", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, n + 1.6)
        tl.to({}, { duration: 1.4 })
        // ground settles to paper
        tl.to(".facts__ground--paper", { opacity: 1, duration: 1.2, ease: "power1.inOut" }, n + 3.0)
        tl.to(".facts__waves", { opacity: 0.35, duration: 1.2 }, n + 3.0)
        tl.to({}, { duration: 0.4 })

        // Resting points as timeline progress: the middle of each line's rest zone, the
        // statement once it has fully landed, and both ends of the section.
        const total = tl.duration()
        const snapPoints = [0, ...lines.map((_, i) => (i + IN + (1 - IN) / 2) / total), (n + 2.6) / total, 1]

        // Snap through Lenis rather than ScrollTrigger's own snap: when the wheel stops,
        // take where Lenis is heading and carry it on to the next resting point in the
        // direction of travel. Driving it from the wheel means it starts at once instead
        // of after the smooth-scroll tail settles, and Lenis never fights a second tween.
        const st = tl.scrollTrigger!
        let timer = 0
        let dir = 1
        const onWheel = (e: WheelEvent) => {
          const lenis = getLenis()
          if (!lenis || e.deltaY === 0) return
          dir = e.deltaY > 0 ? 1 : -1
          window.clearTimeout(timer)
          timer = window.setTimeout(() => {
            const { start, end } = st
            const span = end - start
            const p = (lenis.targetScroll - start) / span
            if (p < -0.001 || p > 1.001) return
            const dest =
              dir > 0 ? (snapPoints.find((s) => s >= p - 1e-4) ?? 1) : ([...snapPoints].reverse().find((s) => s <= p + 1e-4) ?? 0)
            if (Math.abs(dest - p) * span < 1) return
            lenis.scrollTo(start + dest * span, { duration: 0.9, easing: (t) => 1 - Math.pow(1 - t, 3) })
          }, 90)
        }
        window.addEventListener("wheel", onWheel, { passive: true })
        return () => {
          window.removeEventListener("wheel", onWheel)
          window.clearTimeout(timer)
        }
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section className="facts" ref={root} aria-label="What Prognova does">
      <div className="facts__sticky">
        <div className="facts__ground facts__ground--forest" aria-hidden="true" />
        <div className="facts__ground facts__ground--lime" aria-hidden="true" />
        <svg className="facts__waves" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              className="facts__wave"
              style={{ animationDelay: `${-i * 2.3}s`, animationDuration: `${16 + i * 3}s` }}
              d={`M -200 ${520 + i * 70} C 200 ${380 + i * 60}, 500 ${700 + i * 20}, 820 ${520 + i * 50} S 1300 ${320 + i * 60}, 1700 ${560 + i * 40}`}
            />
          ))}
        </svg>
        <div className="facts__ground facts__ground--paper" aria-hidden="true" />

        <ul className="facts__lines">
          {facts.lines.map((l, i) => (
            <li className="facts__line" key={i}>
              <span className="facts__text display">{l.text}</span>
              <span className="facts__note mono">{l.note}</span>
            </li>
          ))}
        </ul>

        <div className="facts__statement">
          <p className="display">
            {facts.statement.map((s, i) => (
              <span className="facts__srow" key={i}>
                {Array.from(s).map((c, ci) => (
                  <span className={c === " " ? "ch sp" : "ch"} key={ci}>
                    {c}
                  </span>
                ))}
              </span>
            ))}
          </p>
          <span className="facts__tag mono">{facts.tag}</span>
        </div>
      </div>
    </section>
  )
}
