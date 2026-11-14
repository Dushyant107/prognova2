import { contact, footer, site } from "../content"
import { Button } from "./Button"
import { Reveal } from "./Reveal"
import { Wordmark } from "./Mark"
import { scrollTo } from "../lib/scroll"

export function Closing() {
  return (
    <section className="section section--dark closing" id="raising">
      <div className="wrap closing__inner">
        {/* the stars born from the nova settle into one star here */}
        <div className="closing__star" data-anchor="star" aria-hidden="true" />
        <Reveal>
          <span className="eyebrow">{contact.eyebrow}</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="closing__title display" id="contact-title">
            {contact.titleA} <em>{contact.titleB}</em>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="lead closing__text">{contact.text}</p>
        </Reveal>
        <Reveal delay={0.25} className="closing__ctas">
          <Button href={`mailto:${site.email}`} variant="lime" arrow={false}>
            {site.email}
          </Button>
          <Button href={site.chat} variant="ghost" external>
            {contact.cta}
          </Button>
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
