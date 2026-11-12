import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import * as THREE from "three"

export type Progress = { current: number }

const FOREST = "#135f50"
const FOREST_DEEP = "#0a4d41"
const SAGE = "#879d78"
const LIME = "#c9e27a"

/* The crescent: the outer circle of the mark minus the offset inner circle. */
function crescentShape() {
  const s = new THREE.Shape()
  const a = 1.909 // outer intersection angle
  const b = 1.363 // inner intersection angle, relative to the inner centre
  s.absarc(0, 0, 1, a, -a, true)
  s.absarc(-0.53, 0, 0.964, -b, b, false)
  s.closePath()
  return s
}

/* The sage leaf, the figure's arm leaning into the curve. */
function leafShape() {
  const s = new THREE.Shape()
  s.moveTo(0.32, 0.39)
  s.bezierCurveTo(0.14, -0.09, -0.24, -0.29, -0.53, -0.6)
  s.bezierCurveTo(-0.69, -0.78, -0.78, -0.98, -0.82, -1.2)
  s.bezierCurveTo(-0.53, -0.95, -0.13, -0.8, 0.14, -0.49)
  s.bezierCurveTo(0.32, -0.27, 0.36, 0.06, 0.32, 0.39)
  s.closePath()
  return s
}

const extrude = { depth: 0.22, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 6, curveSegments: 72 }
const extrudeLeaf = { ...extrude, depth: 0.14, bevelThickness: 0.035, bevelSize: 0.03 }

function EmblemMesh({ progress, spin = 1 }: { progress?: Progress; spin?: number }) {
  const group = useRef<THREE.Group>(null)
  const crescent = useMemo(() => new THREE.ExtrudeGeometry(crescentShape(), extrude), [])
  const leaf = useMemo(() => new THREE.ExtrudeGeometry(leafShape(), extrudeLeaf), [])

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const p = progress?.current ?? 0
    const t = state.clock.elapsedTime
    const px = state.pointer.x
    const py = state.pointer.y
    // Tilt and roll with the scroll; the mark always keeps its face to the camera.
    const targetY = -0.3 + p * 1.15 * spin + px * 0.22 + Math.sin(t * 0.4) * 0.06
    const targetX = 0.1 - py * 0.16 + Math.cos(t * 0.5) * 0.04 + p * 0.25 * spin
    const targetZ = p * 0.5 * spin
    g.rotation.y += (targetY - g.rotation.y) * 0.08
    g.rotation.x += (targetX - g.rotation.x) * 0.08
    g.rotation.z += (targetZ - g.rotation.z) * 0.08
  })

  return (
    <group ref={group} position={[0.18, 0.28, 0]}>
      <mesh geometry={crescent} castShadow receiveShadow position={[0, 0, -0.11]}>
        <meshPhysicalMaterial color={FOREST} roughness={0.32} metalness={0.08} clearcoat={0.7} clearcoatRoughness={0.25} />
      </mesh>
      <mesh position={[-0.43, 0.39, 0.02]}>
        <sphereGeometry args={[0.26, 48, 48]} />
        <meshPhysicalMaterial color={FOREST_DEEP} roughness={0.28} clearcoat={0.8} clearcoatRoughness={0.2} />
      </mesh>
      <mesh geometry={leaf} position={[0, 0, -0.07]}>
        <meshPhysicalMaterial color={SAGE} roughness={0.42} clearcoat={0.4} />
      </mesh>
    </group>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#e6f2bd", "#03221c", 0.9]} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} color="#ffffff" />
      <directionalLight position={[-2, 1, -4]} intensity={1.2} color="#b5d34f" />
      <pointLight position={[-3.5, -2, 3]} intensity={18} color={LIME} distance={12} />
      <pointLight position={[2.5, -3, -2]} intensity={8} color="#6fd6c9" distance={10} />
      <spotLight position={[0, 5, 2]} intensity={6} angle={0.6} penumbra={1} color="#e6f2bd" />
    </>
  )
}

export function EmblemCanvas({
  progress,
  className,
  spin,
  scale = 0.82,
  position = [0.15, -0.2, 0],
}: {
  progress?: Progress
  className?: string
  spin?: number
  scale?: number
  position?: [number, number, number]
}) {
  return (
    <div className={className ?? "fill"} aria-hidden="true">
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 5.2], fov: 32 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <Lights />
        <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.7} floatingRange={[-0.12, 0.12]}>
          <group scale={scale} position={position}>
            <EmblemMesh progress={progress} spin={spin} />
          </group>
        </Float>
      </Canvas>
    </div>
  )
}
