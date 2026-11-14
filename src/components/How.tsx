import { chapters } from "../content"
import { Reveal } from "./Reveal"

/**
 * How it reads: three chapters the brain in the sky travels through. Past gathers the
 * reports, Present reads them as one, and at Future the brain gathers, flashes and bursts.
 */
export function How() {
  const [past, present, future] = chapters
  return (
    <section className="section section--dark how" id="how-it-reads" aria-label="How it reads">
      <div className="wrap">
        <div className="chapter">
          <Reveal className="chapter__text">
            <span className="eyebrow">
              {past.n} — {past.tag}
            </span>
            <h2 className="h2">
              {past.titleA} <em>{past.titleB}</em>
            </h2>
            <p className="lead">{past.text}</p>
          </Reveal>
          <div className="chapter__stage" data-anchor="1">
            {past.chips?.map((c, i) => (
              <span
                key={c.label}
                className="chip chapter__chip"
                style={{ left: c.left, top: c.top, animationDelay: c.delay, "--i": i } as React.CSSProperties}
              >
                {c.label}
              </span>
            ))}
          </div>
        </div>

        <div className="chapter chapter--flip">
          <Reveal className="chapter__text">
            <span className="eyebrow">
              {present.n} — {present.tag}
            </span>
            <h2 className="h2">
              {present.titleA} <em>{present.titleB}</em>
            </h2>
            <p className="lead">{present.text}</p>
          </Reveal>
          <div className="chapter__stage" data-anchor="2" aria-hidden="true" />
        </div>

        <div className="chapter chapter--centre">
          <div className="chapter__head">
            <Reveal>
              <span className="eyebrow chapter__eyebrow--lime">
                {future.n} — {future.tag}
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="h2 chapter__title--big">
                {future.titleA} <em>{future.titleB}</em>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="lead">{future.text}</p>
            </Reveal>
          </div>
          <div className="chapter__stage chapter__stage--wide" data-anchor="3" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
