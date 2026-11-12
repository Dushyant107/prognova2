import { landscape } from "../content"
import { Reveal, SectionHead } from "./Reveal"

export function Landscape() {
  return (
    <section className="section landscape" id="competition">
      <div className="wrap">
        <SectionHead eyebrow={landscape.eyebrow} titleA={landscape.titleA} titleB={landscape.titleB} text={landscape.text} id="competition-title" />
        <Reveal>
          <table className="compare">
            <caption className="sr-only">{landscape.caption}</caption>
            <thead>
              <tr>
                {landscape.columns.map((c) => (
                  <th key={c} scope="col" className="mono">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {landscape.rows.map((r) => (
                <tr key={r.name} className={r.us ? "is-us" : ""}>
                  <th scope="row">
                    <span className="compare__name">{r.name}</span>
                    <span className="mono compare__sub">{r.sub}</span>
                  </th>
                  <td data-label={landscape.columns[1]}>{r.knows}</td>
                  <td data-label={landscape.columns[2]}>{r.grounded}</td>
                  <td data-label={landscape.columns[3]}>{r.stops}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <Reveal>
          <p className="body landscape__foot">{landscape.footnote}</p>
        </Reveal>
      </div>
    </section>
  )
}
