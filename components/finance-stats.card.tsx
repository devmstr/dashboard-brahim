import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDown, ArrowUp } from 'lucide-react'

const stats = [
  {
    title: 'brute h/t',
    value: 122380000,
    delta: 15.1,
    lastMonth: 106324500, // Fixed: 122380000 / (1 + 15.1/100)
    positive: true,
    prefix: '',
    suffix: ''
  },
  {
    title: 'net commercial',
    value: 100238000,
    delta: -2.0,
    lastMonth: 102283673.47, // Fixed: 100238000 / (1 - 2.0/100)
    positive: false,
    prefix: '',
    suffix: ''
  },
  {
    title: 'tva 19%',
    value: 12100000,
    delta: 0.4,
    lastMonth: 12051792.83, // Fixed: 12100000 / (1 + 0.4/100)
    positive: true,
    prefix: '$',
    suffix: 'M',
    format: (v: number) => `$${(v / 1e6).toFixed(1)}M`,
    lastFormat: (v: number) => `$${(v / 1e6).toFixed(1)}M`
  },
  {
    title: 'TTC',
    value: 150380000,
    delta: 3.7,
    lastMonth: 145014464.8, // Fixed: 150380000 / (1 + 3.7/100)
    positive: true,
    prefix: '',
    suffix: ''
  }
]

function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return n.toLocaleString()
  return n.toString()
}

export default function FinanceMetadataCards() {
  return (
    <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="border-0">
            <CardTitle className="text-muted-foreground text-sm font-medium uppercase">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-medium text-foreground tracking-tight">
                {stat.format
                  ? stat.format(stat.value)
                  : stat.prefix + formatNumber(stat.value) + stat.suffix}
              </span>
              <Badge
                variant={stat.positive ? 'success' : 'destructive'}
                appearance="light"
              >
                {stat.delta > 0 ? <ArrowUp /> : <ArrowDown />}
                {stat.delta}%
              </Badge>
            </div>
            <div className="text-md text-muted-foreground mt-2 border-t-2 pt-2.5">
              Mois précédent:{' '}
              <span className="font-medium text-foreground">
                {stat.lastFormat
                  ? stat.lastFormat(stat.lastMonth)
                  : stat.prefix + formatNumber(stat.lastMonth) + stat.suffix}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
