import { Suspense, useEffect, useState } from "react"
import { MotionConfig } from "motion/react"
import { ScrollTrigger } from "./lib/gsap"
import { getLenis, startSmoothScroll } from "./lib/scroll"
import { LazySky } from "./components/three/lazy"
import { Preloader } from "./components/Preloader"
import { Header } from "./components/Header"
import { Hero } from "./components/Hero"
import { How } from "./components/How"
import { Name } from "./components/Name"
import { Facts } from "./components/Facts"
import { Problem } from "./components/Problem"
import { AskRecord } from "./components/AskRecord"
import { Jobs } from "./components/Jobs"
import { WhyNow } from "./components/WhyNow"
import { Proof } from "./components/Proof"
import { Landscape } from "./components/Landscape"
import { Moat } from "./components/Moat"
import { Plan } from "./components/Plan"
import { Devices } from "./components/Devices"
import { Risks } from "./components/Risks"
import { Chat } from "./components/Chat"
import { Closing } from "./components/Closing"

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    startSmoothScroll()
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener("load", onLoad)
    return () => window.removeEventListener("load", onLoad)
  }, [])

  useEffect(() => {
    if (!ready) return
    // the sky starts the brain's entrance once the preloader has left
    document.documentElement.dataset.ready = "1"
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      // Dev helper for headless screenshots: /?y=<px> lands the page at that scroll position.
      const y = Number(new URLSearchParams(location.search).get("y"))
      if (y > 0) {
        getLenis()?.scrollTo(y, { immediate: true, force: true })
        window.scrollTo({ top: y, behavior: "instant" })
        setTimeout(() => ScrollTrigger.update(), 50)
      }
    })
  }, [ready])

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Preloader onDone={() => setReady(true)} />
      <Suspense fallback={null}>
        <LazySky />
      </Suspense>
      <Header />
      <main id="main">
        <Hero ready={ready} />
        <How />
        <Name />
        <Facts />
        <Problem />
        <AskRecord />
        <Jobs />
        <WhyNow />
        <Proof />
        <Landscape />
        <Moat />
        <Plan />
        <Devices />
        <Risks />
        <Chat />
        <Closing />
      </main>
    </MotionConfig>
  )
}
