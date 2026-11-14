import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

/**
 * The sky: a fixed canvas behind the whole page. The cortex is a point cloud (46k surface
 * points with normals and a sulcus-depth value, plus sparse edge links) that travels between
 * four anchors in the page as you scroll. Reports stream into it as small glyphs, lime pulses
 * run across it, and at "What comes next" it gathers, flashes and bursts into a field of stars
 * that later settle into one star above the contact line. A depth-only pass keeps the far
 * hemisphere hidden behind the near one.
 */

type BrainData = {
  n: number
  pos: Float32Array
  nrm: Float32Array
  sulc: Float32Array
  rnd: Float32Array
  star: Float32Array
  edges: Uint16Array
  gyri: Uint32Array
  stars: Uint32Array
}

const NS = 900 // points that become stars in the burst
const ND = 150 // ambient dust
const NG = 360 // glyphs streaming in
const MAX_WAVES = 5
const CAM_Z = 5.2
const FOV = 32
const VIEW_H = 2 * CAM_Z * Math.tan((FOV / 2) * (Math.PI / 180))

const PAL = {
  dark: { gyrus: "#f4f6f2", sulcus: "#879d78", lime: "#c9e27a", paper: "#f4f6f2", core: "#f7fbe9", nebula: "#1f7260" },
}

let cache: Promise<BrainData> | null = null

function loadBrain(): Promise<BrainData> {
  if (!cache) {
    cache = fetch(`${import.meta.env.BASE_URL}brain.bin`)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        const dv = new DataView(buf)
        const n = dv.getUint32(4, true)
        const ne = dv.getUint32(8, true)
        let o = 16
        const p16 = new Int16Array(buf.slice(o, o + n * 6))
        o += n * 6
        const q8 = new Int8Array(buf.slice(o, o + n * 3))
        o += n * 3
        const s8 = new Uint8Array(buf.slice(o, o + n))
        o += n
        const edges = new Uint16Array(buf.slice(o, o + ne * 4))

        const pos = new Float32Array(n * 3)
        const nrm = new Float32Array(n * 3)
        const sulc = new Float32Array(n)
        const rnd = new Float32Array(n)
        const star = new Float32Array(n)
        const gyri: number[] = []
        // the source is y-down screen space; flip y so anatomical up is +y
        for (let i = 0; i < n; i++) {
          pos[i * 3] = (p16[i * 3] / 32767) * 1.1
          pos[i * 3 + 1] = (-p16[i * 3 + 1] / 32767) * 1.1 + 0.06
          pos[i * 3 + 2] = (p16[i * 3 + 2] / 32767) * 1.1
          nrm[i * 3] = q8[i * 3] / 127
          nrm[i * 3 + 1] = -q8[i * 3 + 1] / 127
          nrm[i * 3 + 2] = q8[i * 3 + 2] / 127
          sulc[i] = s8[i] / 255
          rnd[i] = Math.random()
          if (sulc[i] < 0.4) gyri.push(i)
        }
        const stars = new Uint32Array(NS)
        for (let k = 0; k < NS; k++) {
          const i = Math.floor(Math.random() * n)
          stars[k] = i
          star[i] = 1
        }
        return { n, pos, nrm, sulc, rnd, star, edges, gyri: Uint32Array.from(gyri), stars }
      })
  }
  return cache
}

function useBrain() {
  const [data, setData] = useState<BrainData | null>(null)
  useEffect(() => {
    let on = true
    loadBrain().then((d) => on && setData(d)).catch(() => {})
    return () => {
      on = false
    }
  }, [])
  return data
}

/* A 6×6 atlas of letters and digits for the glyph stream. */
function makeAtlas() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const cell = 64
  const c = document.createElement("canvas")
  c.width = c.height = cell * 6
  const x = c.getContext("2d")!
  x.clearRect(0, 0, c.width, c.height)
  x.fillStyle = "#fff"
  x.textAlign = "center"
  x.textBaseline = "middle"
  x.font = `500 ${cell * 0.66}px "Inter Variable", Inter, system-ui, sans-serif`
  for (let i = 0; i < 36; i++) x.fillText(chars[i], (i % 6) * cell + cell / 2, Math.floor(i / 6) * cell + cell / 2 + 2)
  const tex = new THREE.CanvasTexture(c)
  tex.flipY = false
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.generateMipmaps = true
  return tex
}

/* ───────────────────────── shaders ───────────────────────── */

