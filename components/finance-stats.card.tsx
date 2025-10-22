import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { ArrowDown, ArrowUp } from 'lucide-react'

function formatNumber(n: number) {
  if (n >= 1_000_000) return formatPrice(n / 1_000_000) + ' M'
  return formatPrice(n)
}

type StatCardItem = {
  title: string
  value: number
  delta: number
  lastMonth: number // Fixed: 150380000 / (1 + 3.7/100)
  positive: boolean
}

export type FinanceStats = {
  bruteHT: StatCardItem
  netCommercial: StatCardItem
  tva19: StatCardItem
  ttc: StatCardItem
}

export default function FinanceMetadataCards({
  stats
}: {
  stats?: FinanceStats
}) {
  if (!stats) return null
  const { bruteHT, netCommercial, tva19, ttc } = stats

  return (
    <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {bruteHT && (
        <Card>
          <CardHeader className="border-0">
            <CardTitle className="text-muted-foreground text-sm font-medium uppercase">
              {bruteHT.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-medium text-foreground tracking-tight">
                {formatNumber(bruteHT.value)}
              </span>
              <Badge
                variant={bruteHT.positive ? 'success' : 'destructive'}
                appearance="light"
              >
                {bruteHT.delta >= 0 ? <ArrowUp /> : <ArrowDown />}
                {bruteHT.delta}%
              </Badge>
            </div>
            <div className="text-md text-muted-foreground mt-2 border-t-2 pt-2.5">
              Mois précédent:{' '}
              <span className="font-medium text-foreground">
                {formatNumber(bruteHT.lastMonth)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      {netCommercial && (
        <Card>
          <CardHeader className="border-0">
            <CardTitle className="text-muted-foreground text-sm font-medium uppercase">
              {netCommercial.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-medium text-foreground tracking-tight">
                {formatNumber(netCommercial.value)}
              </span>
              <Badge
                variant={netCommercial.positive ? 'success' : 'destructive'}
                appearance="light"
              >
                {netCommercial.delta >= 0 ? <ArrowUp /> : <ArrowDown />}
                {netCommercial.delta}%
              </Badge>
            </div>
            <div className="text-md text-muted-foreground mt-2 border-t-2 pt-2.5">
              Mois précédent:{' '}
              <span className="font-medium text-foreground">
                {formatNumber(netCommercial.lastMonth)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      {tva19 && (
        <Card>
          <CardHeader className="border-0">
            <CardTitle className="text-muted-foreground text-sm font-medium uppercase">
              {tva19.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-medium text-foreground tracking-tight">
                {formatNumber(tva19.value)}
              </span>
              <Badge
                variant={tva19.positive ? 'success' : 'destructive'}
                appearance="light"
              >
                {tva19.delta >= 0 ? <ArrowUp /> : <ArrowDown />}
                {tva19.delta}%
              </Badge>
            </div>
            <div className="text-md text-muted-foreground mt-2 border-t-2 pt-2.5">
              Mois précédent:{' '}
              <span className="font-medium text-foreground">
                {formatNumber(tva19.lastMonth)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      {ttc && (
        <Card>
          <CardHeader className="border-0">
            <CardTitle className="text-muted-foreground text-sm font-medium uppercase">
              {ttc.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-medium text-foreground tracking-tight">
                {formatNumber(ttc.value)}
              </span>
              <Badge
                variant={ttc.positive ? 'success' : 'destructive'}
                appearance="light"
              >
                {ttc.delta >= 0 ? <ArrowUp /> : <ArrowDown />}
                {ttc.delta}%
              </Badge>
            </div>
            <div className="text-md text-muted-foreground mt-2 border-t-2 pt-2.5">
              Mois précédent:{' '}
              <span className="font-medium text-foreground">
                {formatNumber(ttc.lastMonth)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
