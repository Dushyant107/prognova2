import { useEffect, useState } from "react"
import { AnimatePresence, animate, motion } from "motion/react"
import { Mark } from "./Mark"
import { preloader } from "../content"
import { lockScroll } from "../lib/scroll"

export function Preloader({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0)
  const [line, setLine] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Dev helper: /?y=<px> screenshots skip the count so the page lands at once.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(location.search).has("y")
    lockScroll(true)
    if (reduced) {
      setN(100)
      const t = setTimeout(() => setShow(false), 200)
      return () => clearTimeout(t)
    }
    const ctrl = animate(0, 100, {
      duration: 1.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        setN(Math.round(v))
        setLine(Math.min(preloader.lines.length - 1, Math.floor((v / 100) * preloader.lines.length)))
      },
      onComplete: () => setTimeout(() => setShow(false), 260),
    })
    return () => ctrl.stop()
  }, [])

  return (
    <AnimatePresence
      onExitComplete={() => {
        lockScroll(false)
        onDone()
      }}
    >
      {show && (
        <motion.div
          className="preloader"
          initial={{ y: 0 }}
          exit={{ y: "-100%", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
          aria-live="polite"
        >
          <div className="preloader__inner">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Mark size={84} tone="dark" />
            </motion.div>
            <div className="preloader__line mono" aria-hidden="true">
              <AnimatePresence mode="wait">
                <motion.span
                  key={line}
                  initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                  transition={{ duration: 0.3 }}
                >
                  {preloader.lines[line]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          <div className="preloader__count mono" aria-hidden="true">
            {String(n).padStart(3, "0")}
            <span>.</span>
          </div>
          <div className="preloader__bar" aria-hidden="true">
            <span style={{ transform: `scaleX(${n / 100})` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
