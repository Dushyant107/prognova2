import { moat } from "../content"
import { Reveal, SectionHead } from "./Reveal"

export function Moat() {
  return (
    <section className="section section--tint moat" id="moat">
      <div className="wrap">
        <SectionHead eyebrow={moat.eyebrow} titleA={moat.titleA} titleB={moat.titleB} text={moat.text} id="moat-title" />
        <ol className="moat__grid">
          {moat.items.map((m, i) => (
            <Reveal as="li" key={m.n} delay={0.1 * i} className="card card--link moat__card">
              <span className="moat__n display">{m.n}</span>
              <span className="mono moat__tag">{m.tag}</span>
              <h3 className="h3">{m.title}</h3>
              <p className="body">{m.text}</p>
            </Reveal>
          ))}
        </ol>
        <Reveal>
          <p className="lead moat__foot">{moat.footnote}</p>
        </Reveal>
      </div>
    </section>
  )
}
