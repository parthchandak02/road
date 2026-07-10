import { Suspense, useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Background from './components/Background'
import RoadSystem from './components/RoadSystem'
import DataStamp from './components/DataStamp'
import HeroStats from './components/HeroStats'
import QuietZone from './components/QuietZone'
import {
  FALLBACK_RATES,
  fetchRates,
  type ExchangeRate,
  type RateSource,
  normalizeRates,
} from './data/rates'
import './styles.css'

const POLL_MS = 300_000 // 5 minutes for exchange rates

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReduced(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}

export default function App() {
  const [rates, setRates] = useState<ExchangeRate[]>(FALLBACK_RATES)
  const [source, setSource] = useState<RateSource>('fallback')
  const [dayCount, setDayCount] = useState(FALLBACK_RATES.length)
  const [latestRate, setLatestRate] = useState(FALLBACK_RATES[FALLBACK_RATES.length - 1].rate)
  const [loading, setLoading] = useState(true)
  const [minutesAgo, setMinutesAgo] = useState(0)
  const [selectedPoint, setSelectedPoint] = useState<{ date: string; rate: number } | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [showGlow, setShowGlow] = useState(true)
  const reducedMotion = useReducedMotion()

  const loadRates = useCallback(async () => {
    const result = await fetchRates()
    setRates(result.rates)
    setSource(result.source)
    setDayCount(result.dayCount)
    setLatestRate(result.latestRate)
    setMinutesAgo(0)
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadRates()
    const poll = setInterval(() => void loadRates(), POLL_MS)
    return () => clearInterval(poll)
  }, [loadRates])

  useEffect(() => {
    const tick = setInterval(() => {
      setMinutesAgo((m) => m + 1)
    }, 60000) // Update every minute
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setShowGlow(false)
      return
    }
    const t = setTimeout(() => setShowGlow(false), 500)
    return () => clearTimeout(t)
  }, [reducedMotion])

  const handleRoadTap = useCallback((t: number) => {
    const index = Math.round(t * (rates.length - 1))
    const point = rates[index]
    if (point) {
      setSelectedPoint(point)
      setDetailVisible(true)
    }
  }, [rates])

  const handleBackgroundTap = useCallback(() => {
    setSelectedPoint(null)
    setDetailVisible(false)
  }, [])

  const handleHideDetail = useCallback(() => {
    setDetailVisible(false)
  }, [])

  const { normalize } = normalizeRates(rates)

  return (
    <>
      <Canvas
        className="road-canvas"
        camera={{ position: [0, 8, 12], fov: 55, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        }}
        frameloop={reducedMotion ? 'demand' : 'always'}
        onPointerMissed={handleBackgroundTap}
      >
        <Suspense fallback={null}>
          <Background reducedMotion={reducedMotion} />
          <RoadSystem
            rates={rates}
            normalize={normalize}
            reducedMotion={reducedMotion}
            onRoadTap={handleRoadTap}
          />
          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={8}
            maxDistance={25}
            autoRotate={!reducedMotion}
            autoRotateSpeed={0.15}
          />
        </Suspense>
      </Canvas>

      {showGlow && <div className="first-visit-glow" aria-hidden />}

      <HeroStats rate={latestRate} />
      <DataStamp source={source} minutesAgo={minutesAgo} loading={loading} dayCount={dayCount} />

      <div id="desc">
        Drive along 30 days of EUR/USD rates - road climbs and falls with the exchange rate
      </div>

      <div id="legend">
        higher = stronger EUR · tap to see rate
      </div>

      <QuietZone
        visible={detailVisible}
        point={selectedPoint}
        onHide={handleHideDetail}
      />
    </>
  )
}
