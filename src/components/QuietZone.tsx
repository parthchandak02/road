import { useEffect, useRef } from 'react'
import { formatRate } from '../data/rates'

interface QuietZoneProps {
  visible: boolean
  point: { date: string; rate: number } | null
  onHide: () => void
}

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 100,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 20,
  padding: '18px 24px',
  borderRadius: 14,
  background: 'rgba(10, 14, 23, 0.85)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(77, 208, 225, 0.2)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.45)',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: 'rgba(255, 255, 255, 0.85)',
  minWidth: 200,
  maxWidth: 'min(90vw, 300px)',
  transition: 'opacity 0.35s ease',
  pointerEvents: 'none',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 20,
  fontSize: 13,
  marginBottom: 8,
}

const labelStyle: React.CSSProperties = {
  opacity: 0.6,
}

const valueStyle: React.CSSProperties = {
  fontWeight: 600,
  color: '#4dd0e1',
  textAlign: 'right',
}

export default function QuietZone({ visible, point, onHide }: QuietZoneProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (visible && point) {
      timerRef.current = setTimeout(onHide, 3000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [visible, point, onHide])

  if (!point) {
    return (
      <div
        style={{ ...panelStyle, opacity: 0 }}
        aria-hidden
      />
    )
  }

  const displayDate = new Date(point.date).toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })

  return (
    <div
      style={{
        ...panelStyle,
        opacity: visible ? 1 : 0,
      }}
      aria-hidden={!visible}
    >
      <div style={rowStyle}>
        <span style={labelStyle}>Date</span>
        <span style={valueStyle}>{displayDate}</span>
      </div>
      <div style={{ ...rowStyle, marginBottom: 0 }}>
        <span style={labelStyle}>EUR/USD</span>
        <span style={valueStyle}>{formatRate(point.rate)}</span>
      </div>
    </div>
  )
}