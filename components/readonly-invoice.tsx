'use client'

import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { amountToWords, calculateBillingSummary, cn } from '@/lib/utils'
import type { InvoiceItem } from '@/types'
import { format } from 'date-fns'
import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useMemo, useRef } from 'react'

const ITEMS_PER_PRINT_PAGE = 4

export type InvoiceMetadata = {
  items: InvoiceItem[]
  purchaseOrder?: string
  deliverySlip?: string
  note?: string
  discountRate?: number
  refundRate?: number
  stampTaxRate?: number
  paymentType?: string
}

export interface ReadOnlyInvoiceProps {
  id: string
  invoiceNumber: string
  qrAddress: string
  paymentMode?: string
  note?: string
  client: {
    name: string
    address?: string
    rc: string
    nif: string
    ai: string
  }
  items: InvoiceItem[]
  metadata?: InvoiceMetadata
  className?: string
}

const printStyles = `
  @media print {
    .print-page {
      page-break-after: always;
    }
    .print-page:last-child {
      page-break-after: auto;
    }
    .no-print {
      display: none !important;
    }
  }
`

export default function ReadOnlyInvoice({
  id,
  invoiceNumber,
  qrAddress,
  paymentMode = 'Espèce',
  note,
  client,
  items = [],
  className,
  metadata
}: ReadOnlyInvoiceProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  // Use metadata items if available, otherwise use props items
  const invoiceItems = useMemo(() => {
    if (metadata && Array.isArray(metadata.items)) {
      return metadata.items.map((metaItem, idx) => ({
        ...items[idx],
        ...metaItem,
        label: metaItem.label || items[idx]?.label || ''
      }))
    }
    return items
  }, [metadata, items])

  const billingSummary = useMemo(
    () =>
      calculateBillingSummary(invoiceItems, {
        discountRate: metadata?.discountRate || 0,
        refundRate: metadata?.refundRate || 0,
        stampTaxRate: metadata?.stampTaxRate || 0,
        vatRate: 0.19
      }),
    [invoiceItems, metadata]
  )

  useEffect(() => {
    // Add print styles to document head
    const styleElement = document.createElement('style')
    styleElement.innerHTML = printStyles
    document.head.appendChild(styleElement)

    return () => {
      // Clean up when component unmounts
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement)
      }
    }
  }, [])

  const { refund, discount, stampTax, Total, totalHT, totalTTC, vat } =
    billingSummary

  const renderBillHeader = () => (
    <div className="print-header">
      <div className="flex justify-between items-start">
        <div className="w-full flex items-center justify-between">
          <div className="w-[5.4rem] h-[5.4rem] translate-y-1">
            <Image
              id="logo-img"
              className="w-full"
              src={'/images/logo.svg'}
              alt={'company-logo'}
              width={250}
              height={250}
              priority
            />
          </div>
          <div className="text-center font-poppins">
            <h1 className="text-[2rem] font-bold font-poppins translate-y-[6px]">
              SARL SO.NE.RA.S
            </h1>
            <p className="text-[1.57rem] font-bold font-naskh-arabic">
              ش . ذ . م . م . صونيـراس
            </p>
            <p className="text-xl font-poppins">Capital: 104 002 000.00</p>
          </div>
          <div className="w-20 h-20 pl-[8px] -mt-[5px] scale-95">
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
            <span className="text-[0.745rem] w-20 text-center">
              {qrAddress}
            </span>
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
        className="separator my-2 h-[1.8px] rounded text-black"
      />
      <div className="w-full flex justify-between items-start">
        <div className="w-1/4 flex flex-col gap-1 text-sm font-geist-sans">
          {metadata?.purchaseOrder && (
            <div className="flex gap-[.2rem] items-center">
              <strong className="font-medium">BC: </strong>
              <span>{metadata.purchaseOrder}</span>
            </div>
          )}
          {metadata?.deliverySlip && (
            <div className="flex gap-[.2rem] items-center">
              <strong className="font-medium tracking-widest">BL: </strong>
              <span>{metadata.deliverySlip}</span>
            </div>
          )}
        </div>
        <div className="w-2/4 flex justify-center text-center">
          <h2 className="text-3xl -translate-y-1 font-bold font-poppins">
            FACTURE: {invoiceNumber.replace(/FF|FP/g, '')}
          </h2>
        </div>
        <div className="w-1/4 flex justify-end text-right text-sm font-geist-sans">
          <p>Du: {format(new Date(), 'dd/MM/yyyy')}</p>
        </div>
      </div>
      <div className="text-base mt-4">
        <Separator
          style={{ backgroundColor: '#000' }}
          className="separator my-2 h-[1.4px] rounded"
        />
        <h3 className="font-semibold">Client</h3>
        <div className="flex w-full justify-between">
          <div>
            <p className="font-medium uppercase">{client.name}</p>
            {client.address && (
              <p className="capitalize font-normal">{client.address}</p>
            )}
          </div>
          <div className="text-sm font-geist-sans">
            <p className="flex">
              <strong className="w-10">R.C: </strong> {client.rc}
            </p>
            <p className="flex">
              <strong className="w-10">N.I.F: </strong> {client.nif}
            </p>
            <p className="flex">
              <strong className="w-10">A.I: </strong> {client.ai}
            </p>
          </div>
        </div>
        <Separator
          style={{ backgroundColor: '#000' }}
          className="separator my-2 h-[1px] rounded"
        />
      </div>
    </div>
  )

  const renderBillFooter = (props?: { page?: number; pages?: number }) => (
    <div className="print-footer flex flex-col mt-auto font-poppins text-xs">
      <div className="text-right">
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
        <div className="grid grid-cols-4 gap-1 text-center">
          <p className="font-sans">
            <strong>R.C:</strong> 97/B/0862043
          </p>
          <p className="font-sans translate-x-1">
            <strong>N.I.F:</strong> 99747086204393
          </p>
          <p className="font-sans">
            <strong>A.I:</strong> 471006003
          </p>
          <p className="font-sans">
            <strong>N.I.S:</strong> 096947100010442
          </p>
        </div>
        <Separator
          style={{ backgroundColor: '#000' }}
          className="my-2 h-[1px] rounded"
        />
        <div className="grid grid-cols-4 gap-1 mt-1 font-geist-sans text-end">
          <p>
            <strong>BEA:</strong>
            00200028280286002213
          </p>
          <p className="translate-x-1">
            <strong>BNA:</strong>
            00100291030035005601
          </p>
          <p>
            <strong>SGA:</strong>
            02100551113003458571
          </p>
          <p>
            <strong>AGB:</strong>
            03200001229251120896
          </p>
        </div>
      </div>
    </div>
  )

  const renderTotals = () => (
    <div className="totals-section mt-3 font-geist-sans">
      <div className="flex justify-end text-sm">
        <div className="flex flex-col space-y-2">
          <div className="w-[15.4rem] pl-2 space-y-2 font-geist-sans">
            {(metadata?.discountRate || metadata?.refundRate) && (
              <div className="flex justify-between">
                <span>TOTAL BRUTE H.T</span>
                <span className="w-[6.5rem] pl-2">
                  {Number(Total.toFixed(2)).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            )}
            {metadata?.discountRate && (
              <div className="flex justify-between border-t-[1.6px] pt-[1px]">
                <div className="flex gap-1 items-center">
                  <span>REMISE {(metadata.discountRate * 100).toFixed()}%</span>
                </div>
                <span className="w-[6.5rem] pl-2 font-geist-sans">
                  {Number(discount.toFixed(2)).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            )}
            {metadata?.refundRate && (
              <div className="flex justify-between h-6 items-center border-t-[1.6px] pt-[1px]">
                <div className="flex gap-1 items-center">
                  <span>R.G {(metadata.refundRate * 100).toFixed()}%</span>
                </div>
                <span className="w-[6.5rem] pl-2 font-geist-sans">
                  {Number(refund.toFixed(2)).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t-[1.6px] pt-[1px]">
              <span>TOTAL NET H.T</span>
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
                {Number(vat.toFixed(2)).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            {metadata?.stampTaxRate && (
              <div className="flex justify-between border-t-[1.6px] pt-[1px]">
                <div className="flex gap-1 items-center">
                  <span>TIMBRE {(metadata.stampTaxRate * 100).toFixed()}%</span>
                </div>
                <span className="w-24">
                  {Number(stampTax.toFixed(2)).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            )}
          </div>
          <div className="flex justify-between font-bold bg-gray-100 py-2 pl-2 w-[15.4rem] border-y font-geist-sans">
            <span>TOTAL TTC</span>
            <span className="w-[6.5rem] pl-2">
              {Number(totalTTC.toFixed(2)).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="amount-in-words">
        <div className="space-y-1 text-sm mt-1">
          <p className="font-semibold">
            ARRÊTÉE LA PRÉSENTE FACTURE A LA SOMME EN TTC DE:
          </p>
          <p className="capitalize">{amountToWords(totalTTC)}</p>
        </div>
      </div>
      <div className="payment-details">
        <div className="space-y-2 text-sm mt-2">
          {metadata?.paymentType ||
            (paymentMode && (
              <div className="space-y-1">
                <h3 className="font-semibold">MODE DE RÉGALEMENT</h3>
                <p>{metadata?.paymentType || paymentMode}</p>
              </div>
            ))}
          {metadata?.note ||
            (note && (
              <div className="space-y-1">
                <h3 className="font-semibold">REMARQUE</h3>
                <p>{metadata?.note || note}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )

  const renderTable = (pageItems: InvoiceItem[]) => {
    return (
      <Table className="font-geist-sans text-sm w-full font-light">
        <TableHeader className="bg-gray-100 border-y">
          <TableRow>
            <TableHead className="px-2 py-2 h-8 w-8 text-left text-black font-medium border-r-[3px] border-white">
              N°
            </TableHead>
            <TableHead className="px-2 py-2 h-8 text-center text-black font-medium border-r-[3px] border-white">
              Désignation
            </TableHead>
            <TableHead className="px-2 py-2 h-8 w-8 text-left text-black font-medium border-r-[3px] border-white">
              Qté
            </TableHead>
            <TableHead className="px-2 py-2 h-8 w-24 text-left text-black font-medium border-r-[3px] border-white">
              Prix U/H.T
            </TableHead>
            <TableHead className="px-2 py-2 h-8 w-[6.5rem] text-left text-black font-medium border-r-[3px] border-white">
              Montant
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="py-[3px] px-2 h-8">{item.id}</TableCell>
              <TableCell className="py-[3px] px-2 h-8">{item.label}</TableCell>
              <TableCell className="text-left py-[3px] px-2 h-8 font-geist-sans">
                {item.quantity}
              </TableCell>
              <TableCell className="text-left py-[3px] px-2 h-8 font-geist-sans">
                {item.price}
              </TableCell>
              <TableCell className="text-left py-[3px] px-2 h-8 font-geist-sans">
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

  // Pagination logic
  const pages: InvoiceItem[][] = useMemo(() => {
    const result: InvoiceItem[][] = []
    const totalItems = invoiceItems.length

    if (totalItems <= 4) {
      result.push(invoiceItems)
    } else {
      const mainSection = invoiceItems.slice(0, totalItems - 2)
      const lastPage = invoiceItems.slice(totalItems - 2)

      const numMainPages = Math.ceil(mainSection.length / ITEMS_PER_PRINT_PAGE)

      function chunkEvenly<T>(array: T[], n: number): T[][] {
        const chunks: T[][] = []
        const len = array.length
        const base = Math.floor(len / n)
        let remainder = len % n
        let start = 0
        for (let i = 0; i < n; i++) {
          const extra = remainder > 0 ? 1 : 0
          chunks.push(array.slice(start, start + base + extra))
          start += base + extra
          if (remainder > 0) remainder--
        }
        return chunks
      }

      let mainPages = chunkEvenly(mainSection, numMainPages)

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

      result.push(...mainPages)
      result.push(lastPage)
    }

    return result
  }, [invoiceItems])

  return (
    <div
      className={cn('flex flex-col w-[210mm] gap-8 font-geist-sans', className)}
    >
      <div ref={componentRef} className="flex flex-col gap-6">
        {pages.map((pageItems, pageIndex) => (
          <div
            key={pageIndex}
            className={cn(
              'h-[297mm] w-[210mm] font-geist-sans shadow-2xl rounded-xl pt-10 px-9 pb-8 bg-white flex flex-col',
              pageIndex < pages.length - 1 && 'print-page'
            )}
          >
            {renderBillHeader()}
            {renderTable(pageItems)}
            {pageIndex === pages.length - 1 && renderTotals()}
            {renderBillFooter({
              page: pageIndex + 1,
              pages: pages.length
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
