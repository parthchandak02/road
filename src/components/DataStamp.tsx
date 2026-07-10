import type { RateSource } from '../data/rates'

interface DataStampProps {
  source: RateSource
  minutesAgo: number
  loading: boolean
  dayCount: number
}

export default function DataStamp({ source, minutesAgo, loading, dayCount }: DataStampProps) {
  const sourceText = source === 'live' ? 'live' : 'cached'
  const timeText = loading ? '...' : minutesAgo === 0 ? 'now' : `${minutesAgo}m ago`
  
  return (
    <div className="data-stamp">
      Frankfurter · EUR/USD · {dayCount} days · {sourceText} · {timeText}
    </div>
  )
}