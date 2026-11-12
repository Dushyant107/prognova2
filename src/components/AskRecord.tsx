import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ask } from "../content"
import { Reveal, SectionHead } from "./Reveal"

export function AskRecord() {
  const [active, setActive] = useState<string | null>(null)
  const q = ask.questions.find((x) => x.id === active) ?? null
  const cited = new Set(q?.cites ?? [])

  return (
    <section className="section ask" id="how-it-works">
      <div className="wrap">
        <SectionHead eyebrow={ask.eyebrow} titleA={ask.title} text={ask.text} id="how-it-works-title" />

        <div className="ask__grid">
          <Reveal className="ask__panel">
            <span className="mono ask__label">{ask.label}</span>
            <ul className="ask__questions" role="list">
              {ask.questions.map((x, i) => (
                <li key={x.id}>
                  <button
                    type="button"
                    className={`ask__q ${active === x.id ? "is-on" : ""}`}
                    aria-pressed={active === x.id}
                    onClick={() => setActive(x.id)}
                  >
                    <span className="mono">Q{i + 1}</span>
                    <span>{x.label}</span>
                    <span className="ask__q-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="ask__answer" aria-live="polite">
              <AnimatePresence mode="wait">
                {q ? (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className={`chip ${q.kind === "cited" ? "chip--live" : ""}`}>
                      {q.kind === "cited" ? "Answer · cited" : "No answer · nothing to cite"}
                    </span>
                    <p className="ask__text">{q.answer}</p>
                    <p className="mono ask__cite">{q.page}</p>
                  </motion.div>
                ) : (
                  <motion.p key="empty" className="ask__prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {ask.prompt}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <p className="ask__refusal h3">{ask.refusal}</p>
          </Reveal>

          <Reveal className="report" delay={0.1} as="figure">
            <div className="report__head">
              <div>
                <span className="mono">{ask.report.title}</span>
                <span className="mono report__page">{ask.report.page}</span>
              </div>
              <span className="small">{ask.report.meta}</span>
            </div>
            <table className="report__table">
              <caption className="sr-only">Laboratory report, page 2. Fictional example.</caption>
              <thead>
                <tr>
                  {ask.report.columns.map((c) => (
                    <th key={c} scope="col" className="mono">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ask.report.rows.map((r) => {
                  const on = cited.has(r.line)
                  return (
                    <tr key={r.line} className={on ? "is-cited" : ""} aria-current={on ? "true" : undefined}>
                      <td className="mono report__line">
                        {r.line}
                        {on ? (
                          <motion.span layoutId="cite-pin" className="report__pin mono" aria-hidden="true">
                            cited
                          </motion.span>
                        ) : null}
                      </td>
                      <td>{r.test}</td>
                      <td className={r.flag ? "is-flag" : ""}>
                        {r.result}
                        {r.flag ? <span className="report__flag mono">H</span> : null}
                      </td>
                      <td className="small">{r.ref}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className={`report__family ${q?.kind === "refused" ? "is-blank" : ""}`}>
              <span className="mono">{ask.report.familyHistoryLabel}</span>
              <span>{ask.report.familyHistory}</span>
              {q?.kind === "refused" ? <span className="chip">Blank · nothing to cite</span> : null}
            </div>
            <figcaption className="small report__note">{ask.report.note}</figcaption>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
