'use client'
import { CardDivider, Card } from '@/components/card'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Notification } from '@/components/notification'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export function GlobalMarginCard({
  defaultMargin = 10
}: {
  defaultMargin?: number
}) {
  const [margin, setMargin] = useState(defaultMargin)
  const onSave = (val: number) => {
    // Save the global margin to your backend or state management
    console.log('Global margin saved:', val)
  }

  return (
    <div className="space-y-1">
      <div className="max-w-36  flex items-center gap-3">
        <Input
          type="number"
          value={margin}
          onChange={(e) => setMargin(Number(e.target.value))}
          className="w-full max-w-xs"
        />
        <span className="text-muted-foreground">%</span>
      </div>
      <div>
        <CardDivider />
        <div className="w-full flex justify-end">
          <Button onClick={() => onSave(margin)}>Mettre a jour</Button>
        </div>
      </div>
    </div>
  )
}
