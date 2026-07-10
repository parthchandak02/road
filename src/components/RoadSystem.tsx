import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { ExchangeRate } from '../data/rates'
import { PALETTE } from './Background'

interface RoadSystemProps {
  rates: ExchangeRate[]
  normalize: (rate: number) => number
  reducedMotion?: boolean
  onRoadTap: (t: number) => void
}

// Create terrain mountains on sides
function TerrainMountains({ normalize, rates }: { normalize: (rate: number) => number; rates: ExchangeRate[] }) {
  const leftMountains = useMemo(() => {
    const points = []
    for (let i = 0; i < rates.length; i++) {
      const t = i / (rates.length - 1)
      const x = (t - 0.5) * 40
      const y = normalize(rates[i].rate) + Math.random() * 2 - 1
      const z = -12 - Math.random() * 8
      points.push([x, y, z] as const)
    }
    return points
  }, [rates, normalize])

  const rightMountains = useMemo(() => {
    const points = []
    for (let i = 0; i < rates.length; i++) {
      const t = i / (rates.length - 1)
      const x = (t - 0.5) * 40
      const y = normalize(rates[i].rate) + Math.random() * 1.5 - 0.5
      const z = 8 + Math.random() * 10
      points.push([x, y, z] as const)
    }
    return points
  }, [rates, normalize])

  return (
    <group>
      {leftMountains.map((point, i) => (
        <mesh key={`left-${i}`} position={point}>
          <boxGeometry args={[2, point[1] + 2, 3]} />
          <meshLambertMaterial color={PALETTE.terrain} />
        </mesh>
      ))}
      {rightMountains.map((point, i) => (
        <mesh key={`right-${i}`} position={point}>
          <boxGeometry args={[2, point[1] + 1.5, 3]} />
          <meshLambertMaterial color={PALETTE.terrain} />
        </mesh>
      ))}
    </group>
  )
}

// Car component with headlights
function Car({ position, rotation, reducedMotion }: { position: THREE.Vector3; rotation: number; reducedMotion: boolean }) {
  return (
  <group position={position} rotation={[0, rotation, 0]}>
    {/* Car body */}
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[1.2, 0.5, 2.4]} />
      <meshLambertMaterial color={PALETTE.car} />
    </mesh>

    {/* Car base */}
    <mesh position={[0, 0.15, 0]}>
      <boxGeometry args={[1.6, 0.25, 3.0]} />
      <meshLambertMaterial color="#ff4500" />
    </mesh>

    {/* Windshield */}
    <mesh position={[0, 0.55, -1.0]}>
      <boxGeometry args={[1.0, 0.3, 0.1]} />
      <meshBasicMaterial color="#4dd0e1" transparent opacity={0.3} />
    </mesh>

    {/* Headlights */}
    <spotLight
      position={[-0.5, 0.3, 1.6]}
      target-position={[-3, -1, 12]}
      intensity={reducedMotion ? 0 : 3}
      color={PALETTE.carGlow}
      angle={Math.PI / 6}
      penumbra={0.4}
      distance={25}
      decay={1.5}
    />
    <spotLight
      position={[0.5, 0.3, 1.6]}
      target-position={[3, -1, 12]}
      intensity={reducedMotion ? 0 : 3}
      color={PALETTE.carGlow}
      angle={Math.PI / 6}
      penumbra={0.4}
      distance={25}
      decay={1.5}
    />

    {/* Headlight glow spheres */}
    <mesh position={[-0.5, 0.25, 1.5]}>
      <sphereGeometry args={[0.15]} />
      <meshBasicMaterial color={PALETTE.carGlow} />
    </mesh>
    <mesh position={[0.5, 0.25, 1.5]}>
      <sphereGeometry args={[0.15]} />
      <meshBasicMaterial color={PALETTE.carGlow} />
    </mesh>
      
    {/* Taillights */}
    <mesh position={[-0.5, 0.2, -1.5]}>
      <sphereGeometry args={[0.1]} />
      <meshBasicMaterial color="#ff1744" />
    </mesh>
    <mesh position={[0.5, 0.2, -1.5]}>
      <sphereGeometry args={[0.1]} />
      <meshBasicMaterial color="#ff1744" />
    </mesh>
  </group>
)
}

export default function RoadSystem({ rates, normalize, reducedMotion = false, onRoadTap }: RoadSystemProps) {
  const roadRef = useRef<THREE.Mesh>(null)
  const carProgressRef = useRef(0)

  // Create the road curve from exchange rate data
  const { curve, roadGeometry } = useMemo(() => {
    const points = rates.map((rate, i) => {
      const t = i / (rates.length - 1)
      const x = (t - 0.5) * 40 // Spread across 40 units
      const y = normalize(rate.rate)
      const z = Math.sin(t * Math.PI * 2) * 2 + Math.cos(t * Math.PI * 3) * 1.5 // Winding pattern
      return new THREE.Vector3(x, y, z)
    })

    const roadCurve = new THREE.CatmullRomCurve3(points)
    roadCurve.tension = 0.5

    const geometry = new THREE.TubeGeometry(roadCurve, rates.length * 2, 0.8, 8, false)

    return { curve: roadCurve, roadGeometry: geometry }
  }, [rates, normalize])

  // Animate car along road using ref (no state update per frame)
  useFrame((_state, delta) => {
    if (!reducedMotion) {
      carProgressRef.current = (carProgressRef.current + delta * 0.15) % 1
    }
  })

  // Get car position and rotation from curve
  const carProgress = reducedMotion ? 1 : carProgressRef.current
  const carPosition = curve.getPointAt(carProgress)
  const carTangent = curve.getTangentAt(carProgress)
  const carRotation = Math.atan2(carTangent.x, carTangent.z)

  const handleRoadClick = (event: any) => {
    event.stopPropagation()
    
    // Convert click position to road parameter t
    const point = event.point
    let closestT = 0
    let closestDistance = Infinity
    
    for (let t = 0; t <= 1; t += 0.01) {
      const roadPoint = curve.getPointAt(t)
      const distance = roadPoint.distanceTo(point)
      if (distance < closestDistance) {
        closestDistance = distance
        closestT = t
      }
    }
    
    onRoadTap(closestT)
  }

  // Date labels every ~5 points
  const dateLabels = useMemo(() => {
    const labels = []
    const step = Math.max(1, Math.floor(rates.length / 5))

    for (let i = 0; i < rates.length; i += step) {
      const t = i / (rates.length - 1)
      const point = curve.getPointAt(t)
      const date = new Date(rates[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      labels.push({ position: point, text: date, key: i })
    }

    return labels
  }, [rates, curve])

  return (
    <group>
      {/* Road */}
      <mesh ref={roadRef} geometry={roadGeometry} onClick={handleRoadClick}>
        <meshLambertMaterial color={PALETTE.road} />
      </mesh>

      {/* Road glow effect */}
      <mesh geometry={roadGeometry}>
        <meshBasicMaterial color={PALETTE.roadGlow} transparent opacity={0.3} />
      </mesh>

      {/* Car */}
      <Car position={carPosition} rotation={carRotation} reducedMotion={reducedMotion} />

      {/* Terrain */}
      <TerrainMountains normalize={normalize} rates={rates} />

      {/* Date labels */}
      {dateLabels.map(({ position, text, key }) => (
        <Text
          key={key}
          position={[position.x, position.y + 2, position.z]}
          fontSize={0.5}
          color="rgba(255,255,255,0.4)"
          anchorX="center"
          anchorY="middle"
        >
          {text}
        </Text>
      ))}
    </group>
  )
}
