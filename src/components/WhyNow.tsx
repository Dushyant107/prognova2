import { whyNow } from "../content"
import { Reveal, SectionHead } from "./Reveal"

export function WhyNow() {
  const tags = whyNow.items.map((i) => i.tag)
  return (
    <section className="section section--dark whynow" id="why-now">
      <div className="band-ticker" aria-hidden="true">
        <div className="band-ticker__track mono">
          {[...tags, ...tags, ...tags].map((t, i) => (
            <span key={i}>
              {t} <i>·</i>
            </span>
          ))}
        </div>
      </div>
      <div className="wrap">
        <SectionHead eyebrow={whyNow.eyebrow} titleA={whyNow.titleA} titleB={whyNow.titleB} text={whyNow.text} id="why-now-title" />
        <ul className="whynow__grid">
          {whyNow.items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={0.08 * i} className="card card--link whynow__card">
              <span className="mono whynow__tag">{it.tag}</span>
              <h3 className="h3">{it.title}</h3>
              <p className="body">{it.text}</p>
              <i className="whynow__glow" aria-hidden="true" />
            </Reveal>
          ))}
        </ul>
        <Reveal className="market">
          <span className="mono market__label">{whyNow.market.label}</span>
          <div className="market__rows">
            {whyNow.market.rows.map((r) => (
              <div className="market__row" key={r.name}>
                <span className="market__name">{r.name}</span>
                <span className="market__value display">{r.value}</span>
                <span className="market__detail">{r.detail}</span>
                <span className="mono market__source">Source: {r.source}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
