// ─── VIDEO DISTORTION CARD — SixDX ────────────────────────────────────────────
// WebGL card: paused video frame at rest, wave-distortion reveal + mouse ripple
// on hover. Matches the WorkCard tag / title UI exactly.
//
// Usage:
//   <VideoDistortionCard videoSrc="/video/cosmos.mp4" title="Mill Floor" tag="Steel" />
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, useEffect, type MutableRefObject, type CSSProperties } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import type { ThreeElement } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '../../animations/gsap.config'
import { fonts } from '../../styles/tokens'

// ─── CSS (injected once into <head>) ──────────────────────────────────────────

const STYLE_ID = 'vh-distortion-card-styles'

const CSS = `
  .vh-card-container {
    position: relative;
    overflow: hidden;
    border-radius: 2px;
    cursor: pointer;
    background-color: #111;
    transform: translateZ(0);
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    flex: 1 0 0;
    min-width: 0;
  }
  .vh-card-container:hover { transform: scale(0.98); }

  .vh-canvas-wrapper {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  .vh-ui-overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 12px;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0.35) 0%,
      transparent 35%,
      transparent 60%,
      rgba(0,0,0,0.55) 100%
    );
    opacity: 0.85;
    transition: opacity 0.5s ease;
  }
  .vh-card-container:hover .vh-ui-overlay { opacity: 1; }

  .vh-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  /* tag — matches WorkCard defaults: white pill, black text */
  .vh-tag {
    display: inline-flex;
    align-items: center;
    background: #fff;
    color: #1c0b05;
    padding: 4px 16px;
    border-radius: 1px;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.4;
    white-space: nowrap;
  }

  .vh-status {
    color: rgba(255,255,255,0.75);
    font-size: 11px;
    letter-spacing: 0.08em;
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
  .vh-card-container:hover .vh-status { opacity: 1; transform: translateY(0); }

  .vh-dot {
    width: 6px;
    height: 6px;
    background: #fff;
    border-radius: 50%;
    animation: vh-pulse 1.5s infinite;
  }

  @keyframes vh-pulse {
    0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
    70%  { transform: scale(1);    box-shadow: 0 0 0 6px rgba(255,255,255,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
  }

  /* title — matches WorkCard h4 / HN font */
  .vh-title {
    font-size: 1.416rem;
    font-weight: normal;
    letter-spacing: -0.03em;
    line-height: 1.32;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.4);
    transform: translateY(8px);
    transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
    margin: 0;
  }
  .vh-card-container:hover .vh-title { transform: translateY(0); }
`

function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return
    const tag = document.createElement('style')
    tag.id = STYLE_ID
    tag.textContent = CSS
    document.head.appendChild(tag)
    return () => { document.getElementById(STYLE_ID)?.remove() }
  }, [])
}

// ─── Shader material ──────────────────────────────────────────────────────────

