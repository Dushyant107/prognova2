import { useCallback, useEffect, useRef, useState } from "react"

const GLYPHS = "()[]{}%&$·@+|/=€*0123456789"

/** Scrambles a label into glyphs and resolves it back, left to right. */
export function useScramble(text: string, duration = 520) {
  const [out, setOut] = useState(text)
  const raf = useRef(0)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setOut(text)
  }, [text])

  const play = useCallback(() => {
    if (reduced.current) return
    cancelAnimationFrame(raf.current)
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const settled = Math.floor(p * text.length)
      let s = ""
      for (let i = 0; i < text.length; i++) {
        const c = text[i]
        if (c === " " || i < settled) s += c
        else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }
      setOut(s)
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else setOut(text)
    }
    raf.current = requestAnimationFrame(tick)
  }, [text, duration])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  return { out, play }
}
