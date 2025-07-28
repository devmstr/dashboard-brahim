'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { PAYMENT_TYPES } from '@/config/global'
import { useScrollProgress } from '@/hooks/use-scroll'
import { amountToWords, calculateBillingSummary, cn, delay } from '@/lib/utils'
import { format } from 'date-fns'
import { Pencil, RefreshCcw } from 'lucide-react'
import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useMemo, useRef, useState } from 'react'
import './print.css'
import { toast } from '@/hooks/use-toast'
import { type Invoice } from '@/types'
import { update } from 'lodash'

export interface InvoiceProps {
  data: Invoice
  className?: string
}

export default function Invoice({ data: input, className }: InvoiceProps) {
  const [data, setData] = useState<Invoice>(input)
  // update data on mount
  useEffect(() => setData(input), [])

  const [editedId, setEditedId] = useState<string | undefined>(undefined)
  const componentRef = useRef<HTMLDivElement>(null)

  const headerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const totalsRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLTableRowElement>(null)

  const [itemsPerPage, setItemsPerPage] = useState(4)
  const [itemsPerPageLast, setItemsPerPageLast] = useState(2)

  useEffect(() => {
    const A4_HEIGHT = 1122 // in pixels (A4 at 96dpi)

    const header = headerRef.current?.offsetHeight || 0
    const footer = footerRef.current?.offsetHeight || 0
    const totals = totalsRef.current?.offsetHeight || 0
    const row = rowRef.current?.offsetHeight || 32

    const usableHeight = A4_HEIGHT - header - footer - 92 // paddings
    const usableHeightLastPage = A4_HEIGHT - header - totals - footer - 92

    const perPage = Math.floor(usableHeight / row)
    const perLastPage = Math.floor(usableHeightLastPage / row)

    if (perPage && perLastPage) {
      setItemsPerPage(perPage)
      setItemsPerPageLast(perLastPage)
    }
  }, [data.items])

  // Split pages dynamically
  const pages = useMemo(() => {
    const totalItems = data.items.length
    const chunks: Invoice['items'][] = []

    // Step 1: Chunk all items by normal page size
    for (let i = 0; i < totalItems; i += itemsPerPage) {
      chunks.push(data.items.slice(i, i + itemsPerPage))
    }

    // Step 2: Check if last page can accommodate totals
    if (chunks.length > 1) {
      const lastChunk = chunks[chunks.length - 1]

      if (lastChunk.length > itemsPerPageLast) {
        // Split it into a new page so totals won't overflow
        const overflowIndex = lastChunk.length - itemsPerPageLast
        const secondLastChunk = lastChunk.slice(0, overflowIndex)
        const newLastChunk = lastChunk.slice(overflowIndex)

        // Replace the last chunk and push the new last chunk
        chunks.splice(chunks.length - 1, 1, secondLastChunk, newLastChunk)
      }
    }

    return chunks
  }, [data.items, itemsPerPage, itemsPerPageLast])

  const billingSummary = useMemo(
    () =>
      calculateBillingSummary(data.items, {
        discountRate: data.discountRate,
        refundRate: data.refundRate,
        stampTaxRate: data.stampTaxRate,
        vatRate: 0.19
      }),
    [data.items, data.discountRate, data.refundRate, data.stampTaxRate]
  )

  // Handle payment type change
  const handlePaymentTypeChange = (value: (typeof PAYMENT_TYPES)[number]) => {
    setData((prev) => ({
      ...prev,
      paymentMode: value
    }))
    // If payment type is Espèces or Espèces + Versement, set stampTaxRate to 0.01 (1%)
    if (value === 'Espèces' || value === 'Espèces + Versement') {
      setData((prev) => ({
        ...prev,
        stampTaxRate: 0.01
      }))
    } else {
      setData((prev) => ({
        ...prev,
        stampTaxRate: 0
      }))
    }
  }

  const { refund, discount, stampTax, Total, totalHT, totalTTC, vat } =
    billingSummary

  // // send an update request on every change
  // async function onUpdate(data?: Invoice, signal?: AbortSignal) {
  //   try {
  //     const response = await fetch(`/api/invoices/${data?.id}`, {
  //       method: 'PATCH',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(data),
  //       signal
  //     })

  //     if (!response.ok) {
  //       const error = await response.json()
  //       throw new Error(
  //         error.details || 'Erreur lors de la mise à jour de la facture.'
  //       )
  //     }
  //     await delay(1500)
  //     toast({
  //       title: 'Succès !',
  //       description: 'La facture a été mise à jour avec succès.',
  //       variant: 'success'
  //     })
  //   } catch (error) {
  //     toast({
  //       title: 'Erreur',
  //       description:
  //         error instanceof Error
  //           ? error.message
  //           : 'Une erreur inconnue est survenue.',
  //       variant: 'destructive'
  //     })
  //     console.error('❌ Erreur lors de la mise à jour de la facture:', error)
  //   }
  // }

  // useEffect(() => {
  //   const controller = new AbortController()
  //   onUpdate(data, controller.signal)

  //   return () => {
  //     controller.abort()
  //   }
  // })

  const renderBillHeader = () => (
    <div className="print-header">
      <div className="flex justify-between items-start">
        <div className="w-full flex items-center justify-between ">
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
            <p className="text-[1.57rem] font-bold font-naskh-arabic ">
              ش . ذ . م . م . صونيـراس
            </p>
            <p className="text-xl font-poppins ">Capital: 104 002 000.00</p>
          </div>
          <div className="w-20 h-20 pl-[8px] -mt-[5px]  scale-95">
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
              value={data.id}
              className="w-[4.57rem] h-auto"
            />
            <span className="text-[0.745rem] w-20 text-center ">{data.id}</span>
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
        <div className="space-y-1 ">
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
        <div className="w-1/4 flex flex-col gap-1  text-sm font-geist-sans">
          {/* BC: always render input (screen) and value (print, if not empty) */}
          <div className="flex gap-[.2rem] items-center print:hidden">
            <strong className="font-medium">{'BC: '} </strong>
            <Input
              placeholder="002171"
              className="h-3 border-none focus-visible:ring-0 focus-visible:ring-offset-0  "
              value={data.purchaseOrder ?? undefined}
              onChange={(e) => {
                setData((prev) => ({
                  ...prev,
                  purchaseOrder: e.target.value
                }))
              }}
            />
          </div>
          {data.purchaseOrder && (
            <div className="hidden print:flex gap-[.2rem] items-center">
              <strong className="font-medium">{'BC: '} </strong>
              <span>{data.purchaseOrder}</span>
            </div>
          )}
          {/* BL: always render input (screen) and value (print, if not empty) */}
          <div className="flex gap-[.2rem] items-center print:hidden">
            <strong className="font-medium tracking-wider">{'BL: '} </strong>
            <Input
              placeholder="23-26/2025"
              className="h-3 border-none focus-visible:ring-0 focus-visible:ring-offset-0  "
              value={data.deliverySlip || ''}
              onChange={({ target: { value } }) => {
                setData((prev) => ({
                  ...prev,
                  deliverySlip: value
                }))
              }}
            />
          </div>
          {data.deliverySlip && (
            <div className="hidden print:flex gap-[.2rem] items-center">
              <strong className="font-medium tracking-widest">{'BL: '} </strong>
              <span>{data.deliverySlip}</span>
            </div>
          )}
        </div>
        <div className="w-2/4 flex justify-center text-center ">
          <h2 className="text-3xl -translate-y-1 font-bold font-poppins">
            FACTURE: {data.reference?.replace(/FF|PF/g, '')}
          </h2>
        </div>
        <div className="w-1/4 flex justify-end  text-right text-sm font-geist-sans">
          <p>Du: {format(new Date(), 'dd/MM/yyyy')}</p>
        </div>
      </div>
      <div className="text-base mt-4 ">
        <Separator
          style={{ backgroundColor: '#000' }}
          className="separator my-2 h-[1.4px] rounded "
        />
        <h3 className="font-semibold">Client</h3>
        <div className="flex w-full justify-between ">
          <div>
            <p className="font-medium uppercase">{data.name}</p>
            {/* client address only appear if it exist  */}
            {data.address && (
              <p className="capitalize font-normal">{data.address}</p>
            )}
          </div>
          <div className="text-sm font-geist-sans w-48">
            <p className="flex">
              <strong className="w-10">{'R.C: '}</strong>{' '}
              {data.tradeRegisterNumber}
            </p>
            <p className="flex">
              <strong className="w-10">{'N.I.F: '}</strong> {data.taxIdNumber}
            </p>
            <p className="flex">
              <strong className="w-10">{'A.I: '}</strong>{' '}
              {data.registrationArticle}
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
    <div className="print-footer  flex flex-col font-poppins text-xs">
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
    <div className="totals-section mt-3  font-geist-sans">
      <div className="flex justify-end text-sm">
        <div className="flex flex-col space-y-2">
          <div className="w-[15.4rem] pl-2 space-y-2 font-geist-sans ">
            <div
              className={cn(
                'flex justify-between',
                !data.discountRate && !data.refundRate && 'print:hidden'
              )}
            >
              <span>TOTAL BRUTE H.T</span>
              <span className="w-[6.5rem] pl-2">
                {Number(Total.toFixed(2)).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div
              className={cn(
                'flex justify-between border-t-[1.6px] pt-[1px]',
                !data.discountRate && 'print:hidden'
              )}
            >
              <div className="flex gap-1 items-center">
                <span>REMISE </span>
                <Input
                  value={
                    data.discountRate
                      ? (data.discountRate * 100).toFixed()
                      : undefined
                  }
                  type="number"
                  name="discount-percentage"
                  placeholder="0"
                  onChange={({ target: { value: v } }) => {
                    let number = Math.max(0, Math.min(Number(v), 25))

                    if (number !== Number(v)) {
                      toast({
                        title: 'Avertissement',
                        description:
                          'Le taux de remise doit être entre 1% et 25%',
                        variant: 'warning'
                      })
                      return
                    }

                    setData((prev) => ({
                      ...prev,
                      discountRate: number / 100
                    }))
                  }}
                  className={cn(
                    'p-0 m-0 w-5 text-end text-muted-foreground print:text-foreground  h-6 focus-visible:ring-0 rounded-none focus-visible:ring-offset-0 border-none'
                  )}
                />
                %
              </div>
              <span className="w-[6.5rem] pl-2 font-geist-sans">
                {Number(discount.toFixed(2)).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div
              className={cn(
                'flex justify-between h-6 items-center border-t-[1.6px] pt-[1px]',
                !data.refundRate && 'print:hidden'
              )}
            >
              <div className="flex gap-1 items-center">
                <span>R.G</span>
                <Input
                  value={
                    data.refundRate
                      ? (data.refundRate * 100).toFixed()
                      : undefined
                  }
                  type="number"
                  name="guarantee-refund"
                  placeholder="0"
                  onChange={({ target: { value: v } }) => {
                    let number = Math.max(0, Math.min(Number(v), 50)) // clamp between 1 and 50

                    if (number !== Number(v)) {
                      toast({
                        title: 'Avertissement',
                        description: 'Le taux doit être entre 1% et 50%',
                        variant: 'warning'
                      })
                    }

                    setData((prev) => ({
                      ...prev,
                      refundRate: number / 100
                    }))
                  }}
                  className={cn(
                    'p-0 m-0 w-6 text-end text-muted-foreground  print:text-foreground    h-6 focus-visible:ring-0 rounded-none focus-visible:ring-offset-0 border-none'
                  )}
                />
                %
              </div>
              <span className="w-[6.5rem] pl-2 font-geist-sans">
                {Number(refund.toFixed(2)).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
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
            <div
              className={cn(
                'flex justify-between border-t-[1.6px] pt-[1px]',
                !data.stampTaxRate && 'print:hidden'
              )}
            >
              <div className="flex gap-1 items-center">
                <span>TIMBRE</span>
                <Input
                  value={
                    data.stampTaxRate ? (data.stampTaxRate * 100).toFixed() : 0
                  }
                  type="number"
                  name="stamp-tax"
                  placeholder="0"
                  onChange={({ target: { value: v } }) => {
                    let number = Math.max(0, Math.min(Number(v), 1))

                    if (number !== Number(v)) {
                      toast({
                        title: 'Avertissement',
                        description:
                          'Le taux de timbre doit être entre 0% et 1%',
                        variant: 'warning'
                      })
                      return
                    }

                    setData((prev) => ({
                      ...prev,
                      stampTaxRate: number / 100
                    }))
                  }}
                  className={cn(
                    'p-0 m-0 w-5 text-end  h-6 text-muted-foreground print:text-foreground   focus-visible:ring-0 rounded-none focus-visible:ring-offset-0 border-none'
                  )}
                />
                %
              </div>

              <span className="w-24 ">
                {Number(stampTax.toFixed(2)).toLocaleString('fr-FR', {
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
            <Select
              value={data.paymentMode ?? undefined}
              onValueChange={handlePaymentTypeChange}
            >
              <SelectTrigger className="w-fit border-none ring-0 h-fit py-1 px-0 ring-offset-0 rounded-none focus:ring-0 disabled:opacity-100">
                <SelectValue placeholder="Sélectionner le mode de paiement" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* REMARQUE: show textarea on screen, show value in print only if not empty */}
          <div className={cn('space-y-1 print:hidden')}>
            <h3 className="font-semibold">REMARQUE</h3>
            <Textarea
              className="w-full min-h-20 group focus-visible:ring-0 ring-offset-0 rounded-md focus-visible:ring-offset-0 "
              placeholder="Saisissez des remarques pour cette facture..."
              value={data.note ?? undefined}
              onChange={({ target: { value } }) => {
                setData((prev) => ({ ...prev, note: value }))
              }}
            />
          </div>
          {data.note && (
            <div className="hidden print:block space-y-1">
              <h3 className="font-semibold">REMARQUE</h3>
              <p className="">{data.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderTable = (pageItems: Invoice['items']) => {
    return (
      <Table className="font-geist-sans text-sm w-full font-light hide-scrollbar-print ">
        <TableHeader className="print:table-header-group bg-gray-100  border-y">
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
              <TableCell className="py-[3px] px-2 h-8">{item.number}</TableCell>
              <TableCell className="py-[3px] px-2 h-8 relative">
                {editedId === item.id ? (
                  <Input
                    value={item.label ?? undefined}
                    onChange={(e) => {
                      const newValue = e.target.value
                      setData((prev) => ({
                        ...prev,
                        items: prev.items.map((nonEditedItem) =>
                          nonEditedItem.id === item.id
                            ? { ...nonEditedItem, label: newValue }
                            : nonEditedItem
                        )
                      }))
                    }}
                    onBlur={() => setEditedId(undefined)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditedId(undefined)
                      }
                    }}
                    autoFocus
                    className="h-6 py-1 focus-visible:ring-0 ring-0 border-none rounded-none "
                  />
                ) : (
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 mr-1 opacity-50 hover:opacity-100"
                      onClick={() => {
                        setEditedId(item.id)
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                      <span className="sr-only">Edit description</span>
                    </Button>
                    {item.label}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-left py-[3px] px-2 h-8 font-geist-sans">
                {item.quantity}
              </TableCell>
              <TableCell className="text-left py-[3px] px-2 h-8 font-geist-sans">
                {item.price}
              </TableCell>
              <TableCell className="text-left py-[3px] px-2 h- font-geist-sans">
                {Number(
                  (
                    item.amount || Number(item.price) * Number(item.quantity)
                  )?.toFixed(2)
                ).toLocaleString('fr-FR', {
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

  const [isUpdating, setIsUpdating] = useState<boolean>(false)

  const updateData = async () => {
    setIsUpdating(true)
    try {
      const invoice = await fetch(`/api/invoices/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!invoice.ok) {
        const errorData = await invoice.json().catch(() => ({}))
        throw new Error(
          errorData?.message || 'Erreur lors de la mise à jour de la facture'
        )
      }
      await delay(500)
      toast({
        title: 'Succès !',
        description: 'La facture a été mise à jour avec succès.',
        variant: 'success'
      })
    } catch (e) {
      console.log(e)
      // Optionally handle error (e.g., show toast)
      toast({
        title: 'Erreur',
        description:
          'Une erreur est survenue lors de la mise à jour des données',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // useEffect(() => {
  //   updateData()
  // }, [data])

  return (
    <div ref={componentRef} className="flex flex-col gap-6 print:gap-0">
      {pages.map((pageItems, pageIndex) => (
        <div
          key={pageIndex}
          className="print:h-[297mm] min-h-[297mm] w-[210mm] font-geist-sans shadow-2xl rounded-xl print:shadow-none print:rounded-none pt-10 px-9 pb-8 bg-white flex flex-col justify-start"
        >
          <div ref={pageIndex === 0 ? headerRef : null}>
            {renderBillHeader()}
          </div>

          {/* Table */}
          <div className="">
            {renderTable(
              pageItems.map((item, i) =>
                pageIndex === 0 && i === 0
                  ? { ...item, _ref: rowRef } // mark first row with ref
                  : item
              )
            )}
          </div>

          {/* Totals only on the last page */}
          {pageIndex === pages.length - 1 && (
            <div ref={totalsRef}>{renderTotals()}</div>
          )}

          <div className="mt-auto" ref={pageIndex === 0 ? footerRef : null}>
            {renderBillFooter({
              page: pageIndex + 1,
              pages: pages.length
            })}
          </div>
        </div>
      ))}
      <Button
        onClick={() => updateData()}
        className="w-full flex gap-2 rounded-xl h-12 print:hidden shadow-lg group hover:text-secondary mt-3"
        variant="outline"
      >
        {isUpdating ? (
          <RefreshCcw className={'w-4 h-4 animate-spin'} />
        ) : (
          <RefreshCcw className={'w-4 h-4 '} />
        )}
        Mise à jour
      </Button>
    </div>
  )
}
