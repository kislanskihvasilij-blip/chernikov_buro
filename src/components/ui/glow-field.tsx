import * as React from "react"

import { fitRect } from "@/lib/fit-rect"
import { cn, prefersReducedMotion } from "@/lib/utils"

/** Bar of the lamp inside its image, in 0–1 image coordinates (LED strip sits on its underside). */
export interface LampBar {
  x0: number
  x1: number
  y0: number
  y1: number
}

interface GlowFieldProps {
  rootRef: React.RefObject<HTMLElement | null>
  lamp?: { slotRef: React.RefObject<HTMLElement | null>; aspect: number; bar: LampBar }
  lampOn?: boolean
  /** strength of the copper light leaks along the edges */
  leak?: number
  className?: string
}

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uScale;
uniform float uTime;
uniform float uLamp;
uniform vec4 uBar;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform float uLeak;

float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return v; }

// motes of sawdust drifting through the beam
float dust(vec2 p, float t){
  float acc = 0.0;
  for(int L=0; L<3; L++){
    float fl = float(L);
    float sc = 22.0 + fl*16.0;
    vec2 gp = p/sc + vec2(t*(0.04+fl*0.02), -t*(0.06+fl*0.03));
    vec2 id = floor(gp);
    vec2 f = fract(gp) - 0.5;
    float h = hash(id + fl*17.3);
    vec2 jitter = vec2(hash(id+3.1), hash(id+7.7)) - 0.5;
    float d = length(f - jitter*0.7);
    float tw = 0.55 + 0.45*sin(t*(1.2+h*2.0) + h*40.0);
    acc += step(0.86, h) * smoothstep(0.075, 0.0, d) * tw;
  }
  return acc;
}

