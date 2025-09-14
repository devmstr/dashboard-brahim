'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { LedgerTable } from './ledger.table'
import { UserRole } from '@/types'

interface InvoiceData {
  billId: string
  id: string
  total: number
  items: number
  createdAt: string
  company: string
  phone: string
  location: string
}

interface InvoiceLedgerTabsProps {
  draftInvoices: InvoiceData[]
  normalInvoices: InvoiceData[]
  userRole?: UserRole
}

export default function InvoiceLedgerTabs({
  draftInvoices = [],
  normalInvoices = [],
  userRole = 'FINANCE'
}: InvoiceLedgerTabsProps) {
  const [activeTab, setActiveTab] = useState('normal')

  return (
    <Card className="w-full pt-4">
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 ">
            <CardTitle className="text-2xl font-bold">
              Journal des Factures
            </CardTitle>
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger
                value="normal"
                className="flex items-center gap-2 text-sm font-medium"
              >
                Final
              </TabsTrigger>
              <TabsTrigger
                value="draft"
                className="flex items-center gap-2 text-sm font-medium"
              >
                Proforma
              </TabsTrigger>
            </TabsList>
          </div>
          {/*  */}
          <TabsContent value="normal" className="mt-0">
            <LedgerTable userRole={userRole} data={normalInvoices} />
          </TabsContent>
          {/*  */}
          <TabsContent value="draft" className="mt-0">
            <LedgerTable userRole={userRole} data={draftInvoices} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