const BRAIN_COMMON = /* glsl */ `
  attribute float aSulc;
  attribute float aRnd;
  attribute float aStar;
  uniform float uTime;
  uniform float uIntro;
  uniform float uG;
  uniform float uB;
  uniform vec4 uWaveA[${MAX_WAVES}];
  uniform vec2 uWaveB[${MAX_WAVES}];

  vec3 displaced(out float e) {
    vec3 p = position + normal * (0.006 * sin(uTime * 1.3 + aRnd * 6.2832));
    e = clamp(uIntro * 1.7 - aRnd * 0.7, 0.0, 1.0);
    e = e * e * (3.0 - 2.0 * e);
    float k = (1.0 - e) * (1.5 + 3.5 * fract(aRnd * 7.31));
    p *= 1.0 + k;
    if (uB > 0.0) p *= 0.025 + uB * (2.2 + 4.2 * aRnd);
    else p *= 1.0 - uG * 0.975;
    return p;
  }

  float phase() {
    return uB > 0.0 ? (1.0 - uB) * (1.0 - uB) * 1.6 : 1.0 + uG * 0.8;
  }

  float waveAt(vec3 p) {
    float w = 0.0;
    for (int i = 0; i < ${MAX_WAVES}; i++) {
      vec4 A = uWaveA[i];
      vec2 B = uWaveB[i];
      if (B.x > 0.0) {
        float v = 1.0 - abs(distance(p, A.xyz) - A.w) / B.y;
        if (v > 0.0) w = max(w, v * (1.0 - A.w / B.x));
      }
    }
    return w;
  }
`

const POINT_VERT = /* glsl */ `
  ${BRAIN_COMMON}
  uniform float uDpr;
  uniform float uSize;
  uniform float uAlpha;
  uniform float uMix;
  varying float vA;
  varying float vW;
  varying float vS;
  void main() {
    float e;
    vec3 p = displaced(e);
    vec3 nv = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float back = smoothstep(-0.2, 0.08, nv.z);
    vec3 L = normalize(vec3(-0.45, 0.6, 0.66));
    float dif = max(0.0, dot(nv, L));
    float rim = 1.0 - nv.z;
    float cr = 1.0 - aSulc;
    float aD = (0.07 + 0.8 * cr * cr) * (0.3 + 0.7 * dif) + 0.34 * rim * rim * cr;
    float aL = 0.16 + 0.5 * aSulc + 0.4 * (1.0 - dif) * (1.0 - dif) + 0.42 * rim * rim;
    float a = mix(aL, aD, uMix);
    float w = waveAt(position);
    vW = w;
    vS = aSulc;
    vA = a * e * back * uAlpha * phase();
    if (uB > 0.0 && aStar > 0.5) vA = 0.0;
    float size = (0.9 + 0.6 * cr + 0.25 * (1.0 - uMix)) * uSize * uDpr * (1.0 + 1.4 * w);
    gl_PointSize = size * (${CAM_Z.toFixed(2)} / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const POINT_FRAG = /* glsl */ `
  uniform vec3 uGyrus;
  uniform vec3 uSulcus;
  uniform vec3 uLime;
  varying float vA;
  varying float vW;
  varying float vS;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float m = smoothstep(0.5, 0.12, length(c));
    vec3 col = mix(uGyrus, uSulcus, smoothstep(0.3, 0.75, vS));
    col = mix(col, uLime, clamp(vW * 1.8, 0.0, 1.0));
    float a = vA * m * (1.0 + vW * 1.4);
    if (a < 0.004) discard;
    gl_FragColor = vec4(col, a);
  }
