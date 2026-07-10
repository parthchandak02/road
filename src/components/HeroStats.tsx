import { formatRate } from '../data/rates'

interface HeroStatsProps {
  rate: number
}

export default function HeroStats({ rate }: HeroStatsProps) {
  return (
    <div className="hero-stats">
      <div className="hero-rate">{formatRate(rate)}</div>
      <div className="hero-label">EUR/USD</div>
    </div>
  )
}