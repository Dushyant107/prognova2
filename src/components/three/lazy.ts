import { lazy } from "react"

// Three.js and its scenes load in their own chunk, after the page has painted.
export const LazyEmblem = lazy(() => import("./Emblem").then((m) => ({ default: m.EmblemCanvas })))
export const LazyBot = lazy(() => import("./Bot").then((m) => ({ default: m.BotCanvas })))
