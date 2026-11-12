import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, RoundedBox } from "@react-three/drei"
import * as THREE from "three"

/**
 * A small care-robot head in the Prognova palette, after the supplied reference:
 * a rounded cube with a recessed screen, two half-moon eyes, and studs on the body.
 * mood: 0 read · 1 remember · 2 reason (off until validated) · 3 run
 */
export type Mood = 0 | 1 | 2 | 3

const BODY = "#0a4d41"
const BODY_EDGE = "#135f50"
const SCREEN = "#03221c"
const LIME = "#c9e27a"
const SAGE = "#879d78"

const MOODS = [
  { eye: LIME, glow: 14, eyeW: 1, eyeH: 1, spin: 0.25, bob: 0.0 },
  { eye: LIME, glow: 18, eyeW: 1.12, eyeH: 1.25, spin: 0.35, bob: 0.0 },
  { eye: SAGE, glow: 2.5, eyeW: 1, eyeH: 0.45, spin: 0.12, bob: 0.0 },
  { eye: "#e6f2bd", glow: 26, eyeW: 1.05, eyeH: 1.05, spin: 0.9, bob: 0.08 },
]

function Eye({ x, eyeRef }: { x: number; eyeRef: (m: THREE.Mesh | null) => void }) {
  const geo = useMemo(() => new THREE.CircleGeometry(0.17, 40, 0, Math.PI), [])
  return (
    <mesh ref={eyeRef} geometry={geo} position={[x, -0.02, 0.705]}>
      <meshBasicMaterial color={LIME} toneMapped={false} />
    </mesh>
  )
}

function BotMesh({ mood }: { mood: Mood }) {
  const group = useRef<THREE.Group>(null)
  const eyes = useRef<(THREE.Mesh | null)[]>([null, null])
  const light = useRef<THREE.PointLight>(null)
  const colour = useRef(new THREE.Color(LIME))
  const blink = useRef(0)

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const m = MOODS[mood]
    const t = state.clock.elapsedTime
    // body
    const ty = Math.sin(t * m.spin) * 0.35 + state.pointer.x * 0.35
    const tx = -0.08 + Math.cos(t * 0.6) * 0.06 - state.pointer.y * 0.2
    g.rotation.y += (ty - g.rotation.y) * 0.06
    g.rotation.x += (tx - g.rotation.x) * 0.06
    g.position.y += (Math.sin(t * 2.2) * m.bob - g.position.y) * 0.1
    // blink every ~3.4s
    const phase = (t + 1) % 3.4
    const target = phase < 0.12 ? 0.08 : 1
    blink.current += (target - blink.current) * (target < 1 ? 0.55 : 0.25)
    colour.current.lerp(new THREE.Color(m.eye), 0.08)
    for (const e of eyes.current) {
      if (!e) continue
      e.scale.x += (m.eyeW - e.scale.x) * 0.1
      e.scale.y += (m.eyeH * blink.current - e.scale.y) * 0.2
      ;(e.material as THREE.MeshBasicMaterial).color.copy(colour.current)
    }
    if (light.current) {
      light.current.intensity += (m.glow - light.current.intensity) * 0.08
      light.current.color.copy(colour.current)
    }
  })

  const studs: [number, number, number][] = [
    [-0.62, -0.62, 0.45],
    [0.62, -0.62, 0.45],
    [-0.62, -0.62, -0.45],
    [0.62, -0.62, -0.45],
    [-0.9, 0.1, 0.1],
    [0.9, 0.1, 0.1],
  ]

  return (
    <group ref={group}>
      <RoundedBox args={[1.75, 1.42, 1.3]} radius={0.3} smoothness={10}>
        <meshPhysicalMaterial color={BODY} roughness={0.3} metalness={0.05} clearcoat={0.9} clearcoatRoughness={0.2} />
      </RoundedBox>
      {/* bezel */}
      <RoundedBox args={[1.42, 1.0, 0.16]} radius={0.2} smoothness={8} position={[0, 0, 0.6]}>
        <meshPhysicalMaterial color={BODY_EDGE} roughness={0.35} clearcoat={0.6} />
      </RoundedBox>
      {/* screen */}
      <RoundedBox args={[1.24, 0.82, 0.08]} radius={0.16} smoothness={8} position={[0, 0, 0.66]}>
        <meshPhysicalMaterial color={SCREEN} roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} />
      </RoundedBox>
      <Eye x={-0.27} eyeRef={(m) => (eyes.current[0] = m)} />
      <Eye x={0.27} eyeRef={(m) => (eyes.current[1] = m)} />
      <pointLight ref={light} position={[0, 0, 1.1]} intensity={14} color={LIME} distance={4} />
      {studs.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshPhysicalMaterial color={BODY_EDGE} roughness={0.3} clearcoat={0.8} />
        </mesh>
      ))}
      {/* ear nubs */}
      {[-0.56, 0.56].map((x) => (
        <mesh key={x} position={[x, 0.78, -0.1]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.16, 20]} />
          <meshPhysicalMaterial color={BODY_EDGE} roughness={0.35} clearcoat={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function BotCanvas({ mood, className }: { mood: Mood; className?: string }) {
  return (
    <div className={className ?? "fill"} aria-hidden="true">
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.1, 4.6], fov: 32 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 4]} intensity={2.6} />
        <pointLight position={[-4, -2, 3]} intensity={10} color="#b5d34f" distance={10} />
        <pointLight position={[3, -3, -3]} intensity={6} color="#6fd6c9" distance={10} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.9} floatingRange={[-0.15, 0.15]}>
          <group scale={1.05} rotation={[0.1, -0.35, 0]}>
            <BotMesh mood={mood} />
          </group>
        </Float>
      </Canvas>
    </div>
  )
}
