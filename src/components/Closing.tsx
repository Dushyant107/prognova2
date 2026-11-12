import { Suspense } from "react"
import { closing, footer, site } from "../content"
import { Button } from "./Button"
import { Reveal } from "./Reveal"
import { Wordmark } from "./Mark"
import { LazyEmblem } from "./three/lazy"
import { scrollTo } from "../lib/scroll"

export function Closing() {
  return (
    <section className="section section--dark closing" id="raising">
      <div className="closing__canvas">
        <Suspense fallback={null}>
          <LazyEmblem spin={0} scale={1.4} position={[0, -0.1, 0]} />
        </Suspense>
      </div>
      <div className="wrap closing__inner">
        <Reveal>
          <span className="eyebrow">{closing.eyebrow}</span>
        </Reveal>
        <h2 className="closing__title display">
          {closing.title.map((l, i) => (
            <Reveal key={l} as="span" delay={0.08 * i} className="closing__row">
              {l}
            </Reveal>
          ))}
        </h2>
        <Reveal delay={0.2}>
          <p className="lead closing__text">{closing.text}</p>
        </Reveal>
        <Reveal delay={0.3} className="closing__ctas">
          <Button href={site.chat} variant="lime" external>
            {closing.cta}
          </Button>
          <Button href={`mailto:${site.email}`} variant="ghost" arrow={false}>
            {closing.ctaSecondary}
          </Button>
        </Reveal>
        <Reveal delay={0.35}>
          <a className="closing__email display" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </Reveal>
      </div>

      <footer className="footer wrap">
        <div className="footer__row">
          <a href="#top" onClick={(e) => (e.preventDefault(), scrollTo(0))} aria-label="Prognova home">
            <Wordmark tone="dark" size={30} />
          </a>
          <nav aria-label="Footer">
            <ul className="footer__links">
              {footer.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="mono"
                    onClick={(e) => {
                      if (l.href === "#top") {
                        e.preventDefault()
                        scrollTo(0)
                      }
                    }}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="footer__meta small">
          <p>{site.entities}</p>
          <p>{site.disclaimer}</p>
          <p>
            {site.cookies} {footer.credit}
          </p>
        </div>
      </footer>
    </section>
  )
}
