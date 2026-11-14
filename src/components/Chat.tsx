import { chat, site } from "../content"
import { Mark } from "./Mark"
import { Reveal } from "./Reveal"

/** Ask in plain words: a worked, fictional exchange and a field that opens the real chat. */
export function Chat() {
  return (
    <section className="section section--dark chat" id="chat" aria-labelledby="chat-title">
      <div className="wrap chat__row">
        <Reveal className="chat__text">
          <span className="eyebrow">{chat.eyebrow}</span>
          <h2 className="h2" id="chat-title">
            {chat.titleA} <em>{chat.titleB}</em>
          </h2>
          <p className="lead">{chat.text}</p>
        </Reveal>
        <Reveal className="chat__card" delay={0.1}>
          <div className="chat__thread">
            <div className="chat__q">{chat.question}</div>
            <div className="chat__a">
              <div className="chat__who">
                <Mark size={14} tone="dark" />
                <span>{site.name}</span>
              </div>
              {chat.answer.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <div className="chat__sources">
                {chat.sources.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
              <span className="chat__fictional">{chat.fictional}</span>
            </div>
            <form
              className="chat__form"
              action={site.chat}
              method="get"
              target="_blank"
              onSubmit={(e) => {
                e.preventDefault()
                window.open(site.chat, "_blank", "noopener,noreferrer")
              }}
            >
              <label htmlFor="pg-ask" className="mono">
                {chat.label}
              </label>
              <div className="chat__field">
                <input id="pg-ask" type="text" name="q" placeholder={chat.placeholder} autoComplete="off" />
                <button type="submit" className="chat__send" aria-label={chat.send}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
