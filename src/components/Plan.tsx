import { useRef } from "react"
import { plan } from "../content"
import { gsap, useGSAP, MOTION_OK } from "../lib/gsap"
import { Reveal, SectionHead } from "./Reveal"

export function Plan() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ".plan__progress",
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".plan__phases", start: "top 70%", end: "bottom 60%", scrub: 0.5 } },
        )
        gsap.utils.toArray<HTMLElement>(".plan__gate").forEach((g) => {
          gsap.fromTo(
            g,
            { backgroundSize: "0% 100%" },
            { backgroundSize: "100% 100%", ease: "none", scrollTrigger: { trigger: g, start: "top 85%", end: "top 55%", scrub: true } },
          )
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section className="section plan" id="plan" ref={root}>
      <div className="wrap">
        <SectionHead eyebrow={plan.eyebrow} titleA={plan.title} text={plan.text} id="plan-title" />
        <div className="plan__track" aria-hidden="true">
          <i className="plan__progress" />
        </div>
        <ol className="plan__phases">
          {plan.phases.map((p, i) => (
            <Reveal as="li" key={p.phase} delay={0.1 * i} className="phase">
              <span className="phase__dot" aria-hidden="true" />
              <span className="mono phase__meta">
                {p.phase} · {p.months}
              </span>
              <h3 className="h3 phase__title">{p.title}</h3>
              <ul className="phase__list">
                {p.milestones.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <p className="plan__gate">
                <span className="mono">{plan.gateLabel}</span>
                {p.gate}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
