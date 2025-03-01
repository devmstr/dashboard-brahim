'use client'
import { Button } from '@/components/ui/button'
import { Mouse, Printer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { format } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import { amountToWords, calculateBillingSummary, cn } from '@/lib/utils'
import { useRef, useState, useEffect, useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useScrollProgress } from '@/hooks/use-scroll'
import { Input } from '@/components/ui/input'
import { InvoiceItem } from '@/types'

interface InvoiceProps {
  invoiceId: string
  qrAddress: string
  bc: string
  bl: string[]
  client: {
    name: string
    address: string
    rc: string
    nif: string
    ai: string
  }
  items: InvoiceItem[]
  className?: string
}

const ITEMS_PER_PRINT_PAGE = 13

export default function Invoice({
  invoiceId,
  qrAddress,
  bc,
  bl,
  client,
  items = [],
  className
}: InvoiceProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollYProgress = useScrollProgress(scrollRef)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const [guaranteeRefund, setGuaranteeRefund] = useState<number>()
  const [discountPercentage, setDiscountPercentage] = useState<number>()
  const [stampTax, setStampTax] = useState<number>()

  const billingSummary = useMemo(
    () =>
      calculateBillingSummary(items, {
        discountRate: discountPercentage,
        guaranteeRefundAmount: guaranteeRefund,
        stampTaxRate: stampTax,
        vatRate: 0.19
      }),
    [items, discountPercentage, guaranteeRefund, stampTax]
  )

  const { remise, rg, timbre, totalHTA_DED, totalHT, totalTTC, tva } =
    billingSummary

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      setShowScrollIndicator(value < 1)
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  const handlePrint = () => {
    window.print()
  }

  const renderBillHeader = () => (
    <div className="print-header">
      <div className="flex justify-between items-start">
        <div className="w-full flex items-center justify-between ">
          <div className="w-[5.4rem] h-[5.4rem] translate-y-1">
            <Image
              id="logo-img"
              className="w-full "
              src={'/images/logo.svg'}
              alt={'company-logo'}
              width={250}
              height={250}
              priority
            />
          </div>
          <div className="text-center font-poppins">
            <h1 className="text-[2rem] font-extrabold font-poppins translate-y-[6px]">
              SARL SO.NE.RA.S
            </h1>
            <p className="text-[1.56rem] font-bold font-naskh-arabic ">
              ش . ذ . م . م . صونيـراس
            </p>
            <p className="text-xl font-poppins ">Capital: 104 002 000.00</p>
          </div>
          <div className="w-20 h-20 pl-[8px] -mt-[5px] scale-95">
            {/* <QRCodeSVG value={qrAddress} className="w-[4.57rem] h-auto" /> */}
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
              value={qrAddress}
              className="w-[4.57rem] h-auto"
            />
            <span className="text-[0.745rem] -ml-[1px]">{qrAddress}</span>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-between text-sm mt-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span>Adresse: Z.I. Garat taam B. P.N 46 Bounoura - 47014</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Email: info@okindustrie.com</span>
          </div>
        </div>
        <div className="space-y-1 text-left">
          <div className="flex items-center justify-end gap-2">
            <span>Tel | Fax: 029 27 22 06</span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="translate-x-[1px]">Mobile: 07 70 49 72 90</span>
          </div>
        </div>
      </div>
      <Separator
        style={{ backgroundColor: '#000' }}
        className="separator my-2 h-[1.8px] rounded text-black"
      />
      <div className="flex justify-between">
        <div className="space-y-1 text-sm font-geist-sans">
          <p>
            <strong className="font-medium">{'BC: '}</strong>
            {bc}
          </p>
          <p>
            <strong className="font-medium">{'BL: '} </strong>
            <span className="ml-[2px]">{`${bl[0].split('/')[0]}-${
              bl[bl.length - 1].split('/')[0]
            }/${bl[0].split('/')[1]}`}</span>
          </p>
        </div>
        <div className="text-center ">
          <h2 className="text-3xl -translate-y-1 font-semibold font-poppins">
            FACTURE: {invoiceId}
          </h2>
        </div>
        <div className="text-right text-sm font-geist-sans">
          <p>Du: {format(new Date(), 'dd/MM/yyyy')}</p>
        </div>
      </div>
      <div className="text-base mt-4 ">
        <h3 className="font-semibold">Client</h3>
        <Separator
          style={{ backgroundColor: '#000' }}
          className="separator my-2 h-[1.4px] rounded "
        />
        <div className="flex w-full justify-between ">
          <div>
            <p className="font-medium uppercase">{client.name}</p>
            <p className="capitalize font-normal">{client.address}</p>
          </div>
          <div className="text-sm font-geist-sans">
            <p>
              <strong>{'R.C: '}</strong> {client.rc}
            </p>
            <p>
              <strong>{'N.I.F: '}</strong> {client.nif}
            </p>
            <p>
              <strong>{'A.I: '}</strong> {client.ai}
            </p>
          </div>
        </div>
        <Separator
          style={{ backgroundColor: '#000' }}
          className="separator my-2 h-[1px] rounded "
        />
      </div>
    </div>
  )

  const renderBillFooter = (props?: { page?: number; pages?: number }) => (
    <div className="print-footer  flex flex-col mt-auto font-poppins text-xs">
      <div className="hidden print:block text-right">
        <p>
          Page: {props?.page}|
          <span className="text-muted-foreground">{props?.pages}</span>
        </p>
      </div>
      <div>
        <Separator
          style={{ backgroundColor: '#000' }}
          className="my-2 h-[1.6px] rounded"
        />
        <div className="grid grid-cols-4 gap-1 text-center ">
          <p className="font-sans">
            <strong className="">R.C:</strong> 97/B/0862043
          </p>
          <p className="font-sans translate-x-1">
            <strong className="">N.I.F:</strong> 99747086204393
          </p>
          <p className="font-sans">
            <strong className="">A.I:</strong> 471006003
          </p>
          <p className="font-sans">
            <strong className="">N.I.S:</strong> 096947100010442
          </p>
        </div>
        <Separator
          style={{ backgroundColor: '#000' }}
          className="my-2 h-[1px] rounded"
        />
        <div className="grid grid-cols-4 gap-1 mt-1  font-geist-sans text-end ">
          <p className="">
            <strong className="">BEA:</strong>
            00200028280286002213
          </p>
          <p className="translate-x-1">
            <strong className="">BNA:</strong>
            00100291030035005601
          </p>
          <p className="">
            <strong className="">SGA:</strong>
            02100551113003458571
          </p>
          <p className="">
            <strong className="">AGB:</strong>
            03200001229251120896
          </p>
        </div>
      </div>
    </div>
  )

  const renderTotals = () => (
    <div className="totals-section mt-3 ">
      <div className="flex justify-end text-sm">
        <div className="flex flex-col space-y-2">
          <div className="w-[15.4rem] pl-2 space-y-2 font-geist-sans ">
            <div
              className={cn(
                'flex justify-between',
                !discountPercentage && !rg && 'print:hidden'
              )}
            >
              <span>TOTAL H.T A/DED</span>
              <span className="w-[6.5rem] pl-2">
                {Number(totalHTA_DED.toFixed(2)).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div
              className={cn(
                'flex justify-between border-t-[1.6px] pt-[1px]',
                !discountPercentage && 'print:hidden'
              )}
            >
              <div className="flex gap-1 items-center">
                <span>REMISE </span>
                <Input
                  value={
                    discountPercentage
                      ? (discountPercentage * 100).toFixed()
                      : undefined
                  }
                  type="number"
                  name="discount-percentage"
                  placeholder="0"
                  onChange={({ target: { value: v } }) => {
                    if (Number(v) < 25) setDiscountPercentage(Number(v) / 100)
                  }}
                  className={cn(
                    'p-0 m-0 w-5 text-end text-muted-foreground print:text-foreground  h-6 focus-visible:ring-0 rounded-none focus-visible:ring-offset-0 border-none'
                  )}
                />
                %
              </div>
              <span className="w-[6.5rem] pl-2 font-geist-sans">
                {Number(remise.toFixed(2)).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div
              className={cn(
                'flex justify-between h-6 items-center border-t-[1.6px] pt-[1px]',
                !rg && 'print:hidden'
              )}
            >
              <span>R.G</span>
              <Input
                value={guaranteeRefund || undefined}
                type="number"
                name="guarantee-refund"
                placeholder="0"
                onChange={({ target: { value: v } }) => {
                  if (Number(v) < totalHTA_DED - remise)
                    setGuaranteeRefund(Number(v))
                }}
                className={cn(
                  'p-0 m-0 w-24 text-start text-muted-foreground print:text-foreground    h-6 focus-visible:ring-0 rounded-none focus-visible:ring-offset-0 border-none'
                )}
              />
            </div>
            <div className="flex justify-between border-t-[1.6px] pt-[1px]">
              <span>TOTAL H.T</span>
              <span className="w-[6.5rem] pl-2">
                {Number(totalHT.toFixed(2)).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="flex justify-between border-t-[1.6px] pt-[1px]">
              <span>TVA 19%</span>
              <span className="w-[6.5rem] pl-2">
                {Number(tva.toFixed(2)).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div
              className={cn(
                'flex justify-between border-t-[1.6px] pt-[1px]',
                !stampTax && 'print:hidden'
              )}
            >
              <div className="flex gap-1 items-center">
                <span>TIMBRE</span>
                <Input
                  value={stampTax ? (stampTax * 100).toFixed() : undefined}
                  type="number"
                  name="stamp-tax"
                  placeholder="0"
                  onChange={({ target: { value } }) => {
                    if (Number(value) >= 0 && Number(value) < 2) {
                      setStampTax(Number(value) / 100)
                    }
                  }}
                  className={cn(
                    'p-0 m-0 w-5 text-end  h-6 text-muted-foreground print:text-foreground   focus-visible:ring-0 rounded-none focus-visible:ring-offset-0 border-none'
                  )}
                />
                %
              </div>

              <span className="w-24 ">
                {Number(timbre.toFixed(2)).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>
          <div className="flex justify-between font-bold bg-gray-100  py-2 pl-2 w-[15.4rem] border-y font-geist-sans">
            <span>TOTAL TTC</span>
            <span className="w-[6.5rem] pl-2 ">
              {Number(totalTTC.toFixed(2)).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="amount-in-words">
        <div className="space-y-1 text-sm print:text-black mt-1">
          <p className="font-semibold">
            ARRÊTÉE LA PRÉSENTE FACTURE A LA SOMME EN TTC DE:
          </p>
          <p className="capitalize">{amountToWords(totalTTC)}</p>
        </div>
      </div>
      <div className="payment-details">
        <div className="space-y-2 text-sm mt-2">
          <div className="space-y-1">
            <h3 className="font-semibold">MODE DE RÉGALEMENT</h3>
            <p>Espèce Plus Virement</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">REMARQUE</h3>
            <p>Le client paie 60 % en espèces et 40 % par virement bancaire.</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTable = (pageItems: InvoiceItem[]) => {
    return (
      <Table className="text-sm w-full font-light hide-scrollbar-print ">
        <TableHeader className="print:table-header-group bg-gray-100 print:bg-gray-300/80 border-y">
          <TableRow className="">
            <TableHead className="px-2 py-2 h-8 w-8 text-left text-black font-medium border-r-[3px] border-white ">
              N°
            </TableHead>
            <TableHead className="px-2 py-2 h-8 text-center text-black font-medium border-r-[3px] border-white ">
              Désignation
            </TableHead>
            <TableHead className="px-2 py-2 h-8 w-8 text-left text-black font-medium border-r-[3px] border-white ">
              Qté
            </TableHead>
            <TableHead className="px-2 py-2 h-8 w-24 text-left text-black font-medium border-r-[3px] border-white ">
              Prix U/H.T
            </TableHead>
            <TableHead className="px-2 py-2 h-8 w-[6.5rem] text-left text-black font-medium border-r-[3px] border-white ">
              Montant
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="py-[3px] px-2 h-8">{item.id}</TableCell>
              <TableCell className="py-[3px] px-2 h-8">
                {item.designation}
              </TableCell>
              <TableCell className="text-left py-[3px] px-2 h-8 font-geist-sans">
                {item.quantity}
              </TableCell>
              <TableCell className="text-left py-[3px] px-2 h-8 font-geist-sans">
                {item.priceHT}
              </TableCell>
              <TableCell className="text-left py-[3px] px-2 h- font-geist-sans">
                {Number(item.amount.toFixed(2)).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <>
      <div
        className={cn(
          'relative print:bg-transparent flex flex-col min-h-[297mm]  w-[210mm] pt-12 px-9 pb-8  print:hidden font-poppins ',
          className
        )}
      >
        <div className="absolute z-20  top-3 w-full justify-center items-center -translate-x-9 px-9 ">
          <Button
            onClick={handlePrint}
            className=" w-full  flex gap-2  print:hidden"
            variant="outline"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>

        {renderBillHeader()}

        <div className="relative">
          <ScrollArea
            ref={scrollRef}
            className="max-h-[220px] print:h-fit  mt-2 "
          >
            {renderTable(items)}
          </ScrollArea>
          {showScrollIndicator ||
            (items.length > 5 && (
              <div className="absolute z-50 w-full -bottom-4 flex justify-center print:hidden">
                <Mouse className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
        </div>

        {renderTotals()}
        {renderBillFooter()}
      </div>

      {/* Print-only content */}
      <div className="hidden print:block print:w-[210mm] print:h-[297mm]">
        {(() => {
          const pages: InvoiceItem[][] = []
          const totalItems = items.length

          // If there are 2 or fewer items, simply push all on one page.
          if (totalItems <= 4) {
            pages.push(items)
          } else {
            // Reserve the last 2 items for the final page.
            const mainSection = items.slice(0, totalItems - 2)
            const lastPage = items.slice(totalItems - 2)

            // Determine the number of main pages.
            // We want each main page to have at most ITEMS_PER_PRINT_PAGE items.
            // Using the ideal even split:
            const numMainPages = Math.ceil(
              mainSection.length / ITEMS_PER_PRINT_PAGE
            )

            // Helper function to split an array evenly into n chunks.
            function chunkEvenly<T>(array: T[], n: number): T[][] {
              const result: T[][] = []
              const len = array.length
              const base = Math.floor(len / n)
              let remainder = len % n
              let start = 0
              for (let i = 0; i < n; i++) {
                // Distribute the extra items (if any) among the first 'remainder' chunks.
                const extra = remainder > 0 ? 1 : 0
                result.push(array.slice(start, start + base + extra))
                start += base + extra
                if (remainder > 0) remainder--
              }
              return result
            }

            let mainPages = chunkEvenly(mainSection, numMainPages)

            // As a safety check, if any chunk exceeds ITEMS_PER_PRINT_PAGE,
            // fall back to simple chunking.
            const refinedMainPages: InvoiceItem[][] = []
            mainPages.forEach((page) => {
              if (page.length > ITEMS_PER_PRINT_PAGE) {
                for (let i = 0; i < page.length; i += ITEMS_PER_PRINT_PAGE) {
                  refinedMainPages.push(page.slice(i, i + ITEMS_PER_PRINT_PAGE))
                }
              } else {
                refinedMainPages.push(page)
              }
            })
            mainPages = refinedMainPages

            // Add the main pages and then the final page (with 2 items).
            pages.push(...mainPages)
            pages.push(lastPage)
          }

          return pages.map((pageItems, pageIndex) => (
            <div key={pageIndex} className="print-page font-poppins">
              {renderBillHeader()}
              {renderTable(pageItems)}
              {pageIndex === pages.length - 1 && renderTotals()}
              {renderBillFooter({
                page: pageIndex + 1,
                pages: pages.length
              })}
            </div>
          ))
        })()}
      </div>
    </>
  )
}