`

/* The occluder: the same points, set a little inside the surface, writing depth only. */
const MASK_VERT = /* glsl */ `
  ${BRAIN_COMMON}
  uniform float uDpr;
  uniform float uSize;
  varying float vE;
  void main() {
    float e;
    vec3 p = displaced(e) - normal * 0.03;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vE = uB > 0.5 ? 0.0 : e;
    gl_PointSize = uSize * 1.9 * uDpr * (${CAM_Z.toFixed(2)} / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const MASK_FRAG = /* glsl */ `
  varying float vE;
  void main() {
    if (vE < 0.6) discard;
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
`

const LINE_VERT = /* glsl */ `
  ${BRAIN_COMMON}
  uniform float uAlpha;
  varying float vA;
  varying float vW;
  void main() {
    float e;
    vec3 p = displaced(e) + normal * 0.004;
    vec3 nv = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float back = smoothstep(-0.1, 0.15, nv.z);
    vW = waveAt(position);
    vA = e * back * uAlpha * (1.0 - uG) * (1.0 - uB);
    gl_Position = projectionMatrix * mv;
  }
`

const LINE_FRAG = /* glsl */ `
  uniform vec3 uSulcus;
  uniform vec3 uLime;
  varying float vA;
  varying float vW;
  void main() {
    vec3 col = mix(uSulcus, uLime, clamp(vW * 1.6, 0.0, 1.0));
    float a = vA * (0.22 + vW * 0.9);
    if (a < 0.004) discard;
    gl_FragColor = vec4(col, a);
  }
`

/* Glyphs: letters and digits that spiral in from around the brain and sink into the surface. */
const GLYPH_VERT = /* glsl */ `
  attribute float aAng;
  attribute float aRad;
  attribute float aPh;
  attribute float aGlyph;
  attribute float aRnd;
  uniform float uTime;
  uniform float uIntro;
  uniform float uG;
  uniform float uB;
  uniform float uStream;
  uniform float uDpr;
  varying vec2 vCell;
  varying float vA;
  void main() {
    float p = fract(uTime * 0.11 + aPh);
    float pe = p * p * (3.0 - 2.0 * p);
    float a = aAng + (1.0 - p) * 1.3;
    float rad = 1.55 + aRad * 1.3;
    vec3 start = vec3(cos(a) * rad, sin(a) * rad * 0.8, (aRnd - 0.5) * 0.9);
    vec3 pos = mix(start, position * 1.02, pe) * (1.0 - uG);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vA = sin(3.1416 * p) * uStream * uIntro * (1.0 - uB) * (1.0 - uG);
    vCell = vec2(mod(aGlyph, 6.0), floor(aGlyph / 6.0));
    gl_PointSize = (9.0 + 6.0 * aRnd) * uDpr * (${CAM_Z.toFixed(2)} / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const GLYPH_FRAG = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec3 uGyrus;
  uniform vec3 uLime;
  varying vec2 vCell;
  varying float vA;
  void main() {
    vec2 uv = (gl_PointCoord + vCell) / 6.0;
    float g = texture2D(uAtlas, uv).a;
    float a = vA * 0.55 * g;
    if (a < 0.004) discard;
    gl_FragColor = vec4(mix(uGyrus, uLime, 0.45), a);
  }
`

/* Stars and dust live in screen space on the z = 0 plane. */
const STAR_VERT = /* glsl */ `
  attribute float aRnd;
  attribute float aU;
  attribute float aV;
  attribute float aD;
  attribute float aDel;
  attribute float aPh;
  attribute float aSp;
  attribute float aSz;
  attribute float aTx;
  attribute float aTy;
  attribute float aStay;
  attribute float aKind;
  uniform mat4 uBrain;
  uniform float uB;
  uniform float uF;
  uniform float uTime;
  uniform float uScroll;
  uniform vec3 uView;   // W, H, world units per px
  uniform vec3 uStar;   // world x, y, radius
  uniform float uMix;
  uniform float uIntro;
  uniform float uDpr;
  varying float vA;
  varying float vWarm;

  vec3 toWorld(float px, float py) {
    return vec3((px - uView.x * 0.5) * uView.z, -(py - uView.y * 0.5) * uView.z, 0.0);
  }

  void main() {
    float W = uView.x, H = uView.y, span = H * 1.4;
    vec3 pos;
    float a, size, warm = 0.0;
    if (aKind > 0.5) {
      float sy = mod(aV * span - uScroll * aD * 0.18 - uTime * aD * 2.0, span) - H * 0.2;
      pos = toWorld(aU * W, sy);
      float tw = 0.6 + 0.4 * sin(uTime * (0.4 + aD) + aPh);
      a = (0.1 + 0.24 * uMix) * aD * tw * uIntro;
      size = 0.7 + aD * 1.1;
    } else {
      float ex = 0.025 + uB * (2.2 + 4.2 * aRnd);
      vec3 bp = (uBrain * vec4(position * ex, 1.0)).xyz;
      float bb = clamp(uB * 1.25 - aDel * 0.25, 0.0, 1.0);
      float be = 1.0 - (1.0 - bb) * (1.0 - bb) * (1.0 - bb);
      float sy = mod(aV * span - uScroll * aD * 0.22 - uTime * aD * 3.0, span) - H * 0.2;
      vec3 drift = toWorld(aU * W, sy);
      pos = mix(bp, drift, be);
      float fade = (1.0 - uB) * (1.0 - uB);
      float starA = 0.42 + 0.48 * uMix;
      float tw = 0.6 + 0.4 * sin(uTime * aSp + aPh);
      a = mix(fade, starA * tw * (0.4 + aD * 0.6), be);
      size = mix(2.0, aSz * (0.5 + aD * 0.9), be);
      if (uF > 0.0 && aStay < 0.5) {
        float fk = clamp(uF * 1.4 - aDel * 0.4, 0.0, 1.0);
        float ff = fk * fk * (3.0 - 2.0 * fk);
        pos = mix(pos, vec3(uStar.xy + vec2(aTx, aTy) * uStar.z, 0.0), ff);
        a = mix(a, 0.95, ff);
        warm = ff;
      }
      if (uB <= 0.0) a = 0.0;
    }
    vA = a;
    vWarm = warm;
    gl_PointSize = size * 2.2 * uDpr;
    gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
  }
`

const STAR_FRAG = /* glsl */ `
  uniform vec3 uPaper;
  uniform vec3 uLime;
  varying float vA;
  varying float vWarm;
  void main() {
    float m = smoothstep(0.5, 0.1, length(gl_PointCoord - 0.5));
    float a = vA * m;
    if (a < 0.004) discard;
    gl_FragColor = vec4(mix(uPaper, uLime, vWarm), a);
  }
`

/* A quad with a soft glow, two thin streaks and a small four-point star: the nova and the closing star. */
const FLARE_VERT = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = (uv - 0.5) * 4.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FLARE_FRAG = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uEmber;
  uniform float uA;       // core, streaks and star
  uniform float uGlow;    // wide soft glow only
  uniform float uStreaks;
  varying vec2 vP;
  void main() {
    float r = length(vP);
    float core = 0.95 * exp(-r * r * 60.0);
    float halo = 0.5 * exp(-r * 3.2);
    float glow = exp(-r * 1.6) * (1.0 - smoothstep(1.2, 2.0, r));
    float sh = exp(-abs(vP.y) * 70.0) * (1.0 - smoothstep(0.0, 1.7, abs(vP.x)));
    float sv = exp(-abs(vP.x) * 50.0) * (1.0 - smoothstep(0.0, 1.0, abs(vP.y)));
    float L = 0.3;
    float st = 1.0 - smoothstep(pow(L, 0.6667) * 0.92, pow(L, 0.6667), pow(abs(vP.x), 0.6667) + pow(abs(vP.y), 0.6667));
    float a = uA * clamp(core + halo + (sh + sv) * 0.8 * uStreaks + st, 0.0, 1.0) + uGlow * glow * 0.5;
    if (a < 0.003) discard;
    vec3 col = mix(uEmber, uCore, clamp(core + st + 0.4 * (sh + sv), 0.0, 1.0));
    gl_FragColor = vec4(col, a);
  }
`

/* The soft nebula behind the brain, and the shock ring of the burst. */
const DISC_VERT = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = (uv - 0.5) * 2.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const NEBULA_FRAG = /* glsl */ `
  uniform vec3 uCol;
  uniform float uA;
  varying vec2 vP;
  void main() {
    float r = length(vP);
    float k = r < 0.35 ? mix(1.0, 0.55, r / 0.35) : r < 0.7 ? mix(0.55, 0.14, (r - 0.35) / 0.35) : mix(0.14, 0.0, clamp((r - 0.7) / 0.3, 0.0, 1.0));
    // a little noise so the gradient does not band on dark ground
    float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 128.0;
    float a = uA * k + dither;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uCol, a);
  }
`

const RING_FRAG = /* glsl */ `
  uniform vec3 uCol;
  uniform float uA;
  varying vec2 vP;
  void main() {
    float r = length(vP);
    float k = smoothstep(0.82, 0.91, r) * (1.0 - smoothstep(0.91, 1.0, r));
    float a = uA * k;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uCol, a);
  }
