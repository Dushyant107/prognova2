import Lenis from "lenis"
import { gsap, ScrollTrigger, REDUCED } from "./gsap"

let lenis: Lenis | null = null

export function startSmoothScroll() {
  if (lenis || window.matchMedia(REDUCED).matches) return null
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true })
  lenis.on("scroll", ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function getLenis() {
  return lenis
}

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = locked ? "hidden" : ""
}

export function scrollTo(target: string | number, offset = 0) {
  if (lenis) lenis.scrollTo(target, { offset, duration: 1.2 })
  else if (typeof target === "string") document.querySelector(target)?.scrollIntoView({ behavior: "smooth" })
  else window.scrollTo({ top: target, behavior: "smooth" })
}
