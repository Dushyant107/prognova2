# Prognova AI — content inventory from prognova.ai

Source: https://www.prognova.ai/ (home), /chat, /privacy. Read on 11 November 2026.
Purpose: the complete content of the reference site, organised by section, with notes on
what to keep, what to rework, and how each piece could be presented. Build instructions
come later; nothing here is a design decision yet.

Note on the repo: `src/content.ts` already holds a copy of this same text (header comment:
"All copy on the site, taken from prognova.ai"). The live site is the deployed version of
this product. One section, "The plan" (Eighteen months, three gates), exists in the repo
copy but is not rendered on the live home page any more, though the Risks section still
refers to it. It is included at the end of section 4 as recoverable content.

---

## 1. What the site is

| Item | Finding |
|---|---|
| Product | Prognova: a small medical language model (MedGemma 1.5, 4B parameters, fine-tuned with QLoRA) that reads a patient's verified hospital and lab records and answers only with a citation to the exact line, refusing when it cannot. |
| Positioning line | "One clinical brain." |
| Meta description | A small medical language model trained on verified hospital and lab records that answers only with evidence it can cite, and refuses when it cannot point to the exact line. |
| Audience | Primarily investors (sections on market, moat, competition, risks, "raising"); secondarily doctors and hospital partners; the chat page serves anyone who wants to try it. |
| Market | India private hospitals first; ABDM and DPDP Act 2023 are the regulatory anchors. |
| Stage | Pre-revenue by design. First paid pilots 2027. Reasoning tier 2028. Device/OEM licensing 2029+. |
| Entities | Prognova, Inc. (Delaware) · Prognova Health Private Limited (India) |
| Contact | hello@prognovahealth.com (only contact channel; no form, no socials) |
| Tone | Plain, declarative, short sentences. Admits limits openly ("Read it honestly", "What could kill us"). No marketing adjectives. British spelling (haemoglobin, digitising, licence). |

## 2. Site map and navigation

Pages: `/` (single long scroll), `/chat` (live demo app), `/privacy`.