void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y*uScale - gl_FragCoord.y)/uScale;
  vec2 uv = px/uRes;
  float t = uTime;
  float aspect = uRes.x/uRes.y;
  vec3 amber = vec3(1.0, 0.60, 0.28);
  vec3 col = vec3(0.062, 0.047, 0.038);

  // light leaks: streaky warm noise, strongest toward the edges
  vec2 q = vec2(uv.x*aspect*0.9 + uv.y*0.25, uv.y*0.35);
  float n1 = fbm(q*vec2(2.2, 1.0) + vec2(t*0.035, -t*0.02));
  float n2 = fbm(q*vec2(4.5, 1.2) + vec2(-t*0.05, t*0.015) + n1*1.6);
  float streak = smoothstep(0.42, 0.95, n2);
  float side = pow(abs(uv.x - 0.5)*2.0, 1.6);
  float leak = streak * (0.22 + side) * uLeak;
  col += mix(vec3(0.70, 0.30, 0.11), amber, n1) * leak * 0.8;

  if (uLamp > 0.001) {
    float x0 = uBar.x; float x1 = uBar.z; float yb = uBar.y; float th = max(uBar.w, 2.0);
    float cx = (x0+x1)*0.5; float hw = (x1-x0)*0.5;
    float dx = max(abs(px.x - cx) - hw, 0.0);
    float dy = px.y - yb;
    float down = max(dy, 0.0);
    // hot line on the diffuser, a bloom under the bar and a widening beam
    float hot = exp(-(dx*dx*0.6 + down*down*3.0)/(th*th)) * step(-th*0.5, dy);
    float bloom = exp(-(dx*dx + dy*dy)/(hw*hw*0.16));
    float spread = hw + down*0.6;
    float beam = (1.0 - smoothstep(spread*0.5, spread*1.05, abs(px.x-cx))) * exp(-down/(uRes.y*0.6)) * step(0.0, dy);
    float above = exp(-(dx*dx)/(hw*hw*0.04)) * exp(-max(-dy,0.0)/(th*4.0)) * 0.18;
    col += vec3(1.0, 0.72, 0.42) * (beam*0.2 + bloom*0.26 + above) * uLamp;
    col += vec3(1.0, 0.88, 0.70) * hot * 0.95 * uLamp;
    col += vec3(1.0, 0.82, 0.58) * dust(px, t) * beam * 0.9 * uLamp;
  }

  vec2 dm = px - uMouse;
  col += amber * 0.07 * uMouseOn * exp(-dot(dm,dm)/(260.0*260.0));

  vec2 vv = (uv - 0.5)*vec2(0.9, 1.1);
  col *= 1.0 - dot(vv, vv)*0.9;
  col = col / (1.0 + col*0.35);
  gl_FragColor = vec4(col, 1.0);
}
`

/** A lamp coming on: a short stutter, then a smooth ramp to full. */
const SWITCH_ON: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [90, 0.5],
  [160, 0.1],
  [280, 0.72],
  [360, 0.3],
  [560, 0.86],
  [1500, 1],
]

function switchOnLevel(ms: number): number {
  if (ms <= 0) return 0
  for (let i = 1; i < SWITCH_ON.length; i++) {
    const [t1, v1] = SWITCH_ON[i]
    const [t0, v0] = SWITCH_ON[i - 1]
    if (ms <= t1) return v0 + (v1 - v0) * ((ms - t0) / (t1 - t0))
  }
  return 1
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)
    if (!s) throw new Error("shader")
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "compile")
    return s
  }
  const p = gl.createProgram()
  if (!p) throw new Error("program")
  gl.attachShader(p, shader(gl.VERTEX_SHADER, VERT))
  gl.attachShader(p, shader(gl.FRAGMENT_SHADER, FRAG))
  gl.bindAttribLocation(p, 0, "aPos")
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link")
  return p
}

/**
 * Warm light-leak background (after the ciridae.com hero) with an optional lamp whose LED strip,
 * beam and dust motes switch on once the hero sculpture has assembled.
 */
export function GlowField({ rootRef, lamp, lampOn = false, leak = 1, className }: GlowFieldProps) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const [failed, setFailed] = React.useState(false)
  const lampStart = React.useRef<number | null>(null)
  const lampRef = React.useRef(lamp)
  React.useEffect(() => {
    lampRef.current = lamp
  })

  React.useEffect(() => {
    lampStart.current = lampOn ? performance.now() : null
  }, [lampOn])

  React.useEffect(() => {
    const root = rootRef.current
    const host = hostRef.current
    if (!root || !host) return
    // a fresh canvas per run: a context released in cleanup can never be reused (StrictMode remounts)
    const canvas = document.createElement("canvas")
    canvas.className = "absolute inset-0 h-full w-full"
    host.appendChild(canvas)
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power" })
    let program: WebGLProgram | null = null
    try {
      if (gl) program = createProgram(gl)
    } catch {
      program = null
    }
    if (!gl || !program) {
      canvas.remove()
      setFailed(true)
      return
    }
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.useProgram(program)
    const u = (name: string) => gl.getUniformLocation(program, name)
    const uRes = u("uRes"), uScale = u("uScale"), uTime = u("uTime"), uLamp = u("uLamp"), uBar = u("uBar")
    const uMouse = u("uMouse"), uMouseOn = u("uMouseOn"), uLeak = u("uLeak")

    const reduced = prefersReducedMotion()
    // the glow is soft and slow: half resolution at 30 fps looks the same and costs half as much
    const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5
    const FRAME_MS = 1000 / 30
    let cssW = 1
    let cssH = 1
    let bar: [number, number, number, number] = [0, 0, 0, 0]
    const resize = () => {
      cssW = Math.max(1, root.clientWidth)
      cssH = Math.max(1, root.clientHeight)
      canvas.width = Math.round(cssW * scale)
      canvas.height = Math.round(cssH * scale)
      const l = lampRef.current
      const slot = l?.slotRef.current
      if (l && slot) {
        const r = fitRect(root, slot, l.aspect)
        bar = [r.x + l.bar.x0 * r.w, r.y + l.bar.y1 * r.h, r.x + l.bar.x1 * r.w, (l.bar.y1 - l.bar.y0) * r.h]
      }
      if (reduced) draw(performance.now())
    }

    const mouse = { x: -9999, y: -9999, on: 0, target: 0 }
    const onMove = (e: PointerEvent) => {
      const b = root.getBoundingClientRect()
      mouse.x = e.clientX - b.left
      mouse.y = e.clientY - b.top
      mouse.target = e.pointerType === "touch" ? 0 : 1
    }
    const onLeave = () => {
      mouse.target = 0
    }
    root.addEventListener("pointermove", onMove, { passive: true })
    root.addEventListener("pointerleave", onLeave, { passive: true })

    const t0 = performance.now()
    function draw(now: number) {
      if (!gl) return
      mouse.on += (mouse.target - mouse.on) * 0.06
      const start = lampStart.current
      const level = start === null ? 0 : reduced ? 1 : switchOnLevel(now - start)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, cssW, cssH)
      gl.uniform1f(uScale, scale)
      gl.uniform1f(uTime, reduced ? 12 : (now - t0) / 1000)
      gl.uniform1f(uLamp, level)
      gl.uniform4f(uBar, bar[0], bar[1], bar[2], bar[3])
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform1f(uMouseOn, mouse.on)
      gl.uniform1f(uLeak, leak)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    let raf = 0
    let visible = true
    let lastDraw = 0
    const loop = (now: number) => {
      if (now - lastDraw >= FRAME_MS - 2) {
        lastDraw = now
        draw(now)
      }
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      cancelAnimationFrame(raf)
      if (reduced) draw(performance.now())
      else if (visible && !document.hidden) raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      start()
    })
    io.observe(root)
    const onVisibility = () => start()
    document.addEventListener("visibilitychange", onVisibility)
    const ro = new ResizeObserver(resize)
    ro.observe(root)
    const slot = lampRef.current?.slotRef.current
    if (slot) ro.observe(slot)
    resize()
    start()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      root.removeEventListener("pointermove", onMove)
      root.removeEventListener("pointerleave", onLeave)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
      canvas.remove()
    }
  }, [rootRef, leak])

  return (
    <div ref={hostRef} aria-hidden="true" className={cn("pointer-events-none", className)}>
      {failed && (
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgb(255_170_100/0.22),transparent_70%),radial-gradient(40%_60%_at_0%_20%,rgb(200_90_40/0.25),transparent_70%),radial-gradient(40%_60%_at_100%_70%,rgb(200_90_40/0.2),transparent_70%)]" />
      )}
    </div>
  )
}
