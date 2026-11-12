import { proof } from "../content"
import { Counter } from "./Counter"
import { Reveal, SectionHead } from "./Reveal"

export function Proof() {
  return (
    <section className="section section--dark proof" id="proof">
      <div className="wrap">
        <SectionHead eyebrow={proof.eyebrow} titleA={proof.title} text={proof.text} id="proof-title" />

        <Reveal>
          <span className="chip proof__setup">{proof.setup}</span>
        </Reveal>

        <ul className="proof__stats" aria-label="Prognova v1 on lab reports">
          {proof.stats.map((s, i) => (
            <Reveal as="li" key={s.label} delay={0.08 * i} className="stat">
              <span className="stat__value display">
                <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </span>
              <span className="stat__label">{s.label}</span>
              <span className="stat__compare mono">{s.compare}</span>
            </Reveal>
          ))}
        </ul>

        <Reveal className="bench">
          <div className="bench__scroll">
            <table className="bench__table">
              <caption className="sr-only">{proof.tableNote}</caption>
              <thead>
                <tr>
                  {proof.columns.map((c) => (
                    <th key={c} scope="col" className="mono">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proof.rows.map((r) => (
                  <tr key={r.model} className={r.us ? "is-us" : ""}>
                    <th scope="row">
                      {r.us ? <i className="bench__dot" aria-hidden="true" /> : null}
                      {r.model}
                    </th>
                    {r.cells.map((c, i) => (
                      <td key={i} className={c === "—" ? "is-dash" : ""}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small bench__note">
            {proof.tableNote} {proof.dash}
          </p>
        </Reveal>

        <div className="proof__bottom">
          <Reveal className="honest">
            <h3 className="h3">{proof.honest.title}</h3>
            <ul>
              {proof.honest.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="traction" delay={0.1}>
            <h3 className="h3">{proof.traction.title}</h3>
            <ul className="traction__list" aria-label="Traction to date">
              {proof.traction.stats.map((s) => (
                <li key={s.label}>
                  <span className="traction__value display">
                    <Counter value={s.value} duration={2.2} />
                  </span>
                  <span className="small">{s.label}</span>
                </li>
              ))}
            </ul>
            <p className="small">{proof.traction.note}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
