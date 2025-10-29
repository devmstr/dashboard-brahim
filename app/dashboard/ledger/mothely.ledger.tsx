'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'
import { amountToWords } from '@/helpers/price-to-string'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { fr } from 'date-fns/locale' // For French month names
import './print.css'
import { DateRange } from '@/components/DateRangeFilter'
import { random } from 'lodash'
import { useSearchParams } from 'next/navigation'

interface MonthlyLedgerProps {}

interface LedgerInvoice {
  id: string
  reference: string
  type: 'FINAL' | 'PROFORMA'
  total: number
  subtotal: number
  refund: number
  discount: number
  vat: number
  stampTax: number
  createdAt: string // ISO date
  Client: { name: string }
}
type StringDateRange = {
  from: string
  to: string
}
export default function MonthlyLedger({}: MonthlyLedgerProps) {
  const [data, setData] = useState<LedgerInvoice[]>([])
  const [loading, setLoading] = useState(true)

  const serachParams = useSearchParams()
  const [dateRange, setDateRange] = useState<StringDateRange>({
    from: serachParams.get('from') as string,
    to: serachParams.get('to') as string
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/reports/journal?from=${dateRange.from}&to=${dateRange.to}&format=json`
        )
        if (!res.ok) throw new Error('Failed to fetch ledger data')
        const invoices: LedgerInvoice[] = await res.json()
        setData(invoices)
      } catch (error) {
        console.error(error)
        // TODO: Add toast error if needed
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [dateRange])

  const totals = useMemo(() => {
    return data.reduce(
      (acc, inv) => ({
        subtotal: acc.subtotal + inv.subtotal,
        discount: acc.discount + inv.discount,
        refund: acc.refund + inv.refund,
        stampTax: acc.stampTax + inv.stampTax,
        vat: acc.vat + inv.vat,
        total: acc.total + inv.total
      }),
      { subtotal: 0, discount: 0, refund: 0, stampTax: 0, vat: 0, total: 0 }
    )
  }, [data])

  const monthTitle = format(dateRange.from, 'MMMM yyyy', {
    locale: fr
  }).toUpperCase()

  const renderHeader = () => (
    <div className="print-header">
      <div className="flex justify-between items-start">
        <div className="w-full flex items-center justify-between">
          <div className="w-[4.57rem] h-[4.57rem] translate-y-[1.5px]">
            <Image
              className="w-full"
              src={'/images/logo.svg'}
              alt={'company-logo'}
              width={250}
              height={250}
              priority
            />
          </div>
          <div className="text-center font-poppins">
            <h1 className="text-[1.7rem] leading-tight font-bold font-poppins translate-y-[4px]">
              SARL SO.NE.RA.S
            </h1>
            <p className="text-[1.57rem] leading-tight font-bold font-naskh-arabic">
              ش . ذ . م . م . صونيـراس
            </p>
            <p className="text-xl leading-tight font-poppins">
              Capital: 104 002 000.00
            </p>
          </div>
          <div className="w-20 h-20" /> {/* Placeholder for alignment, no QR */}
        </div>
      </div>
      <div className="w-full flex justify-between text-sm mt-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span>Adresse: Z.I. Garat taam B. P.N 46 Bounoura - 47014</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Email: info@okindustrie.com</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-start gap-2">
            <span className="tracking-[0.017em]">Tel | Fax: 029 27 22 06</span>
          </div>
          <div className="flex items-center justify-start gap-2">
            <span className="translate-x-[1px]">Mobile: 07 70 49 72 90</span>
          </div>
        </div>
      </div>
      <Separator
        style={{ backgroundColor: '#000' }}
        className="separator my-1 h-[1.8px] rounded text-black"
      />
      <div className="w-full flex justify-center text-center">
        <h2 className="text-3xl -translate-y-1 font-bold font-poppins">
          JOURNAL DES FACTURES DU {monthTitle}
        </h2>
      </div>
      <div className="text-base mt-1">
        <Separator
          style={{ backgroundColor: '#000' }}
          className="separator my-1 h-[1.4px] rounded"
        />
      </div>
    </div>
  )

  const renderFooter = () => (
    <div className="print-footer flex flex-col font-poppins text-xs mt-auto">
      <div className="amount-in-words mt-2">
        <div className="space-y-[2px] text-sm print:text-black">
          <p className="font-semibold">GAINS TOTAUX DU MOIS EN TTC:</p>
          <p className="capitalize">{amountToWords(totals.total)}</p>
        </div>
      </div>
      <Separator
        style={{ backgroundColor: '#000' }}
        className="my-1 h-[1.6px] rounded"
      />
      <div className="grid  grid-cols-4 gap-1 text-center">
        <p className="font-sans w-1/4 text-nowrap ">
          <strong>R.C:</strong> 97/B/0862043
        </p>
        <p className="font-sans w-1/4 text-nowrap  ">
          <strong>N.I.F:</strong> 99747086204393
        </p>
        <p className="font-sans w-1/4 text-nowrap ">
          <strong>A.I:</strong> 4710060038
        </p>
        <p className="font-sans w-1/4 text-nowrap ">
          <strong>N.I.S:</strong> 096947100010442
        </p>
      </div>
      <Separator
        style={{ backgroundColor: '#000' }}
        className="my-1 h-[1px] rounded"
      />
      <div className="grid grid-cols-4 gap-1 mt-1 font-geist-sans text-end ">
        <p className="w-1/4 text-nowrap">
          <strong>BEA:</strong> 00200028280286002213
        </p>
        <p className="w-1/4 text-nowrap">
          <strong>BNA:</strong> 00100291030035005601
        </p>
        <p className="w-1/4 text-nowrap">
          <strong>SGA:</strong> 02100551113003458571
        </p>
        <p className="w-1/4 text-nowrap">
          <strong>AGB:</strong> 03200001229251120896
        </p>
      </div>
    </div>
  )

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <>
      <div className="print:w-[297mm] print:h-[210mm] w-[297mm] h-[210mm] font-geist-sans shadow-2xl rounded-xl print:shadow-none print:rounded-none p-8 bg-white flex flex-col justify-start">
        {renderHeader()}
        <Table className="font-poppins text-[0.9rem] w-full font-regular hide-scrollbar-print text-foreground mt-4">
          <TableHeader className="print:table-header-group bg-gray-100 border-y">
            <TableRow>
              <TableHead className="px-2 py-1 h-5 text-left text-black font-medium border-r-[3px] border-white">
                Date
              </TableHead>
              <TableHead className="px-2 py-1 h-5 text-left text-black font-medium border-r-[3px] border-white">
                N°
              </TableHead>
              <TableHead className="px-2 py-1 h-5 text-left text-black font-medium border-r-[3px] border-white">
                Société
              </TableHead>
              <TableHead className="px-2 py-1 h-5 text-right text-black font-medium border-r-[3px] border-white">
                Total(HT)
              </TableHead>
              <TableHead className="px-2 py-1 h-5 text-right text-black font-medium border-r-[3px] border-white">
                Remise
              </TableHead>
              <TableHead className="px-2 py-1 h-5 text-right text-black font-medium border-r-[3px] border-white">
                RG
              </TableHead>
              <TableHead className="px-2 py-1 h-5 text-right text-black font-medium border-r-[3px] border-white">
                Timbre
              </TableHead>
              <TableHead className="px-2 py-1 h-5 text-right text-black font-medium border-r-[3px] border-white">
                TVA
              </TableHead>
              <TableHead className="px-2 py-1 h-5 text-right text-black font-medium">
                TTC
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="py-[1.5px] px-2">
                  {format(new Date(inv.createdAt), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="py-[1.5px] px-2">
                  {inv.reference.replace(/FF-\d{2}|FP-\d{2}/g, '')}
                </TableCell>
                <TableCell className="py-[1.5px] px-2">
                  {inv.Client?.name ?? ''}
                </TableCell>
                <TableCell className="py-[1.5px] px-2 text-right font-geist-sans">
                  {formatPrice(inv.subtotal)}
                </TableCell>
                <TableCell className="py-[1.5px] px-2 text-right font-geist-sans">
                  {formatPrice(inv.discount)}
                </TableCell>
                <TableCell className="py-[1.5px] px-2 text-right font-geist-sans">
                  {formatPrice(inv.refund)}
                </TableCell>
                <TableCell className="py-[1.5px] px-2 text-right font-geist-sans">
                  {formatPrice(inv.stampTax)}
                </TableCell>
                <TableCell className="py-[1.5px] px-2 text-right font-geist-sans">
                  {formatPrice(inv.vat)}
                </TableCell>
                <TableCell className="py-[1.5px] px-2 text-right font-geist-sans">
                  {formatPrice(inv.total)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold bg-gray-100">
              <TableCell colSpan={3} className="py-[1.5px] px-2 text-left">
                TOTAUX
              </TableCell>
              <TableCell className="py-[1.5px] px-2 text-right">
                {formatPrice(totals.subtotal)}
              </TableCell>
              <TableCell className="py-[1.5px] px-2 text-right">
                {formatPrice(totals.discount)}
              </TableCell>
              <TableCell className="py-[1.5px] px-2 text-right">
                {formatPrice(totals.refund)}
              </TableCell>
              <TableCell className="py-[1.5px] px-2 text-right">
                {formatPrice(totals.stampTax)}
              </TableCell>
              <TableCell className="py-[1.5px] px-2 text-right">
                {formatPrice(totals.vat)}
              </TableCell>
              <TableCell className="py-[1.5px] px-2 text-right">
                {formatPrice(totals.total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {renderFooter()}
      </div>
    </>
  )
}
