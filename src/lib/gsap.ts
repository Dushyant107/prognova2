import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

gsap.defaults({ ease: "power3.out", duration: 0.8 })

export const REDUCED = "(prefers-reduced-motion: reduce)"
export const MOTION_OK = "(prefers-reduced-motion: no-preference)"

export { gsap, ScrollTrigger, useGSAP }
