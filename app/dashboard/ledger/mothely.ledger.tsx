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
import {
  addDays,
  differenceInDays,
  format,
  getDaysInMonth,
  parseISO,
  startOfYear
} from 'date-fns'
import { amountToWords } from '@/helpers/price-to-string'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { fr } from 'date-fns/locale' // For French month names
import './print.css'
import { chunk, random } from 'lodash'
import { useRouter, useSearchParams } from 'next/navigation'

const PAGE_SIZE = 15

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

type DateRange = {
  from: Date
  to: Date
}

const formatLocalDate = (date: Date) =>
  date.toLocaleDateString('en-CA', { timeZone: 'Africa/Algiers' }) // or your local zone

export function getJournalTitle({
  from: from_input,
  to: to_input
}: DateRange): string {
  const now = new Date()
  const firstOfYear = formatLocalDate(new Date(now.getFullYear(), 0, 1))
  const lastOfYear = formatLocalDate(new Date(now.getFullYear() + 1, 0, 1))
  console.log({ lastOfYear })
  const firstOfMonth = formatLocalDate(
    new Date(now.getFullYear(), now.getMonth(), 1)
  )
  const lastOfMonth = formatLocalDate(
    new Date(now.getFullYear(), now.getMonth() + 1, 0)
  )
  const from = formatLocalDate(from_input)
  const to = formatLocalDate(to_input)

  if (from == firstOfYear && to <= lastOfYear) {
    const title = format(from, 'yyyy', { locale: fr }).toUpperCase()
    return `${title}`
  }

  if (from == firstOfMonth && to == lastOfMonth) {
    const title = format(from, 'MMMM yyyy', { locale: fr }).toUpperCase()
    return `(${title})`
  }

  let fromText = format(from, 'dd MMMM', { locale: fr }).toUpperCase()
  if (from_input.getFullYear() != to_input.getFullYear()) {
    fromText = format(from, 'dd MMMM yyyy', { locale: fr }).toUpperCase()
  }
  const toText = format(to, 'dd MMMM yyyy', { locale: fr }).toUpperCase()
  return `(${fromText} - ${toText})`
}