Header nav (desktop and mobile): How it works (#how-it-works) · Why now (#why-now) · Proof (#proof) · Traction (#traction) · CTA button "Try Prognova AI" → /chat.
Mobile menu also shows the disclaimer line (see section 6).

Home page section order and anchor ids, as rendered live:

| # | Section id | Headline |
|---|---|---|
| 1 | top / hero | One clinical brain. |
| 2 | problem | The doctor has minutes. The record is everywhere. |
| 3 | how-it-works (ask-the-record) | Every answer points to the line it came from. |
| 4 | layers | Read. Remember. Reason. Run. |
| 5 | why-now | The model is free. The data is not. |
| 6 | robot | Beside the doctor today. Inside the robot tomorrow. (includes pricing roadmap) |
| 7 | proof | A 4B model, read against the frontier. |
| 8 | traction | The data is flowing. |
| 9 | competition | Everyone knows medicine. Nobody knows the patient. |
| 10 | moat | You can download a model. You cannot replicate the training corpus. |
| 11 | risks | What could kill us, and what we do about it. |
| 12 | raising (closing) | Clinical AI will be judged on what it can prove, not what it can say. |
| — | footer | legal, links, disclaimer |

Footer nav: Privacy · Chat with Prognova · hello@prognovahealth.com · Back to top.

## 3. Visual and brand facts observed on the live site

| Item | Live site | Repo tokens (`src/styles/tokens.css`) |
|---|---|---|
| Background | Dark navy, rgb(7, 14, 28); `color-scheme: dark` | #050a12 / #0a1220 |
| Text | Warm off-white rgb(244, 241, 234) | #eef3f6 ink, #c3ccd4 body |
| Display face | Instrument Serif, weight 400, ~104px hero | Plus Jakarta Sans / Manrope |
| Body face | Geist | Manrope |
| Mono | not measured | JetBrains Mono |
| Accent | not measured from CSS; repo uses teal | teal #3fc1b0, cyan #6fd6ff, lime #c9e27a, sage #879d78, rose #e38bb0 |
| Hero visual | 3D brain (canvas); credit "Brain model: Poly by Google, CC BY 3.0" | Emblem3D + NeuralField components |
| Logo asset | /brand/logo-on-navy.png (header), /brand/logo.png (og:image) | public/logo.webp |
| Motion | Scroll-driven: hero scatters record pieces and pulls them into "one record"; honours reduced-motion (stills brain rotation and background drift) | motion (Motion for React), reducedMotion="user" |
| Imagery | None. No photos, no screenshots, no illustrations beyond the brain and the fictional lab-report table. | — |
| Fonts | Self-hosted, same origin, no third-party requests | — |
| Measure | 62ch max line length; nav height 3.75rem; 16px gutter | 1240px content max, 24px gutter |

The live site is a Next.js build (Vercel). Our repo is Vite + React. Visual direction
differs (serif display on live vs sans in repo; live is navy, repo is navy/teal), so the
visual system is an open decision for the build brief.

---

## 4. Section-by-section content

Format for each section: the exact copy, any data, the interaction present on the live
site, then a recommendation for the new build.

### 4.1 Hero (`#top`)

- Eyebrow (repo copy, not visible live): Clinical AI · MedGemma 1.5 · 4B parameters
- H1: **One clinical brain.**
- Lead: Every doctor deserves an intelligence that knows their patient. Every medical robot will need a brain it can trust.
- Scroll hint: Scroll to bring the record together ↓
- Scroll stage text: "The doctor has minutes. The record is everywhere." → "…until it is one record."
- Record pieces animated into one (repo list): Lab report, Imaging, Prescription, Clinical notes, Discharge summary, Second hospital.
- CTA: Try Prognova AI → /chat

Live interaction: full-viewport pinned hero. Record fragments scattered; scrolling pulls them together; navbar appears only after the hero sequence completes.

Recommendation: keep headline and lead verbatim, they are the strongest lines on the site. Keep the "fragments → one record" idea as the one hero animation. Make the CTA visible in the hero itself, not only in the nav.

### 4.2 Problem (`#problem`)

- H2: **The doctor has minutes. The record is everywhere.**
- P1: A patient's record is scattered across labs, imaging, prescriptions, notes and discharge summaries, often across hospitals, and the doctor has minutes to put it together. The AI on their phone answers from the literature or from a general model in someone else's cloud. It is fluent, general, and unverifiable at the bedside.
- P2: Nobody has trained a model on the verified record of the patient in the room, because that record never leaves the hospital.

Recommendation: keep as a two-paragraph statement. Candidate for a split layout: headline left, paragraphs right, with the record-piece labels from the hero reused as a quiet visual.

### 4.3 How it works / Ask the record (`#how-it-works`, `#ask-the-record`)

- H2: **Every answer points to the line it came from.**
- Lead: Ask the record a question. Prognova answers from the page and shows the exact line it read, or it says the answer is not there. It does not fill the gap with a guess.
- Label: ASK THE RECORD
- Q1: Are the blood sugar results in range?
  - Answer (repo): No. HbA1c is 8.2 % against a reference of under 5.7 %, and fasting glucose is 164 mg/dL against 70 – 99. Both are above range.
  - Cites lines 14 and 15. Caption: Laboratory report, page 2, lines 14 and 15
- Q2: Is there a family history of diabetes?
  - Answer (repo): The record does not say. The family history section on this report is blank, so there is nothing to cite.
  - Cites nothing. Caption: Family history · blank · nothing to cite
- Empty-state prompt: Choose a question. The answer appears here with the line it came from.
- Closing line: **If it cannot point to the line, it says nothing. That refusal is the product.**

Fictional lab report (the artefact being queried):

LABORATORY REPORT · Page 2 of 2 · Patient: fictional · Specimen: venous blood, fasting

| Line | Test | Result | Reference interval |
|---|---|---|---|
| 10 | Haemoglobin | 13.9 g/dL | 13.0 – 17.0 |
| 11 | White cell count | 6.8 × 10⁹/L | 4.0 – 11.0 |
| 12 | Platelets | 245 × 10⁹/L | 150 – 410 |
| 13 | Creatinine | 0.9 mg/dL | 0.7 – 1.3 |
| 14 | HbA1c | 8.2 % | < 5.7 |
| 15 | Glucose, fasting | 164 mg/dL | 70 – 99 |
| 16 | TSH | 2.1 mIU/L | 0.4 – 4.0 |
| 17 | Cholesterol, total | 182 mg/dL | < 200 |

FAMILY HISTORY: Blank. Nothing is recorded here. (chip: Blank · nothing to cite)
Footnote: Fictional example. Prognova does not diagnose.

Live interaction: two question buttons; choosing one writes the answer and highlights the cited lines in the table; Q2 highlights the blank family-history box instead.

Recommendation: this is the core demo and should stay interactive. Keep both questions: one that answers with citations, one that refuses. Add a third question later only if it also demonstrates refusal or citation; do not add anything that looks like diagnosis.

### 4.4 Four jobs (`#layers`)

- H2: **Read. Remember. Reason. Run.**
- Lead: One small medical language model, trained on verified hospital and lab records, doing four jobs.
- Model line: MedGemma 1.5 · 4B parameters · fine-tuned with QLoRA

| # | Job | Copy | Status |
|---|---|---|---|
| 01 | Read | Reads clinical documents, lab reports first, and keeps the page and line each value came from. | v1 · today (live) |
| 02 | Remember | Remembers each patient across visits and hospitals, in a context the patient owns. | v2 · next |
| 03 | Reason | Reasons over the record with a doctor signing off on every answer. | Off until validated |
| 04 | Run | Will run the same model inside devices: it is small enough to fit onboard. | Device licensing · 2029+ |

- Footnote: v1 reads the record. v2 learns continuously: each patient gets a persistent context they own, and every doctor correction feeds back as training signal.

Recommendation: four-card row or a stepped list. Only "Read" should look live; the other three visibly future. The status chips are the honest part, keep them.

### 4.5 Why now (`#why-now`)

- H2: **The model is free. The data is not.**
- Lead: Anyone can download a medical model. Nobody can download the verified record of the patient in the room, and that record lives inside hospitals.

| Tag | Title | Copy |
|---|---|---|
| Open base models · MedGemma 1.5 · 4B | The model is nearly free. | Open medical base models such as Google's MedGemma mean a small team can fine-tune a competitive clinical model. The scarce input is now verified data, not compute. |
| 34,000+ beds by FY2030 · ABDM | Hospitals are digitising. | India's corporate hospital chains are adding beds and moving records onto digital systems under the national ABDM framework. Those records are the training corpus. |
| DPDP Act 2023 | Regulation favours evidence. | India's data protection law requires consent and purpose limitation for health data. A model whose every answer traces to a consented record, with a context the patient controls, is the easy way to comply. |
| OpenEvidence · 40%+ of US physicians | Adoption is settled. Grounding is not. | Doctors already use AI at the point of care. The open question is no longer whether they will, but whether the answer comes from the patient's own record. |

Market strip (label: Market · rating-agency figures only):

| Item | Figure | Source |
|---|---|---|
| India private hospitals | $122B (2025) → $202B by 2030 | Brickwork Ratings |
| Large private chains | 18 large chains · Rs 40,000 crore outlay | ICRA |

Recommendation: four reason cards plus a two-stat market strip. Keep the source attributions visible; they fit the site's "prove it" voice.

### 4.6 Beside the doctor / inside the robot, with pricing roadmap (`#robot`)

- H2: **Beside the doctor today. Inside the robot tomorrow.**
- P1: One model, trained on the patient's verified record. Beside the doctor it shows what changed since the last visit and what to check next, and every answer carries the exact line it came from.
- P2: The refusal is what lets a doctor trust it today, and what will let a care robot run it tomorrow.
- Label: Where the same brain runs next · Research

| Device | Copy |
|---|---|
| Ward assistant | Checks on a patient overnight. |
| Triage kiosk | Takes a history. |
| Home-care unit | Watches recovery after discharge. |

- Chip: MedGemma 1.5 · 4B parameters · fits onboard
- H3: **The hospital pays for the brain, then the device does.**

| Year | Tier | Copy |
|---|---|---|
| 2027 | Clinical assistant subscription | For doctors, and for patients in aftercare, answering from the verified record. Pricing will be set with the first paid pilots. |
| 2028 | Clinical reasoning tier | A higher tier, once doctor-in-the-loop reasoning passes clinical validation. |
| 2029+ | Device & OEM licensing | The model embedded in diagnostic instruments, patient-monitoring devices and care robots. Not surgical robotics: the brain that knows the patient, not the hand that operates. |

- Footnote: Prognova is pre-revenue by design. The first paid pilots are planned for 2027.

Recommendation: two distinct blocks are merged here on the live site (vision + business model). Consider splitting: "Where it runs" as a device trio, and "How it earns" as a three-step timeline. The timeline is the only pricing content on the site; there are no prices.

### 4.7 Proof / benchmark (`#proof`)

- H2: **A 4B model, read against the frontier.**
- Lead: We put our 4B model against Claude Opus 5.5 and GPT-6.1 Sol, both at high effort, on identical held-out lab reports. It missed nothing and invented nothing.
- Caption: Lab reports, 60 held-out pages, identical inputs.

Headline stats (animated counters live):

| Stat | Label | Comparison |
|---|---|---|
| 99.1% | of flags correct | Claude Opus 5.5 and GPT-6.1 Sol (high): 85.7% |
| 100% | of abnormal results caught | — |
| 0% | invented values | — |

Full table (caption: Lab reports: 60 held-out pages, identical inputs for every model.):

| Model | Abnormal caught | Flags correct | Invented values | Cost / page | Time / page |
|---|---|---|---|---|---|
| Prognova v1 (4B) | 100% | 99.1% | 0% | $0.014 | 23 s |
| Claude Opus 5.5 (high) | 94.4% | 85.7% | 0% | $0.018 | 5 s |
| GPT-6.1 Sol (high) | 94.4% | 85.7% | 0% | $0.005 | 4 s |
| Base MedGemma | 47% | 68% | 28% | — not supplied | — not supplied |

- H3: **Read it honestly.**
  - GPT-6.1 Sol is faster and cheaper per page. Our advantage is precision and grounding, not raw speed.
  - Counts are small, and we say so. Confidence intervals come with the next release.
  - Lab reports are the first report type. Imaging, prescriptions and clinical notes are benchmarked next.

Recommendation: keep the three big numbers, the full table, and the "Read it honestly" caveats together. The caveats are what make the numbers credible. Table needs a mobile treatment (live site shows "Scroll the table sideways").

### 4.8 Traction (`#traction`)

- H2: **The data is flowing.**

| Number | Label |
|---|---|
| 25,003 | lab visits processed through the evidence pipeline |
| 481 | automated tests, across ~12,000 lines of Python |

- Footnote: Pre-revenue by design; first paid pilots planned for 2027.

Recommendation: thin section, two counters. Numbers will go stale; treat them as data fields that are easy to update (one place in content). Candidate to merge into Proof if the page needs shortening.

### 4.9 Competitive landscape (`#competition`)

- H2: **Everyone knows medicine. Nobody knows the patient.**
- Lead: OpenEvidence knows the medical literature. Prognova knows the patient.
- Table caption: Five approaches to clinical AI: what each knows, what it is grounded in, and where it stops.

| Approach | Sub-label | Knows | Grounded in | Where it stops |
|---|---|---|---|---|
| OpenEvidence | $12B valuation | The medical literature | Citations to papers | What the literature says about a condition, not what this patient's record says. |
| General models | OpenAI, Anthropic, Google | The internet | None by default | Fluent and unverifiable at the bedside. On held-out lab reports, Claude Opus 5.5 and GPT-6.1 Sol at high effort: 85.7% of flags correct, against 99.1% for Prognova v1. |
| Ambient scribes | Abridge, Nuance | Conversations | The visit transcript | What was said in one visit. No memory of the record across visits and hospitals. |
| EHR vendors | Epic, Oracle | Their own records | Varies; US-centric | One vendor's system and one market. No presence in Indian private hospitals. |
| Prognova | MedGemma 1.5 · 4B | The patient: verified hospital and lab records | The exact line in the record | At the edge of the record. If it cannot point to the line, it says nothing. |

- Footnote: Every row above knows medicine. None of them is trained on the patient in the room. The real threat is an EHR vendor or a frontier lab going on-premise; by then we want the records in our corpus, the doctors' corrections in our training set, and the model inside the instruments.

Recommendation: keep as a comparison table with the Prognova row highlighted last. On mobile, stack into cards with the four labels inline.

### 4.10 Moat (`#moat`)

- H2: **You can download a model. You cannot replicate the training corpus.**
- Lead: The code is not the moat. Three things are.

| # | Tag | Title | Copy |
|---|---|---|---|
| 01 | The corpus | A corpus nobody else has. | Verified clinical records from partner labs, every case that comes through the referral network, and every correction a doctor makes: labelled, patient-level data that cannot be scraped from the internet or bought from a vendor. |
| 02 | Ground truth | Compounding ground truth. | Every answer a doctor confirms becomes ground truth. Each release retrains on the best open base model, so Prognova gains from base-model progress instead of competing with it. |
| 03 | Trust | Trust that ships inside devices. | Doctors accept AI they can check. Only a model that refuses to guess is safe to run inside an instrument or a care robot. |

- Footnote: Each of these is work a competitor must repeat, hospital by hospital.

Recommendation: three numbered cards. Pairs naturally with 4.9; could be one spread.

### 4.11 Risks (`#risks`)

- H2: **What could kill us, and what we do about it.**

| Risk | Statement | What we do |
|---|---|---|
| Clinical error. | A wrong answer in front of a doctor can harm a patient. | Every answer cites the line it came from and a doctor signs off. Reasoning stays off until it is validated, and each report type passes its own release gate. |
| Small evidence base. | The lab-report comparison rests on 60 held-out pages. Counts are small, and there are no confidence intervals yet. | The first phase of the plan, Prove reading (months 0–6), exists to fix this. Confidence intervals come with the next release. |
| Data access. | Today's corpus is lab data. The full patient record sits inside hospitals and does not leave them. | Growing the corpus to full hospital records is the first priority, and the verified doctor-feedback loop is the durable defence. |
| Base-model dependence. | Prognova fine-tunes Google's MedGemma, so the base model's licence is not ours to set. | A licence change would cost a retrain on another open base model, which our pipeline is built to do. |
| Regulation. | Prognova has no regulatory clearance. Classification as software as a medical device is likely once reasoning ships. | Cited evidence and doctor sign-off are designed to keep Prognova an assistive, decision-support tool under India's current rules. The classification work is budgeted. |

Recommendation: two-column "risk / response" list or accordion. Unusual for a public site and very effective for the investor audience; keep. Note the second risk references "the plan", which is not on the live page (see 4.13).

### 4.12 Closing (`#raising`)

- H2: **Clinical AI will be judged on what it can prove, not what it can say.**
- Label: Contact
- Link: hello@prognovahealth.com

Section id is "raising", which suggests an investor ask was intended here. Live copy has no ask, only the email.

Recommendation: closing band with the line and two actions: email, and Try Prognova AI. If the site is aimed at a raise, this is where a one-line ask would go.

### 4.13 The plan (in repo copy, not on live page)

- H2: **Eighteen months, three gates.**
- Lead: From reading the record to reasoning on it. Each phase ends on a gate.

| Phase | Months | Title | Milestones | Gate |
|---|---|---|---|---|
| Phase 1 | 0–6 | Prove reading | Benchmark imaging, prescriptions and notes. Build a non-Indian test set. | Reading accuracy with confidence intervals; first hospital records in the corpus. |
| Phase 2 | 6–12 | Patient record | Every report type in one longitudinal record. Pilots in partner hospitals. First instrument integration. | Doctors use it weekly in a pilot hospital. |
| Phase 3 | 12–18 | Clinical reasoning | Doctor-in-the-loop reasoning. Clinician-led validation. First paid contracts. First edge model. | Paid pilot converted; Series A metrics. |

Recommendation: decide whether to restore it. It resolves the dangling reference in Risks and gives investors the timeline. Natural position: after Moat, before Risks (where the repo renders it).

---

## 5. Sub-pages

### 5.1 /chat — "Chat | Prognova"

- H1: **Ask about a record.**
- Intro: Type a question or attach a lab report: the PDF reads most reliably, a photo works too. Replies come from Prognova's research model: it can be wrong, and every reply needs a clinician's judgement.
- Input placeholder: Ask about a lab report…
- Attach control: Attach · PDF or photo. PDFs read most reliably.
- Buttons: New chat · Attach a PDF or images · Send message
- Footer line: Prognova can be wrong and does not diagnose. Do not enter information that identifies a patient.
- Behaviour described in privacy page: a few free messages without an account; email-code sign-in (Auth.js); conversations kept only in the tab's session storage; attachments decoded in memory on an AWS GPU server, never written to disk.

Recommendation: this is a working app, not marketing. For our build it is either linked out to the live /chat or re-built as a separate task. Keep the disclaimer strings exactly.

### 5.2 /privacy — "Privacy and cookies | Prognova"

Last reviewed 9 November 2026. Sections: Cookies · Data we receive · Accounts and free messages · Fonts and third parties · Health information · Your preferences.

Key facts to carry over:
- No analytics, advertising or tracking cookies; no consent banner because all cookies are strictly necessary.
- Cookies: authjs.session-token (30 days), authjs.csrf-token (session), authjs.callback-url (session), pn_guest (30 days). Session storage: pn_chat_v1, pn_signin_pending.
- Hosting provider receives IP, page, user agent only.
- Free-message counting uses HMAC-SHA-256 hashes of guest cookie, network address + user agent + languages, and network address alone (1 day).
- Account data: email, verification time, session. Delete by emailing hello@prognovahealth.com from the sign-in address.
- Fonts bundled at build time, same origin. No third-party scripts.
- "Do not send health information about yourself or anyone else through this website or by email. The clinical examples on the home page are fictional and non-identifying illustrations of intended use."
- Honours OS reduced-motion setting; stores no preferences.

Recommendation: reuse as-is if the new site keeps the same chat backend; otherwise the Cookies and Accounts sections must be rewritten to match what the new site actually does. Only the Cookies section depends on the chat app.

---

## 6. Global strings (header, footer, legal)

- Site title: Prognova: One clinical brain.
- Brand name as used: Prognova (header, footer). "Prognova AI" appears only in the CTA "Try Prognova AI". "Prognova Health" appears only in the email domain and Indian entity name.
- Disclaimer (mobile menu and footer): **Prognova is assistive technology under development. It does not diagnose and holds no regulatory clearance. Every clinical example on this site is fictional.**
- Footer entities: Prognova, Inc. (Delaware) · Prognova Health Private Limited (India)
- Footer credit: Brain model: Poly by Google, CC BY 3.0
- Footer privacy line: No analytics or tracking. Cookies only for chat sign-in and free messages.
- Accessibility: "Skip to content" link; table captions; aria labels on stat lists ("Prognova v1 on lab reports", "Traction to date").

---

## 7. Recurring phrases worth keeping as the voice

- "If it cannot point to the line, it says nothing. That refusal is the product."
- "Nobody knows the patient."
- "The model is free. The data is not."
- "Pre-revenue by design."
- "Read it honestly."
- "Beside the doctor today. Inside the robot tomorrow."
- "The hospital pays for the brain, then the device does."
- "Clinical AI will be judged on what it can prove, not what it can say."

---

## 8. Gaps on the reference site (content we do not have)

- No team, founders, advisors or clinical partners named.
- No hospital or lab partner names; no logos.
- No testimonials or quotes from doctors.
- No pricing figures (only a tiered timeline).
- No imagery other than the 3D brain; no product screenshots of the chat.
- No investor ask or round details despite a section id of "raising".
- No social links, no blog, no press, no careers.
- No regulatory status page beyond the disclaimer.
- Traction numbers and benchmark figures are undated; a "last updated" would help.

If any of these should appear on the new site, the content has to come from you.

---

## 9. Proposed content structure for the new site (for the build brief)

Recommended page model: keep a single long-scroll home with anchor nav, plus /chat and /privacy. The content splits cleanly into four acts, which can also drive the nav:

1. **What it is** — Hero → Problem → Ask the record (demo) → Four jobs. Nav: "How it works".
2. **Why it matters now** — Why now + market strip → Beside the doctor / inside the robot. Nav: "Why now".
3. **Why believe it** — Proof benchmark → Traction → Competitive landscape → Moat. Nav: "Proof".
4. **Where it goes** — The plan (restored) → Risks → Closing with contact and CTA. Nav: "The plan" or "Traction".

Section-type suggestions, one per content block:

| Content | Suggested presentation |
|---|---|
| Hero | Pinned scroll stage; fragments converge to one record; H1 + lead + CTA |
| Problem | Split text block |
| Ask the record | Interactive two-pane demo: question list + lab report with line highlighting |
| Four jobs | Four cards with status chips; one live, three future |
| Why now | Four reason cards + two-stat market strip with sources |
| Robot / devices | Three device tiles |
| Business model | Three-step horizontal timeline (2027 / 2028 / 2029+) |
| Proof | Three counters + scrollable table + caveat list |
| Traction | Two counters, editable data |
| Competition | Five-row comparison table, Prognova highlighted; cards on mobile |
| Moat | Three numbered cards |
| Plan | Three phases with gates, stepped layout |
| Risks | Two-column risk / response list |
| Closing | Full-width statement band, email + CTA |
| Footer | Entities, disclaimer, links, credit |

All copy above can be used verbatim. Items marked "repo" are in `src/content.ts` and were
on the site when that file was written but are not rendered on the live page today.
