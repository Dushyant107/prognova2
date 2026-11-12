import { Suspense } from "react"
import { devices } from "../content"
import { Reveal, SectionHead } from "./Reveal"
import { LazyBot } from "./three/lazy"

export function Devices() {
  return (
    <section className="section section--dark devices" id="robot">
      <div className="wrap">
        <div className="devices__top">
          <div>
            <SectionHead eyebrow={devices.eyebrow} titleA={devices.titleA} titleB={devices.titleB} split={false} id="robot-title" />
            <Reveal>
              <p className="lead">{devices.text}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="devices__refusal h3">{devices.refusal}</p>
            </Reveal>
          </div>
          <Reveal className="devices__visual" amount={0.2}>
            <div className="devices__canvas">
              <Suspense fallback={null}>
                <LazyBot mood={3} />
              </Suspense>
            </div>
            <span className="chip chip--live devices__fits">{devices.fits}</span>
          </Reveal>
        </div>

        <Reveal>
          <span className="mono devices__label">{devices.researchLabel}</span>
        </Reveal>
        <ul className="devices__grid">
          {devices.items.map((d, i) => (
            <Reveal as="li" key={d.name} delay={0.08 * i} className="card card--link device">
              <span className="mono device__n">0{i + 1}</span>
              <h3 className="h3">{d.name}</h3>
              <p className="device__text">{d.text}</p>
              <p className="small">{d.detail}</p>
            </Reveal>
          ))}
        </ul>

        <div className="timeline">
          <Reveal>
            <h3 className="h2 timeline__title">{devices.timelineTitle}</h3>
          </Reveal>
          <ol className="timeline__grid">
            {devices.timeline.map((t, i) => (
              <Reveal as="li" key={t.year} delay={0.1 * i} className="tier">
                <span className="tier__year display">{t.year}</span>
                <h4 className="h3">{t.title}</h4>
                <p className="body">{t.text}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal>
            <p className="small timeline__note">{devices.note}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
