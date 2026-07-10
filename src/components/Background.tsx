import { Stars } from '@react-three/drei'

// Road-specific palette based on brief
const PALETTE = {
  bg: '#0a0e17',          // deep navy night sky
  road: '#00bcd4',        // cyan-teal road surface
  roadGlow: '#4dd0e1',    // bright cyan for road edge glow
  terrain: '#0f1b2d',     // dark terrain, subtle blue
  car: '#ff6b35',         // warm amber headlights (single accent)
  carGlow: '#ffab00',     // headlight glow
  text: 'rgba(255,255,255,0.6)',
  accent: '#4dd0e1',      // hero number cyan
}

interface BackgroundProps {
  reducedMotion?: boolean
}

export default function Background({ reducedMotion = false }: BackgroundProps) {
  return (
    <>
      <color attach="background" args={[PALETTE.bg]} />
      <fog attach="fog" args={[PALETTE.bg, 15, 35]} />
      <ambientLight intensity={0.08} />
      <directionalLight position={[10, 10, 5]} intensity={0.2} color="#4dd0e1" />
      <Stars
        radius={100}
        depth={50}
        count={reducedMotion ? 800 : 2000}
        factor={2}
        saturation={0.1}
        fade
        speed={reducedMotion ? 0 : 0.1}
      />
    </>
  )
}

export { PALETTE }