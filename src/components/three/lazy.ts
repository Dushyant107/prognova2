import { lazy } from "react"

// Three.js and its scenes load in their own chunk, after the page has painted.
export const LazySky = lazy(() => import("./Brain").then((m) => ({ default: m.SkyCanvas })))
export const LazyBot = lazy(() => import("./Bot").then((m) => ({ default: m.BotCanvas })))
