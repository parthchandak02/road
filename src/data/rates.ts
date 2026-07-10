export interface ExchangeRate {
  date: string
  rate: number
}

export type RateSource = 'live' | 'fallback'

// Fallback EUR/USD data (realistic 23 days of rates)
export const FALLBACK_RATES: ExchangeRate[] = [
  { date: '2026-06-18', rate: 1.1240 },
  { date: '2026-06-19', rate: 1.1210 },
  { date: '2026-06-20', rate: 1.1180 },
  { date: '2026-06-21', rate: 1.1160 },
  { date: '2026-06-22', rate: 1.1140 },
  { date: '2026-06-23', rate: 1.1120 },
  { date: '2026-06-24', rate: 1.1100 },
  { date: '2026-06-25', rate: 1.1080 },
  { date: '2026-06-26', rate: 1.1060 },
  { date: '2026-06-27', rate: 1.1040 },
  { date: '2026-06-28', rate: 1.1020 },
  { date: '2026-06-29', rate: 1.1000 },
  { date: '2026-06-30', rate: 1.0980 },
  { date: '2026-07-01', rate: 1.1020 },
  { date: '2026-07-02', rate: 1.1080 },
  { date: '2026-07-03', rate: 1.1140 },
  { date: '2026-07-04', rate: 1.1200 },
  { date: '2026-07-05', rate: 1.1260 },
  { date: '2026-07-06', rate: 1.1320 },
  { date: '2026-07-07', rate: 1.1380 },
  { date: '2026-07-08', rate: 1.1420 },
  { date: '2026-07-09', rate: 1.1450 },
  { date: '2026-07-10', rate: 1.1430 },
]

function getDateRange(): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 30)
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  }
}

interface FrankfurterResponse {
  rates: Record<string, { USD: number }>
}

interface LatestRateResponse {
  rates: { USD: number }
}

async function fetchHistoricalRates(): Promise<ExchangeRate[]> {
  const { start, end } = getDateRange()
  const url = `https://api.frankfurter.app/${start}..${end}?from=EUR&to=USD`
  
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Frankfurter API ${response.status}`)
  
  const data = (await response.json()) as FrankfurterResponse
  if (!data?.rates) throw new Error('Invalid Frankfurter response')
  
  return Object.entries(data.rates)
    .map(([date, rates]) => ({
      date,
      rate: rates.USD
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

async function fetchLatestRate(): Promise<number> {
  const response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD')
  if (!response.ok) throw new Error(`Frankfurter API ${response.status}`)
  
  const data = (await response.json()) as LatestRateResponse
  if (!data?.rates?.USD) throw new Error('Invalid latest rate response')
  
  return data.rates.USD
}

export async function fetchRates(): Promise<{ 
  rates: ExchangeRate[]; 
  source: RateSource; 
  dayCount: number;
  latestRate: number;
}> {
  try {
    const [historicalRates, latestRate] = await Promise.all([
      fetchHistoricalRates(),
      fetchLatestRate()
    ])
    
    if (!historicalRates?.length) throw new Error('Empty rates response')
    
    return { 
      rates: historicalRates, 
      source: 'live', 
      dayCount: historicalRates.length,
      latestRate
    }
  } catch {
    return { 
      rates: FALLBACK_RATES, 
      source: 'fallback', 
      dayCount: FALLBACK_RATES.length,
      latestRate: FALLBACK_RATES[FALLBACK_RATES.length - 1].rate
    }
  }
}

export function formatRate(rate: number): string {
  return rate.toFixed(4)
}

// Normalize rates for 3D positioning (map to 0-5 range)
export function normalizeRates(rates: ExchangeRate[]): { min: number; max: number; normalize: (rate: number) => number } {
  const values = rates.map(r => r.rate)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  
  const normalize = (rate: number) => range > 0 ? ((rate - min) / range) * 5 : 2.5
  
  return { min, max, normalize }
}