`

/* ───────────────────────── scene ───────────────────────── */

type Wave = { c: THREE.Vector3; r: number; rmax: number; w: number; sp: number }
const clamp01 = (k: number) => (k < 0 ? 0 : k > 1 ? 1 : k)
const ease = (k: number) => {
  k = clamp01(k)
  return k * k * (3 - 2 * k)
}
const lerp = (a: number, b: number, k: number) => a + (b - a) * k

const ANG0 = 0.7
const TILT0 = 0.24

function anchor(k: string) {
  return document.querySelector<HTMLElement>(`[data-anchor="${k}"]`)?.getBoundingClientRect() ?? null
}

function BrainScene({ data }: { data: BrainData }) {
  const group = useRef<THREE.Group>(null)
  const cloud = useRef<THREE.Points>(null)
  const nebula = useRef<THREE.Mesh>(null)
  const ring = useRef<THREE.Mesh>(null)
  const flare = useRef<THREE.Mesh>(null)
  const closing = useRef<THREE.Mesh>(null)
  const { gl, camera, size } = useThree()
  const reduced = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  /* geometry */
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(data.pos, 3))
    g.setAttribute("normal", new THREE.BufferAttribute(data.nrm, 3))
    g.setAttribute("aSulc", new THREE.BufferAttribute(data.sulc, 1))
    g.setAttribute("aRnd", new THREE.BufferAttribute(data.rnd, 1))
    g.setAttribute("aStar", new THREE.BufferAttribute(data.star, 1))
    g.computeBoundingSphere()
    return g
  }, [data])

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    for (const k of ["position", "normal", "aSulc", "aRnd", "aStar"]) g.setAttribute(k, geo.getAttribute(k))
    g.setIndex(new THREE.BufferAttribute(data.edges, 1))
    g.boundingSphere = geo.boundingSphere
    return g
  }, [geo, data])

  const glyphGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(NG * 3)
    const ang = new Float32Array(NG)
    const rad = new Float32Array(NG)
    const ph = new Float32Array(NG)
    const gly = new Float32Array(NG)
    const rnd = new Float32Array(NG)
    for (let j = 0; j < NG; j++) {
      const i = data.gyri[Math.floor(Math.random() * data.gyri.length)]
      pos[j * 3] = data.pos[i * 3]
      pos[j * 3 + 1] = data.pos[i * 3 + 1]
      pos[j * 3 + 2] = data.pos[i * 3 + 2]
      ang[j] = Math.random() * Math.PI * 2
      rad[j] = Math.random()
      ph[j] = Math.random()
      gly[j] = Math.floor(Math.random() * 36)
      rnd[j] = Math.random()
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    g.setAttribute("aAng", new THREE.BufferAttribute(ang, 1))
    g.setAttribute("aRad", new THREE.BufferAttribute(rad, 1))
    g.setAttribute("aPh", new THREE.BufferAttribute(ph, 1))
    g.setAttribute("aGlyph", new THREE.BufferAttribute(gly, 1))
    g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4)
    return g
  }, [data])

  const starGeo = useMemo(() => {
    const N = NS + ND
    const g = new THREE.BufferGeometry()
    const f = () => new Float32Array(N)
    const pos = new Float32Array(N * 3)
    const rnd = f(), uu = f(), vv = f(), d = f(), del = f(), ph = f(), sp = f(), sz = f(), tx = f(), ty = f(), stay = f(), kind = f()
    for (let k = 0; k < N; k++) {
      const isDust = k >= NS
      if (!isDust) {
        const i = data.stars[k]
        pos[k * 3] = data.pos[i * 3]
        pos[k * 3 + 1] = data.pos[i * 3 + 1]
        pos[k * 3 + 2] = data.pos[i * 3 + 2]
        rnd[k] = data.rnd[i]
      }
      uu[k] = Math.random()
      vv[k] = Math.random()
      d[k] = isDust ? 0.2 + Math.random() * 0.8 : 0.25 + Math.random() * 0.75
      del[k] = Math.random()
      ph[k] = Math.random() * Math.PI * 2
      sp[k] = 0.4 + Math.random() * 1.3
      sz[k] = 0.7 + Math.random() * Math.random() * 1.6
      const a = Math.random() * Math.PI * 2
      const rr = Math.random() < 0.45 ? 1 : Math.sqrt(Math.random())
      const ca = Math.cos(a), sa = Math.sin(a)
      tx[k] = rr * ca * ca * ca
      ty[k] = rr * sa * sa * sa * 1.22
      stay[k] = Math.random() < 0.3 ? 1 : 0
      kind[k] = isDust ? 1 : 0
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    const attrs: Record<string, Float32Array> = { aRnd: rnd, aU: uu, aV: vv, aD: d, aDel: del, aPh: ph, aSp: sp, aSz: sz, aTx: tx, aTy: ty, aStay: stay, aKind: kind }
    for (const k in attrs) g.setAttribute(k, new THREE.BufferAttribute(attrs[k], 1))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50)
    return g
  }, [data])

  /* uniforms and materials */
  const atlas = useMemo(() => makeAtlas(), [])
  const u = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntro: { value: reduced ? 1 : 0 },
      uG: { value: 0 },
      uB: { value: 0 },
      uDpr: { value: gl.getPixelRatio() },
      uSize: { value: 2.05 },
      uAlpha: { value: 1.35 },
      uMix: { value: 1 },
      uStream: { value: 0.4 },
      uWaveA: { value: Array.from({ length: MAX_WAVES }, () => new THREE.Vector4()) },
      uWaveB: { value: Array.from({ length: MAX_WAVES }, () => new THREE.Vector2(0, 1)) },
      uGyrus: { value: new THREE.Color(PAL.dark.gyrus) },
      uSulcus: { value: new THREE.Color(PAL.dark.sulcus) },
      uLime: { value: new THREE.Color(PAL.dark.lime) },
      uPaper: { value: new THREE.Color(PAL.dark.paper) },
      uAtlas: { value: atlas },
    }),
    [gl, reduced, atlas],
  )
  const su = useMemo(
    () => ({
      uBrain: { value: new THREE.Matrix4() },
      uB: u.uB,
      uF: { value: 0 },
      uTime: u.uTime,
      uScroll: { value: 0 },
      uView: { value: new THREE.Vector3(1, 1, 1) },
      uStar: { value: new THREE.Vector3() },
      uMix: u.uMix,
      uIntro: u.uIntro,
      uDpr: u.uDpr,
      uPaper: u.uPaper,
      uLime: u.uLime,
    }),
    [u],
  )
  const fu = useMemo(() => ({ uCore: { value: new THREE.Color(PAL.dark.core) }, uEmber: { value: new THREE.Color(PAL.dark.lime) }, uA: { value: 0 }, uGlow: { value: 0 }, uStreaks: { value: 1 } }), [])
  const cu = useMemo(() => ({ uCore: fu.uCore, uEmber: fu.uEmber, uA: { value: 0 }, uGlow: { value: 0 }, uStreaks: { value: 1 } }), [fu])
  const nu = useMemo(() => ({ uCol: { value: new THREE.Color(PAL.dark.nebula) }, uA: { value: 0 } }), [])
  const ru = useMemo(() => ({ uCol: fu.uEmber, uA: { value: 0 } }), [fu])

  const mats = useMemo(() => {
    const add = { transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending }
    return {
      point: new THREE.ShaderMaterial({ uniforms: u, vertexShader: POINT_VERT, fragmentShader: POINT_FRAG, ...add }),
      mask: new THREE.ShaderMaterial({ uniforms: u, vertexShader: MASK_VERT, fragmentShader: MASK_FRAG, depthWrite: true, depthTest: true, colorWrite: false }),
      line: new THREE.ShaderMaterial({ uniforms: u, vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, ...add }),
      glyph: new THREE.ShaderMaterial({ uniforms: u, vertexShader: GLYPH_VERT, fragmentShader: GLYPH_FRAG, ...add }),
      star: new THREE.ShaderMaterial({ uniforms: su, vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, ...add, depthTest: false }),
      flare: new THREE.ShaderMaterial({ uniforms: fu, vertexShader: FLARE_VERT, fragmentShader: FLARE_FRAG, ...add, depthTest: false }),
      closing: new THREE.ShaderMaterial({ uniforms: cu, vertexShader: FLARE_VERT, fragmentShader: FLARE_FRAG, ...add, depthTest: false }),
      nebula: new THREE.ShaderMaterial({ uniforms: nu, vertexShader: DISC_VERT, fragmentShader: NEBULA_FRAG, transparent: true, depthWrite: false, depthTest: false }),
      ring: new THREE.ShaderMaterial({ uniforms: ru, vertexShader: DISC_VERT, fragmentShader: RING_FRAG, ...add, depthTest: false }),
    }
  }, [u, su, fu, cu, nu, ru])

  useEffect(
    () => () => {
      geo.dispose()
      lineGeo.dispose()
      glyphGeo.dispose()
      starGeo.dispose()
      atlas.dispose()
      Object.values(mats).forEach((m) => m.dispose())
    },
    [geo, lineGeo, glyphGeo, starGeo, atlas, mats],
  )

  /* pointer: the brain leans toward it, and a touch on the surface sends a ripple */
  const target = useRef({ x: 0, y: 0 })
  const pointer = useRef({ x: 0, y: 0 })
  const touch = useRef({ ndc: new THREE.Vector2(), moved: false, last: -1 })
  useEffect(() => {
    const on = (e: PointerEvent) => {
      target.current.x = e.clientX / window.innerWidth - 0.5
      target.current.y = e.clientY / window.innerHeight - 0.5
      const r = gl.domElement.getBoundingClientRect()
      touch.current.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      touch.current.moved = true
    }
    window.addEventListener("pointermove", on, { passive: true })
    return () => window.removeEventListener("pointermove", on)
  }, [gl])

  const waves = useRef<Wave[]>([])
  const nextWave = useRef(1.2)
  const t0 = useRef<number | null>(null)
  const last = useRef(0)
  const arrived = useRef(false)
  const ray = useMemo(() => {
    const r = new THREE.Raycaster()
    r.params.Points = { threshold: 0.06 }
    return r
  }, [])

  const addWave = (i: number, rmax: number, sp: number, w: number) => {
    const ws = waves.current
    if (ws.length >= MAX_WAVES) ws.shift()
    ws.push({ c: new THREE.Vector3(data.pos[i * 3], data.pos[i * 3 + 1], data.pos[i * 3 + 2]), r: 0, rmax, w, sp })
  }

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const now = state.clock.elapsedTime
    // the entrance waits for the preloader to leave
    if (t0.current === null) {
      if (!document.documentElement.dataset.ready) return
      t0.current = now
    }
    const t = reduced ? 0 : now - t0.current
    const dt = Math.min(0.1, Math.max(0, t - last.current))
    last.current = t
    const W = size.width, H = size.height, wpp = VIEW_H / H
    const toX = (px: number) => (px - W / 2) * wpp
    const toY = (py: number) => -(py - H / 2) * wpp
    const m = 1
    u.uMix.value = m

    /* where the page wants the brain: the hero's box while the hero is pinned, then the pin
       line as it travels through the chapters; at the third it gathers, flashes and bursts */
    const scrolled = Math.max(0, window.scrollY)
    const hr = document.querySelector<HTMLElement>(".hero")?.getBoundingClientRect()
    const hp = hr && hr.height > H ? clamp01(-hr.top / (hr.height - H)) : 0
    const ax: number[] = [], ay: number[] = [], aR: number[] = []
    for (let i = 0; i < 4; i++) {
      const r = anchor(String(i)) ?? { left: W / 2, top: H * (i + 2), width: W / 2, height: H * 0.6 }
      ax[i] = r.left + r.width / 2
      ay[i] = r.top + r.height / 2
      // in the hero the brain keeps clear air around it; in the chapters it fills its stage
      aR[i] = i === 0 ? Math.min(r.width * 0.36, r.height * 0.36, W * 0.26) : Math.min(r.width * 0.42, r.height * 0.52, W * 0.42)
    }
    const A = [ANG0 + hp * 1.1, -1.25, 1.0, 0.0]
    const T = [TILT0 + hp * 0.1, 0.14, 0.3, 0.62]
    const pin = H * 0.48
    // the brain stays with its hero box until that box has scrolled up to the pin line
    const y0 = Math.max(ay[0], pin)
    let i0 = 0, k = 0
    const d1 = ay[1] - pin, d2 = ay[2] - pin, d3 = ay[3] - pin
    if (d1 > 0) {
      i0 = 0
      k = ay[0] < pin ? ease(((pin - ay[0]) / Math.max(1, ay[1] - ay[0]) - 0.12) / 0.7) : 0
    } else if (d2 > 0) {
      i0 = 1
      k = ease((-d1 / (d2 - d1) - 0.15) / 0.7)
    } else if (d3 > 0) {
      i0 = 2
      k = ease((-d2 / (d3 - d2) - 0.15) / 0.7)
    } else {
      i0 = 3
      k = 0
    }
    const i1 = Math.min(3, i0 + 1)
    // tell the page when the brain has settled into chapter one, so its report tags can show
    const atOne = (i0 === 0 && k >= 0.999) || (i0 === 1 && k <= 0.001)
    if (atOne !== arrived.current) {
      arrived.current = atOne
      document.querySelector('[data-anchor="1"]')?.classList.toggle("is-here", atOne)
    }
    const cx = lerp(ax[i0], ax[i1], k)
    const R = lerp(aR[i0], aR[i1], k)
    // through chapters one and two the brain rides the pin line; for the third it belongs to
    // the stage box under the heading, so it never sits on the text
    const cy = i0 === 0 ? lerp(y0, pin, k) : i0 === 1 ? pin : i0 === 2 ? lerp(pin, ay[3], k) : ay[3]
    let ang = lerp(A[i0], A[i1], k)
    let tilt = lerp(T[i0], T[i1], k)
    const e1 = clamp01(1 - Math.abs(d1) / (H * 0.6))
    const e2 = clamp01(1 - Math.abs(d2) / (H * 0.6))
    let gth = 0, fl = 0, b = 0
    const uu = -d3 / H
    if (d2 <= 0) {
      // gather once the stage is well inside the viewport, flash as its centre meets the pin
      gth = ease((uu + 0.36) / 0.3) * ease(-d2 / (H * 0.25))
      fl = Math.max(0, 1 - Math.abs(uu - 0.01) / 0.2)
      b = ease((uu - 0.03) / 0.65)
    }
    let f = 0
    const sr = anchor("star")
    let scx = W / 2, scy = H * 2, sR = 90
    if (sr) {
      scx = sr.left + sr.width / 2
      scy = sr.top + sr.height / 2
      sR = Math.min(sr.width, sr.height) * 0.42
      f = ease((H * 1.05 - scy) / (H * 0.6))
    }
    const intro = reduced ? 1 : ease(t / 2.6)
    const sway = reduced ? 0 : Math.sin(t * 0.22) * 0.3
    const px = pointer.current
    px.x += (target.current.x - px.x) * 0.05
    px.y += (target.current.y - px.y) * 0.05
    ang += sway + px.x * 0.6 + gth * gth * 2.6
    tilt += px.y * 0.3

    g.position.set(toX(cx), toY(cy), 0)
    g.scale.setScalar(Math.max(0.001, R * wpp))
    g.rotation.set(tilt, ang, 0)
    g.updateMatrixWorld()

    /* brain uniforms */
    u.uTime.value = t
    u.uIntro.value = intro
    u.uG.value = gth
    u.uB.value = b
    u.uAlpha.value = (W < 720 ? 0.8 : 1) * 1.35
    u.uStream.value = (0.4 + 0.6 * e1) * (1 - gth)

    /* pulses across the cortex; more of them, and further, as the reports are read as one */
    if (!reduced && intro > 0.8) {
      const ws = waves.current
      for (let k = ws.length - 1; k >= 0; k--) {
        ws[k].r += ws[k].sp * dt
        if (ws[k].r >= ws[k].rmax) ws.splice(k, 1)
      }
      nextWave.current -= dt
      if (nextWave.current <= 0 && gth < 0.4 && b <= 0) {
        const far = e2 > 0.3
        addWave(data.gyri[Math.floor(Math.random() * data.gyri.length)], far ? 1.7 : 0.75, far ? 0.75 : 0.5, far ? 0.11 : 0.085)
        nextWave.current = lerp(1.9, 0.45, e2) * (0.7 + Math.random() * 0.6)
      }
      const tc = touch.current
      if (tc.moved && intro >= 1 && t - tc.last > 0.3 && b <= 0 && gth < 0.3 && cloud.current) {
        tc.moved = false
        ray.setFromCamera(tc.ndc, camera)
        const hit = ray.intersectObject(cloud.current, false)[0]
        if (hit && hit.index !== undefined) {
          addWave(hit.index, 0.55, 0.7, 0.08)
          tc.last = t
        }
      }
      for (let k = 0; k < MAX_WAVES; k++) {
        const w = ws[k]
        if (w) {
          u.uWaveA.value[k].set(w.c.x, w.c.y, w.c.z, w.r)
          u.uWaveB.value[k].set(w.rmax, w.w)
        } else u.uWaveB.value[k].set(0, 1)
      }
    }

    /* stars, dust and the closing star */
    su.uBrain.value.copy(g.matrixWorld)
    su.uF.value = f
    su.uScroll.value = scrolled
    su.uView.value.set(W, H, wpp)
    su.uStar.value.set(toX(scx), toY(scy), sR * wpp)

    /* nebula behind the brain */
    if (nebula.current) {
      const nb = (1 - b) * intro
      nebula.current.position.set(toX(cx), toY(cy), -0.01)
      nebula.current.scale.setScalar(R * 2.1 * wpp)
      nu.uA.value = nb * lerp(0.85, 0.3, m)
      nebula.current.visible = nb > 0.01
    }

    /* the nova flash and its shock ring */
    if (flare.current) {
      const L = R * (0.5 + fl * 1.1) * (reduced ? 1 : 0.94 + 0.06 * Math.sin(t * 5)) * wpp
      flare.current.position.set(toX(cx), toY(cy), 0.01)
      flare.current.scale.setScalar(L)
      fu.uA.value = fl
      fu.uGlow.value = 0
      flare.current.visible = fl > 0.01
    }
    if (ring.current) {
      const on = b > 0.01 && b < 0.99
      ring.current.visible = on
      if (on) {
        ring.current.position.set(toX(cx), toY(cy), 0.01)
        ring.current.scale.setScalar(Math.max(W, H) * 0.8 * b * wpp)
        ru.uA.value = 0.4 * (1 - b) * (1 - b) * 0.7
      }
    }
    if (closing.current) {
      const k = clamp01((f - 0.55) / 0.45)
      const pulse = reduced ? 1 : 0.95 + 0.05 * Math.sin(t * 2.2)
      closing.current.position.set(toX(scx), toY(scy), 0.02)
      closing.current.scale.setScalar(sR * 2.6 * wpp * (0.6 + 0.4 * k) * pulse)
      cu.uA.value = 0.85 * k
      cu.uStreaks.value = k
      cu.uGlow.value = 0.42 * f
      closing.current.visible = f > 0.01 && b > 0
    }
  })

  return (
    <>
      <mesh ref={nebula} renderOrder={-2} frustumCulled={false} material={mats.nebula}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <group ref={group} rotation={[TILT0, ANG0, 0]}>
        <points geometry={geo} material={mats.mask} renderOrder={0} frustumCulled={false} />
        <lineSegments geometry={lineGeo} material={mats.line} renderOrder={1} frustumCulled={false} />
        <points ref={cloud} geometry={geo} material={mats.point} renderOrder={2} frustumCulled={false} />
        <points geometry={glyphGeo} material={mats.glyph} renderOrder={3} frustumCulled={false} />
      </group>
      <points geometry={starGeo} material={mats.star} renderOrder={4} frustumCulled={false} />
      <mesh ref={ring} renderOrder={5} frustumCulled={false} material={mats.ring}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <mesh ref={flare} renderOrder={6} frustumCulled={false} material={mats.flare}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh ref={closing} renderOrder={6} frustumCulled={false} material={mats.closing}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </>
  )
}

function Scene() {
  const data = useBrain()
  if (!data) return null
  return <BrainScene data={data} />
}

export function SkyCanvas() {
  return (
    <div className="sky" aria-hidden="true">
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, CAM_Z], fov: FOV }} gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}>
        <Scene />
      </Canvas>
    </div>
  )
}
