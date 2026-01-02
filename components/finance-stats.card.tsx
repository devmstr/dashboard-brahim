'use client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import React from 'react'
import { getCookie, setCookie } from '@/lib/cookies'

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

export function formatDZD(
  value: number,
  {
    useAlgerianConvention = false,
    displaySuffix = true
  }: {
    useAlgerianConvention?: boolean
    displaySuffix?: boolean
  } = {}
): string {
  const dinar = value
  const centime = value * 100
  const formatNumber = (num: number) =>
    num.toLocaleString('fr-DZ', { minimumFractionDigits: 0 })

  if (useAlgerianConvention) {
    const millions = centime / 1_000_000
    if (millions >= 1_000)
      return `${(millions / 1_000).toFixed(2)} ${
        displaySuffix ? 'Milliard' : ''
      } `
    if (millions >= 1)
      return `${millions.toFixed(2)} ${displaySuffix ? 'Million' : ''} `
    return `${formatNumber(centime)} `
  }

  if (dinar >= 1_000_000_000)
    return `${(dinar / 1_000_000_000).toFixed(2)} ${
      displaySuffix ? 'Milliard' : ''
    } `
  if (dinar >= 1_000_000)
    return `${(dinar / 1_000_000).toFixed(2)} ${
      displaySuffix ? 'Million' : ''
    } `
  return `${formatNumber(dinar)}`
}

export function DzdBadge(props: { useAlgerianConvention: boolean }) {
  return (
    <Badge variant="outline" className="text-xs opacity-60">
      {props.useAlgerianConvention ? 'Centimes' : 'Dinars'}
    </Badge>
  )
}
export function DeltaBadge(props: { delta: number; positive: boolean }) {
  return (
    <Badge
      variant={props.positive ? 'success' : 'destructive'}
      appearance="light"
    >
      {props.delta >= 0 ? <ArrowUp /> : <ArrowDown />}
      {props.delta}%
    </Badge>
  )
}

export default function FinanceMetadataCards({
  stats
}: {
  stats?: FinanceStats
}) {
  if (!stats) return null
  const { bruteHT, netCommercial, tva19, ttc } = stats
  const [useAlgerianConvention, setUseAlgerianConvention] =
    React.useState(false)
  React.useEffect(() => {
    const cookieValue = getCookie('use_algerian_convention')
    if (cookieValue === 'true') setUseAlgerianConvention(true)
  }, [])

  function handleConventionToggle(value: boolean) {
    setUseAlgerianConvention(value)
    setCookie('use_algerian_convention', value.toString(), 60 * 60 * 24 * 365)
  }

  return (
    <div>
      {/* <div className="flex justify-end -mt-2 mb-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">
            Suivre l’usage local du « million » algérien (10 000 dzd = 1 million
            centimes)
          </Label>
          <Switch
            checked={useAlgerianConvention}
            onCheckedChange={handleConventionToggle}
          />
        </div>
      </div> */}
      <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {bruteHT && (
          <Card>
            <CardHeader className="border-0">
              <CardTitle className="text-muted-foreground text-sm font-medium uppercase flex items-center justify-between">
                {bruteHT.title}
                <DeltaBadge delta={bruteHT.delta} positive={bruteHT.positive} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-medium text-foreground tracking-tight">
                  {formatDZD(bruteHT.value, { useAlgerianConvention })}
                </span>
                <DzdBadge useAlgerianConvention={useAlgerianConvention} />
              </div>
              <div className="text-md text-muted-foreground mt-2 border-t-2 pt-2.5 flex gap-1 items-center">
                Mois précédent:{' '}
                <div className="flex gap-1 items-center">
                  <span className="font-medium text-foreground">
                    {formatDZD(bruteHT.lastMonth, {
                      useAlgerianConvention
                    })}
                  </span>
                  <DzdBadge useAlgerianConvention={useAlgerianConvention} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {netCommercial && (
          <Card>
            <CardHeader className="border-0">
              <CardTitle className="text-muted-foreground text-sm font-medium uppercase flex items-center justify-between">
                {netCommercial.title}
                <DeltaBadge
                  delta={netCommercial.delta}
                  positive={netCommercial.positive}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-medium text-foreground tracking-tight">
                  {formatDZD(netCommercial.value, { useAlgerianConvention })}
                </span>
              </div>
              <div className="text-md text-muted-foreground mt-2 border-t-2 pt-2.5 flex gap-1 items-center">
                Mois précédent:{' '}
                <div className="flex gap-1 items-center">
                  <span className="font-medium text-foreground">
                    {formatDZD(netCommercial.lastMonth, {
                      useAlgerianConvention
                    })}
                  </span>
                  <DzdBadge useAlgerianConvention={useAlgerianConvention} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {tva19 && (
          <Card>
            <CardHeader className="border-0">
              <CardTitle className="text-muted-foreground text-sm font-medium uppercase flex items-center justify-between">
                {tva19.title}
                <DeltaBadge delta={tva19.delta} positive={tva19.positive} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-medium text-foreground tracking-tight">
                  {formatDZD(tva19.value, { useAlgerianConvention })}
                </span>
              </div>
              <div className="text-md text-muted-foreground mt-2 border-t-2 pt-2.5 flex gap-1 items-center">
                Mois précédent:{' '}
                <div className="flex gap-1 items-center">
                  <span className="font-medium text-foreground">
                    {formatDZD(tva19.lastMonth, {
                      useAlgerianConvention
                    })}
                  </span>
                  <DzdBadge useAlgerianConvention={useAlgerianConvention} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {ttc && (
          <Card>
            <CardHeader className="border-0">
              <CardTitle className="text-muted-foreground text-sm font-medium uppercase flex items-center justify-between">
                {ttc.title}
                <DeltaBadge delta={ttc.delta} positive={ttc.positive} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-medium text-foreground tracking-tight">
                  {formatDZD(ttc.value, { useAlgerianConvention })}
                </span>
              </div>
              <div className="text-md text-muted-foreground mt-2 border-t-2 pt-2.5 flex gap-1 items-center">
                Mois précédent:{' '}
                <div className="flex gap-1 items-center">
                  <span className="font-medium text-foreground">
                    {formatDZD(ttc.lastMonth, {
                      useAlgerianConvention
                    })}
                  </span>
                  <DzdBadge useAlgerianConvention={useAlgerianConvention} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
