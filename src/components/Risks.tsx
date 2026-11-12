import { risks } from "../content"
import { Reveal, SectionHead } from "./Reveal"

export function Risks() {
  return (
    <section className="section risks" id="risks">
      <div className="wrap">
        <SectionHead eyebrow={risks.eyebrow} titleA={risks.titleA} titleB={risks.titleB} split={false} id="risks-title" />
        <ul className="risks__list">
          {risks.items.map((r, i) => (
            <Reveal as="li" key={r.title} delay={0.05 * i} className="risk" amount={0.4}>
              <span className="mono risk__n">0{i + 1}</span>
              <div className="risk__what">
                <h3 className="h3">{r.title}</h3>
                <p className="body">{r.risk}</p>
              </div>
              <div className="risk__do">
                <span className="mono risk__label">{risks.doLabel}</span>
                <p className="body">{r.action}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