export default function MonthlyLedger({}: MonthlyLedgerProps) {
  const [data, setData] = useState<LedgerInvoice[]>([])
  const [loading, setLoading] = useState(true)

  const searchParams = useSearchParams()
  const router = useRouter()

  const from = searchParams.get('from')
  const to = searchParams.get('to')

  // Only redirect if missing params
  if (!from || !to) {
    const now = new Date()

    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const params = new URLSearchParams(searchParams.toString())
    if (!from) params.set('from', formatLocalDate(firstOfMonth))
    if (!to) params.set('to', formatLocalDate(lastOfMonth))

    router.replace(`?${params.toString()}`)
  }

  const journalTitle = getJournalTitle({
    from: new Date(from!),
    to: new Date(to!)
  })

  const pages = useMemo(() => chunk(data, PAGE_SIZE), [data])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/reports/journal?from=${searchParams.toString()}&format=json`
        )
        if (!res.ok) throw new Error('Failed to fetch ledger data')
        const invoices: LedgerInvoice[] = await res.json()
        console.log({ invoices })
        setData(invoices)
      } catch (error) {
        console.error(error)
        // TODO: Add toast error if needed
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [searchParams])

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
        <h2 className="text-2xl font-semibold font-poppins">
          JOURNAL DES FACTURES {journalTitle}
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

  const renderFooter = (props?: { page?: number; pages?: number }) => (
    <div className="print-footer flex flex-col font-poppins text-xs mt-auto">
      <div className="text-right">
        <p>
          Page: {props?.page}|
          <span className="text-muted-foreground">{props?.pages}</span>
        </p>
      </div>
      <Separator
        style={{ backgroundColor: '#000' }}
        className="my-1 h-[1.6px] rounded"
      />
      <div className="grid  grid-cols-4 gap-1 text-left">
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

  const renderPriceInLetters = () => {
    return (
      <div className="amount-in-words mt-2">
        <div className="space-y-[2px] text-sm print:text-black">
          <p className="font-semibold">GAINS TOTAUX DU MOIS EN TTC:</p>
          <p className="capitalize">{amountToWords(totals.total)}</p>
        </div>
      </div>
    )
  }
  const renderTotals = () => {
    return (
      <TableRow className="font-bold bg-gray-100">
        <TableCell colSpan={3} className="py-[1.5px] px-2 text-left">
          TOTAUX
        </TableCell>
        <TableCell className="py-[1.5px] px-2 text-right">
          {formatPrice(totals.subtotal + totals.discount)}
        </TableCell>
        <TableCell className="py-[1.5px] px-2 text-right">
          {formatPrice(totals.discount)}
        </TableCell>
        <TableCell className="py-[1.5px] px-2 text-right">
          {formatPrice(totals.refund)}
        </TableCell>
        <TableCell className="py-[1.5px] px-2 text-right">
          {formatPrice(totals.subtotal)}
        </TableCell>
        <TableCell className="py-[1.5px] px-2 text-right">
          {formatPrice(totals.vat)}
        </TableCell>
        <TableCell className="py-[1.5px] px-2 text-right">
          {formatPrice(totals.stampTax)}
        </TableCell>
        <TableCell className="py-[1.5px] px-2 text-right">
          {formatPrice(totals.total)}
        </TableCell>
      </TableRow>
    )
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {pages.map((page, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1

        return (
          <div
            key={pageIndex}
            className="print:w-[297mm] print:h-[210mm] w-[297mm] h-[210mm] font-geist-sans shadow-2xl rounded-xl print:shadow-none print:rounded-none p-8 bg-white flex flex-col justify-start break-after-page print:break-after-page"
          >
            {renderHeader()}

            <Table className="font-poppins text-[0.8rem] w-full font-regular hide-scrollbar-print text-foreground mt-4">
              <TableHeader className="print:table-header-group bg-gray-100 border-y">
                <TableRow>
                  <TableHead className="px-2 text-nowrap py-1 h-5 text-left text-black font-medium border-r-[3px] border-white w-[6.3rem]">
                    Date
                  </TableHead>
                  <TableHead className="px-2 text-nowrap py-1 h-5 text-left text-black font-medium border-r-[3px] border-white w-9">
                    N°
                  </TableHead>
                  <TableHead className="px-2 text-nowrap py-1 h-5 text-left text-black font-medium border-r-[3px] border-white max-w-[15rem] truncate">
                    Société
                  </TableHead>
                  <TableHead className="px-2 text-nowrap py-1 h-5 text-right text-black font-medium border-r-[3px] border-white w-[7.35rem]">
                    Total Brute H.T
                  </TableHead>
                  <TableHead className="px-2 text-nowrap py-1 h-5 text-right text-black font-medium border-r-[3px] border-white w-[6.3rem]">
                    Remise
                  </TableHead>
                  <TableHead className="px-2 text-nowrap py-1 h-5 text-right text-black font-medium border-r-[3px] border-white w-[6.3rem]">
                    RG
                  </TableHead>
                  <TableHead className="px-2 text-nowrap py-1 h-5 text-right text-black font-medium border-r-[3px] border-white w-[7.35rem]">
                    Total Net H.T
                  </TableHead>
                  <TableHead className="px-2 text-nowrap py-1 h-5 text-right text-black font-medium border-r-[3px] border-white w-28">
                    TVA
                  </TableHead>
                  <TableHead className="px-2 text-nowrap py-1 h-5 text-right text-black font-medium border-r-[3px] border-white w-14">
                    Timbre
                  </TableHead>
                  <TableHead className="px-2 text-nowrap py-1 h-5 text-right text-black font-medium w-[7.35rem]">
                    TTC
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {page.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="py-[1.5px] px-2 w-[5.08rem]">
                      {format(new Date(inv.createdAt), 'dd-MM-yyyy')}
                    </TableCell>
                    <TableCell className="py-[1.5px] px-2 font-sans">
                      {inv.reference.substring(inv.reference.length - 3)}
                    </TableCell>
                    <TableCell className="py-[1.5px] px-2 max-w-[15rem] truncate">
                      {inv.Client?.name ?? ''}
                    </TableCell>
                    <TableCell className="py-[1.5px] px-2 text-right font-geist-sans w-28">
                      {formatPrice(inv.subtotal + inv.discount + inv.refund)}
                    </TableCell>
                    <TableCell className="py-[1.5px] px-2 text-right font-geist-sans">
                      {formatPrice(inv.discount)}
                    </TableCell>
                    <TableCell className="py-[1.5px] px-2 text-right font-geist-sans">
                      {formatPrice(inv.refund)}
                    </TableCell>
                    <TableCell className="py-[1.5px] px-2 text-right font-geist-sans">
                      {formatPrice(inv.subtotal)}
                    </TableCell>
                    <TableCell className="py-[1.5px] px-2 text-right font-geist-sans">
                      {formatPrice(inv.vat)}
                    </TableCell>
                    <TableCell className="py-[1.5px] px-2 text-right font-geist-sans">
                      {formatPrice(inv.stampTax)}
                    </TableCell>
                    <TableCell className="py-[1.5px] px-2 text-right font-geist-sans">
                      {formatPrice(inv.total)}
                    </TableCell>
                  </TableRow>
                ))}

                {isLastPage && renderTotals()}
              </TableBody>
            </Table>

            {isLastPage && <div className="mt-4">{renderPriceInLetters()}</div>}

            {renderFooter({
              page: pageIndex + 1,
              pages: pages.length
            })}
          </div>
        )
      })}
    </div>
  )
}