const DistortionMaterial = shaderMaterial(
  {
    u_tex:             null as THREE.Texture | null,
    u_hover:           0,
    u_mouse:           new THREE.Vector2(0.5, 0.5),
    u_time:            0,
    u_planeResolution: new THREE.Vector2(1, 1),
    u_videoResolution: new THREE.Vector2(1, 1),
    u_wave_progress:   0,
  },
  /* ── Vertex shader ───────────────────────────────────────────────────────── */
  `
    varying vec2 vUv;
    uniform float u_hover;
    uniform vec2  u_mouse;
    uniform float u_wave_progress;

    void main() {
      vUv = uv;
      vec3 pos = position;

      float dist  = distance(uv, u_mouse);
      float bulge = smoothstep(0.8, 0.0, dist) * u_hover * 0.15;

      pos.z += bulge;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  /* ── Fragment shader ─────────────────────────────────────────────────────── */
  `
    varying vec2 vUv;
    uniform sampler2D u_tex;
    uniform float     u_hover;
    uniform float     u_time;
    uniform vec2      u_mouse;
    uniform vec2      u_planeResolution;
    uniform vec2      u_videoResolution;
    uniform float     u_wave_progress;

    void main() {
      // object-fit: cover
      vec2 ratio = vec2(
        min((u_planeResolution.x / u_planeResolution.y) /
            (u_videoResolution.x  / u_videoResolution.y), 1.0),
        min((u_planeResolution.y / u_planeResolution.x) /
            (u_videoResolution.y  / u_videoResolution.x), 1.0)
      );
      vec2 baseUv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
      );

      vec2 aspectUv    = baseUv;
      aspectUv.x      *= u_planeResolution.x / u_planeResolution.y;
      vec2 aspectMouse = u_mouse;
      aspectMouse.x   *= u_planeResolution.x / u_planeResolution.y;

      float dist = distance(aspectUv, aspectMouse);

      // calm mouse ripple
      float mouseWave = sin(dist * 8.0 - u_time * 2.0)
                        * 0.007 * u_hover * smoothstep(0.6, 0.0, dist);

      vec2 dir = normalize(aspectUv - aspectMouse);
      vec2 uv2 = baseUv + dir * mouseWave;

      vec4 col = texture2D(u_tex, uv2);
      col.rgb  *= 1.0 + u_hover * 0.1;

      gl_FragColor = col;
    }
  `,
)

extend({ DistortionMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    distortionMaterial: ThreeElement<typeof DistortionMaterial>
  }
}

// ─── Inner WebGL scene ────────────────────────────────────────────────────────

interface SceneProps {
  videoSrc:  string
  isHovered: boolean
  mousePos:  MutableRefObject<{ x: number; y: number }>
}

function WebGLVideoScene({ videoSrc, isHovered, mousePos }: SceneProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matRef         = useRef<any>(null)
  const tlRef          = useRef<gsap.core.Timeline | null>(null)
  const [video,    setVideo]    = useState<HTMLVideoElement | null>(null)
  const [texture,  setTexture]  = useState<THREE.VideoTexture | null>(null)
  const [videoRes, setVideoRes] = useState<[number, number]>([1, 1])
  const { viewport } = useThree()

  // create video element + texture once
  useEffect(() => {
    const vid        = document.createElement('video')
    vid.src          = videoSrc
    vid.crossOrigin  = 'anonymous'
    vid.loop         = true
    vid.muted        = true
    vid.playsInline  = true
    vid.preload      = 'auto'

    const onMeta = () => {
      setVideoRes([vid.videoWidth, vid.videoHeight])
      vid.currentTime = 0.1
    }
    vid.addEventListener('loadedmetadata', onMeta)
    vid.load()

    const tex           = new THREE.VideoTexture(vid)
    tex.minFilter       = THREE.LinearFilter
    tex.magFilter       = THREE.LinearFilter
    tex.generateMipmaps = false

    setVideo(vid)
    setTexture(tex)

    return () => {
      vid.removeEventListener('loadedmetadata', onMeta)
      vid.pause()
      vid.removeAttribute('src')
      vid.load()
      tex.dispose()
    }
  }, [videoSrc])

  // hover → wave + play / un-hover → reverse + pause
  useEffect(() => {
    if (!video || !matRef.current) return

    if (isHovered) {
      tlRef.current?.kill()
      void video.play().catch(() => {})
      gsap.to(matRef.current.uniforms.u_hover, {
        value: 1, duration: 0.8, ease: 'power3.out',
      })
    } else {
      tlRef.current?.kill()
      gsap.to(matRef.current.uniforms.u_hover, {
        value: 0, duration: 0.8, ease: 'power3.inOut',
        onComplete: () => { video.pause(); video.currentTime = 0.1 },
      })
    }
  }, [isHovered, video])

  useFrame(({ clock }) => {
    if (!matRef.current) return
    matRef.current.u_time = clock.elapsedTime
    matRef.current.u_mouse.x = THREE.MathUtils.lerp(
      matRef.current.u_mouse.x, mousePos.current.x, 0.08,
    )
    matRef.current.u_mouse.y = THREE.MathUtils.lerp(
      matRef.current.u_mouse.y, mousePos.current.y, 0.08,
    )
    matRef.current.u_planeResolution.set(viewport.width, viewport.height)
    matRef.current.u_videoResolution.set(videoRes[0], videoRes[1])
  })

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height, 64, 64]} />
      {texture && (
        <distortionMaterial ref={matRef} u_tex={texture} transparent />
      )}
    </mesh>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export interface VideoDistortionCardProps {
  videoSrc:   string
  title?:     string
  tag?:       string
  tagBg?:     string
  tagColor?:  string
  height?:    number
  className?: string
  style?:     CSSProperties
}

export default function VideoDistortionCard({
  videoSrc,
  title     = 'Case Study',
  tag,
  tagBg     = '#ffffff',
  tagColor  = '#1c0b05',
  height    = 508,
  className = '',
  style     = {},
}: VideoDistortionCardProps) {
  useInjectStyles()

  const [isHovered,   setIsHovered]   = useState(false)
  const mousePos    = useRef({ x: 0.5, y: 0.5 })
  const containerRef = useRef<HTMLDivElement>(null)

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const r = containerRef.current.getBoundingClientRect()
    mousePos.current = {
      x:  (e.clientX - r.left) / r.width,
      y: 1 - (e.clientY - r.top)  / r.height,
    }
  }

  return (
    <div
      ref={containerRef}
      className={`vh-card-container ${className}`}
      style={{ height, ...style }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onPointerMove={onPointerMove}
    >
      {/* WebGL canvas */}
      <div className="vh-canvas-wrapper">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        >
          <WebGLVideoScene
            videoSrc={videoSrc}
            isHovered={isHovered}
            mousePos={mousePos}
          />
        </Canvas>
      </div>

      {/* UI overlay — tag + PLAYING indicator + title */}
      <div className="vh-ui-overlay">
        <div className="vh-header">
          {tag && (
            <span
              className="vh-tag"
              style={{
                background: tagBg,
                color:      tagColor,
                fontFamily: fonts.hn,
              }}
            >
              {tag}
            </span>
          )}
          <span className="vh-status" style={{ fontFamily: fonts.hn }}>
            <span className="vh-dot" />
            PLAYING
          </span>
        </div>

        <p className="vh-title" style={{ fontFamily: fonts.hn }}>
          {title}
        </p>
      </div>
    </div>
  )
}
