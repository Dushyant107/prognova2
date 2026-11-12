import { useRef } from "react"
import { problem } from "../content"
import { gsap, useGSAP, MOTION_OK } from "../lib/gsap"
import { Reveal, SectionHead } from "./Reveal"

const SCATTER: [number, number, number][] = [
  [8, 10, -6],
  [62, 4, 5],
  [74, 44, -3],
  [10, 58, 4],
  [40, 78, -5],
  [66, 80, 7],
]

/** Six fragments of a record scatter across the frame and are pulled into one. */
export function Problem() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const stage = root.current!.querySelector<HTMLElement>(".pieces")!
        const chips = gsap.utils.toArray<HTMLElement>(".piece", stage)
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: { trigger: stage, start: "top 75%", end: "bottom 35%", scrub: 0.8 },
        })
        chips.forEach((c, i) => {
          tl.to(c, { left: "50%", top: "50%", xPercent: -50, yPercent: -50, rotate: 0, duration: 1 }, 0.1 * i)
          tl.to(c, { scale: 0.8, opacity: 0, duration: 0.35 }, 0.95 + 0.04 * i)
        })
        tl.fromTo(".one-record", { opacity: 0, scale: 0.82, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "expo.out" }, 1.15)
        tl.fromTo(".one-record__line", { scaleX: 0 }, { scaleX: 1, stagger: 0.08, duration: 0.4 }, 1.35)
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section className="section problem" id="problem" ref={root}>
      <div className="wrap grid-2">
        <div>
          <SectionHead eyebrow={problem.eyebrow} titleA={problem.titleA} titleB={problem.titleB} split={false} />
          {problem.paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.1 * i}>
              <p className="body" style={{ marginBottom: 20, fontSize: "var(--step-lead)", lineHeight: 1.5 }}>
                {p}
              </p>
            </Reveal>
          ))}
        </div>
        <div className="pieces" aria-hidden="true">
          {problem.pieces.map((p, i) => (
            <div
              className="piece"
              key={p.label}
              style={{ left: `${SCATTER[i][0]}%`, top: `${SCATTER[i][1]}%`, transform: `rotate(${SCATTER[i][2]}deg)` }}
            >
              <span className="piece__label">{p.label}</span>
              <span className="piece__meta mono">{p.meta}</span>
              <i className="piece__bar" />
              <i className="piece__bar" style={{ width: "62%" }} />
              <i className="piece__bar" style={{ width: "40%" }} />
            </div>
          ))}
          <div className="one-record">
            <span className="mono one-record__meta">{problem.oneRecordMeta}</span>
            <span className="one-record__title display">{problem.oneRecord}</span>
            <div className="one-record__lines">
              {problem.pieces.map((p) => (
                <span className="one-record__line" key={p.label}>
                  <b>{p.label}</b>
                  <span className="mono">{p.meta}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
