import { nameOrigin as n } from "../content"
import { Reveal } from "./Reveal"

/** The name, read under the stars the nova left behind. */
export function Name() {
  return (
    <section className="section section--dark name" id="name" aria-label="The name">
      <div className="wrap">
        <Reveal className="name__row">
          <div className="name__part">
            <span className="name__word display">{n.a}</span>
            <span className="name__note">
              {n.aNote.pre}
              <em>{n.aNote.em}</em>
              {n.aNote.post}
            </span>
          </div>
          <span className="name__plus display" aria-hidden="true">
            +
          </span>
          <div className="name__part">
            <span className="name__word display">
              <em>{n.b}</em>
            </span>
            <span className="name__note">{n.bNote}</span>
          </div>
        </Reveal>
        <Reveal as="p" className="name__tagline display">
          {n.tagline}
        </Reveal>
      </div>
    </section>
  )
}
