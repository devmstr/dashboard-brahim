'use client'
import { DateRange } from '@/components/DateRangeFilter'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { amountToWords } from '@/helpers/price-to-string'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale' // For French month names
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import './print.css'
import { Label } from '@/components/ui/label'
import React, { Suspense } from 'react'

interface Props {}

const formatLocalDate = (date: Date) =>
  date.toLocaleDateString('en-CA', { timeZone: 'Africa/Algiers' }) // or your local zone

export const LedgerHeader = (props?: { dateRange?: DateRange }) => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const url = `${pathname}?${searchParams.toString()}`

  function formatDateRangeJSX({
    from: from_input,
    to: to_input
  }: DateRange): React.ReactNode {
    if (!from_input || !to_input) return null

    const from = formatLocalDate(from_input)
    const to = formatLocalDate(to_input)

    // ----- Detect if full year -----
    const year = from_input.getFullYear()
    const firstOfYear = formatLocalDate(new Date(year, 0, 1))
    const lastOfYear = formatLocalDate(new Date(year, 11, 31))

    if (from === firstOfYear && to === lastOfYear) {
      return (
        <>
          Annuel : <strong>{year}</strong>
        </>
      )
    }

    // ----- Detect if full month (any month, any year) -----
    const month = from_input.getMonth()
    const firstOfMonth = formatLocalDate(new Date(year, month, 1))
    const lastOfMonth = formatLocalDate(new Date(year, month + 1, 0))

    if (from === firstOfMonth && to === lastOfMonth) {
      const monthYear = format(from_input, 'MMMM yyyy', { locale: fr })
      return (
        <>
          Mensuel : <strong className="capitalize">{monthYear}</strong>
        </>
      )
    }

    // ----- Custom range -----
    const fromText =
      from_input.getFullYear() !== to_input.getFullYear()
        ? format(from_input, 'dd MMMM yyyy', { locale: fr })
        : format(from_input, 'dd MMMM', { locale: fr })

    const toText = format(to_input, 'dd MMMM yyyy', { locale: fr })

    return (
      <>
        Période : <strong>Du</strong> {fromText} — <strong>Au</strong> {toText}
      </>
    )
  }

  return (
    <div className="print-header">
      <div className="flex justify-between items-start">
        <div className="w-full flex items-center justify-between">
          <div className="flex justify-start items-start h-fit w-1/6 ">
            <div className="w-[4.57rem] h-[4.57rem] ">
              <Image
                className="w-full"
                src={'/images/logo.svg'}
                alt={'company-logo'}
                width={250}
                height={250}
                priority
              />
            </div>
          </div>
          <div
            className="w-full flex flex-col items-center
           text-center font-poppins "
          >
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
          <div className="w-1/6 h-20 flex justify-end text-sm items-start font-poppins ">
            <QRCodeSVG
              imageSettings={{
                crossOrigin: 'anonymous',
                src: '/images/logo.svg',
                height: 40,
                width: 40,
                x: 45,
                y: 45,
                excavate: true
              }}
              value={url}
              className="w-[4.57rem] h-auto"
            />
          </div>
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
      <div className="w-full h-fit flex justify-between text-center">
        <div className="flex flex-col items-start w-1/4">
          {props?.dateRange && (
            <span className="text-xs font-geist-sans text-nowrap capitalize">
              {formatDateRangeJSX(props?.dateRange)}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-semibold font-poppins w-2/4">
          RECUPELATIF DU CHIFFRE D'AFFAIRE
        </h2>
        <h6 className="flex justify-end  items-center text-nowrap font-geist-sans text-xs w-1/4">
          {`Le : ${format(new Date(), 'dd/MM/yyy')}`}
        </h6>
      </div>
      <div className="text-base mt-1">
        <Separator
          style={{ backgroundColor: '#000' }}
          className="separator my-1 h-[1.4px] rounded"
        />
      </div>
    </div>
  )
}

export const LedgerTotalsRow = (totals: {
  subtotal: number
  discount: number
  refund: number
  vat: number
  stampTax: number
  total: number
}) => {
  return (
    <TableRow className="font-bold bg-gray-100">
      <TableCell colSpan={3} className="py-[1.5px] px-2 text-left">
        TOTAUX
      </TableCell>
      <TableCell className="py-[1.5px] px-2 text-right">
        {formatPrice(totals.subtotal + totals.discount + totals.refund)}
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

export const PriceInEnglish = (price: number, isLoading: boolean) => {
  return (
    <div className="amount-in-words mt-2">
      <div className="space-y-[2px] text-sm print:text-black">
        <p className="font-semibold uppercase">{`Montant total en toutes lettres`}</p>
        <Suspense fallback={<Skeleton className="rounded-md w-92" />}>
          {isLoading ? (
            <Skeleton className="rounded-md h-5 w-[60%]" />
          ) : (
            <p className="capitalize">{amountToWords(price)}</p>
          )}
        </Suspense>
      </div>
    </div>
  )
}

export const LedgerFooter = (props?: { page?: number; pages?: number }) => (
  <div className="print-footer flex flex-col font-poppins text-xs mt-auto">
    {props && (
      <div className="text-right">
        <p>
          Page: {props.page}|
          <span className="text-muted-foreground">{props?.pages}</span>
        </p>
      </div>
    )}
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

const TableLoadingSkeleton = () => (
  <TableBody>
    {Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 11 }).map((_, j) => (
          <TableCell className="py-[2px] px-2" key={j}>
            <Skeleton className="h-4 rounded-md" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
)

interface LedgerInvoice {
  id: string
  reference: string
  total: number
  subtotal: number
  refund: number
  discount: number
  vat: number
  vatRate: number
  stampTax: number
  createdAt: string // ISO date
}

export const RecapTable: React.FC<Props> = ({}: Props) => {
  const [data, setData] = React.useState<LedgerInvoice[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const searchParams = useSearchParams()
  const dateRange = {
    from: new Date(searchParams.get('from')?.toString()!),
    to: new Date(searchParams.get('to')?.toString()!)
  }
  const pathname = usePathname()
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

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/reports/recap?from=${searchParams.toString()}&format=json`
        )
        if (!res.ok) throw new Error('Failed to fetch ledger data')
        const invoices: LedgerInvoice[] = await res.json()
        setData(invoices)
      } catch (error) {
        console.error(error)
        // TODO: Add toast error if needed
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [searchParams])

  const { bruteHT, taxEcluded, refund, discount, stampTax, total, vat } =
    data.reduce(
      (acc, inv) => {
        const subtotal = Number(inv.subtotal)
        const discount = Number(inv.discount)
        const refund = Number(inv.refund)
        const stampTax = Number(inv.stampTax)
        const vat = Number(inv.vat)
        const total = Number(inv.total)

        const bruteHT = subtotal + discount + refund
        const taxEcluded = inv.vatRate === 0 ? bruteHT : 0

        acc.bruteHT += bruteHT
        acc.taxEcluded += taxEcluded
        acc.discount += discount
        acc.refund += refund
        acc.stampTax += stampTax
        acc.vat += vat
        acc.total += total

        return acc
      },
      {
        bruteHT: 0,
        taxEcluded: 0,
        discount: 0,
        refund: 0,
        stampTax: 0,
        vat: 0,
        total: 0
      }
    )

  const netHT = bruteHT - taxEcluded
  const netSales = netHT - discount
  const taxable = netSales - refund

  const productionTableData = [
    ['RAD/FAIS', 'py-[1.5px] px-2 text-left'],
    [formatPrice(bruteHT), 'py-[1.5px] px-2 text-right'],
    [formatPrice(taxEcluded), 'py-[1.5px] px-2 text-right'],
    [formatPrice(netHT), 'py-[1.5px] px-2 text-right'],
    [formatPrice(discount), 'py-[1.5px] px-2 text-right'],
    [formatPrice(netSales), 'py-[1.5px] px-2 text-right'],
    [formatPrice(refund), 'py-[1.5px] px-2 text-right'],
    [formatPrice(taxable), 'py-[1.5px] px-2 text-right'],
    [formatPrice(taxable * 0.19), 'py-[1.5px] px-2 text-right'],
    [formatPrice(stampTax), 'py-[1.5px] px-2 text-right'],
    [formatPrice(taxable * 1.19 + stampTax), 'py-[1.5px] px-2 text-right']
  ]
  const dechetsTableData = [
    ['DECHETS', 'py-[1.5px] px-2 text-left'],
    ['-', 'py-[1.5px] px-2 text-right'],
    ['-', 'py-[1.5px] px-2 text-right'],
    ['-', 'py-[1.5px] px-2 text-right'],
    ['-', 'py-[1.5px] px-2 text-right'],
    ['-', 'py-[1.5px] px-2 text-right'],
    ['-', 'py-[1.5px] px-2 text-right'],
    ['-', 'py-[1.5px] px-2 text-right'],
    ['-', 'py-[1.5px] px-2 text-right'],
    ['-', 'py-[1.5px] px-2 text-right'],
    ['-', 'py-[1.5px] px-2 text-right']
  ]
  const totauxTableData = [
    [formatPrice(taxable), 'py-[1.5px] px-2 text-right'],
    [formatPrice(taxable * 0.19), 'py-[1.5px] px-2 text-right'],
    [formatPrice(stampTax), 'py-[1.5px] px-2 text-right'],
    [formatPrice(taxable * 1.19 + stampTax), 'py-[1.5px] px-2 text-right']
  ]

  return (
    <div className="space-y-6">
      <div
        className="print:w-[297mm] print:h-[210mm] w-[297mm] h-[210mm]
                     font-geist-sans shadow-2xl rounded-xl print:shadow-none
                     print:rounded-none p-8 bg-white flex flex-col justify-start
                     break-after-page print:break-after-page"
      >
        {LedgerHeader({
          dateRange
        })}
        {/* table title */}
        <div className="w-full bg-gray-100 border-y border-gray-200 px-2 py-[1.5px]  mt-5">
          <Label className="uppercase">Production</Label>
        </div>
        {/* table section  */}
        <Table className="font-poppins text-[0.8rem] w-full font-regular hide-scrollbar-print text-foreground mt-3">
          <TableHeader className="print:table-header-group bg-gray-100 border-y">
            <TableRow>
              {[
                ['SECTEURS', ''],
                ['C.A BRUTE H/T', ''],
                ['C.A EXONERE', ''],
                ['C.A NET H/T', ''],
                ['REMISE', ''],
                ['NET VENTES', ''],
                ['R.G', ''],
                ['C.A TAXABLE', ''],
                ['TVA 19%', ''],
                ['TIMBRE', ''],
                ['TTC', '']
              ].map(([label, cls]) => (
                <TableHead
                  key={label}
                  className={`px-2 text-nowrap py-1 h-5 text-black font-medium border-r-[3px] border-white ${cls}`}
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <Suspense fallback={<TableLoadingSkeleton />}>
            {isLoading ? (
              <TableLoadingSkeleton />
            ) : (
              <TableBody>
                <TableRow>
                  {productionTableData.map(([data, cls], ind) => (
                    <TableCell
                      key={ind}
                      className={`px-2 text-nowrap py-1 h-5 text-black font-medium border-r-[3px] border-white ${cls}`}
                    >
                      {data}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  {dechetsTableData.map(([data, cls], ind) => (
                    <TableCell
                      key={ind}
                      className={`px-2 text-nowrap py-1 h-5 text-black font-medium border-r-[3px] border-white ${cls}`}
                    >
                      {data}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow className="font-bold bg-gray-100">
                  <TableCell
                    colSpan={7}
                    className={` text-nowrap  h-5 text-black font-medium border-r-[3px] border-white py-[1.5px] px-2 text-left`}
                  >
                    TOTAUX
                  </TableCell>
                  {totauxTableData.map(([data, cls], ind) => (
                    <TableCell
                      key={ind}
                      className={`px-2 text-nowrap py-1 h-5 text-black font-medium border-r-[3px] border-white ${cls}`}
                    >
                      {data}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            )}
          </Suspense>
        </Table>
        <div className="my-2" />
        {PriceInEnglish(taxable * 1.19, isLoading)}
        {LedgerFooter({ page: 1, pages: 1 })}
      </div>
    </div>
  )
}
