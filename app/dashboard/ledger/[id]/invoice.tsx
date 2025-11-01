'use client'
import { Selector } from '@/components/selector'
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
import { calculateBillingSummary } from '@/helpers/invoice'
import { amountToWords } from '@/helpers/price-to-string'
import { toast } from '@/hooks/use-toast'
import { cn, formatPrice } from '@/lib/utils'
import { type Invoice } from '@/types'
import { format } from 'date-fns'
import { Pencil, RefreshCcw } from 'lucide-react'
import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useMemo, useRef, useState } from 'react'
import './print.css'

export interface InvoiceProps {
  data: Invoice
  className?: string
}

export default function Invoice({ data: input, className }: InvoiceProps) {
  const [data, setData] = useState<Invoice>({
    ...input,
    vat: input.vatRate || 0.19
  })

  const [editedId, setEditedId] = useState<string | undefined>(undefined)
  const componentRef = useRef<HTMLDivElement>(null)

  const headerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const totalsRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLTableRowElement>(null)

  const [prices, setPrices] = useState<Record<string, string>>({})

  const billingSummary = useMemo(
    () =>
      calculateBillingSummary(data.items, {
        discountRate: data.discountRate,
        refundRate: data.refundRate,
        stampTaxRate: data.stampTaxRate,
        vatRate: data.vatRate
      }),
    [
      data.items,
      data.discountRate,
      data.refundRate,
      data.stampTaxRate,
      data.vatRate
    ]
  )

  // destructure global summary (kept for inputs / some legacy usage)
  const { refund, discount, stampTax, Total, totalHT, totalTTC, vat } =
    billingSummary

  // update total
  useEffect(() => {
    setData((prev) => ({
      ...prev,
      total: totalTTC
    }))
  }, [totalTTC])

  const handlePaymentTypeChange = (value: (typeof PAYMENT_TYPES)[number]) => {
    setData((prev) => ({
      ...prev,
      paymentMode: value,
      stampTaxRate:
        value === 'Espèces' || value === 'Espèces + Versement' ? 0.01 : 0
    }))
  }

  // send an update request on every change
  async function onUpdate() {
    setIsUpdating(true)
    try {
      const invoice = await fetch(`/api/invoices/${data?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          vatRate: data.vatRate,
          total: totalTTC,
          subtotal: totalHT,
          vat: vat,
          discount: discount,
          refund: refund,
          stampTax: stampTax
        })
      })

      if (!invoice.ok) {
        const errorData = await invoice.json().catch(() => ({}))
        throw new Error(
          errorData?.message || 'Erreur lors de la mise à jour de la facture'
        )
      }

      toast({
        title: 'Succès !',
        description: 'La facture a été mise à jour avec succès.',
        variant: 'success'
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description:
          error instanceof Error
            ? error.message
            : 'Une erreur inconnue est survenue.',
        variant: 'destructive'
      })
      console.error('❌ Erreur lors de la mise à jour de la facture:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const renderBillHeader = () => (
    <div className="print-header">
      <div className="flex justify-between items-start">
        <div className="w-full flex items-center justify-between ">
          <div className="w-[4.57rem] h-[4.57rem] translate-y-[1.5px]">
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
            <h1 className="text-[1.7rem] leading-tight  font-bold font-poppins translate-y-[4px]">
              SARL SO.NE.RA.S
            </h1>
            <p className="text-[1.57rem] leading-tight font-bold font-naskh-arabic ">
              ش . ذ . م . م . صونيـراس
            </p>
            <p className="text-xl leading-tight font-poppins ">
              Capital: 104 002 000.00
            </p>
          </div>

          <div className="w-20 h-20 flex flex-col justify-center pl-[8px] -mt-[5px]  scale-95 translate-y-[4px]">
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
            <span className="text-[0.745rem] w-full text-center ">
              {data.id}
            </span>
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
        className="separator my-1 h-[1.8px] rounded text-black"
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
      <div className="text-base mt-1 ">
        <Separator
          style={{ backgroundColor: '#000' }}
          className="separator my-1 h-[1.4px] rounded "
        />
        <div className="flex w-full justify-between ">
          <div>
            <h3 className="font-light">Client</h3>
            <p className="font-semibold uppercase">{data.name}</p>
            {/* client address only appear if it exist  */}
            {data.address && (
              <p className="capitalize font-normal">{data.address}</p>
            )}
          </div>
          <div className="text-sm my-auto font-geist-sans w-60">
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
          className="separator my-1 h-[1px] rounded "
        />
      </div>
    </div>
  )

  const renderBillFooter = () => (
    <div className="print-footer  flex flex-col font-poppins text-xs">
      <div>
        <Separator
          style={{ backgroundColor: '#000' }}
          className="my-1 h-[1.6px] rounded"
        />
        <div className="flex justify-start w-full ">
          <p className="flex w-1/4 font-sans">
            <strong className="">R.C:</strong> 97/B/0862043
          </p>
          <p className="flex w-1/4 font-sans ">
            <strong className="">N.I.F:</strong> 99747086204393
          </p>
          <p className="flex w-1/4 font-sans">
            <strong className="">A.I:</strong> 4710060038
          </p>
          <p className="flex w-1/4 font-sans">
            <strong className="">N.I.S:</strong> 096947100010442
          </p>
        </div>
        <Separator
          style={{ backgroundColor: '#000' }}
          className="my-1 h-[1px] rounded"
        />
        <div className="flex justify-start w-full ">
          <p className="w-1/4 flex items-center">
            <strong className="">BEA:</strong>
            00200028280286002213
          </p>
          <p className="w-1/4 flex items-center">
            <strong className="">BNA:</strong>
            00100291030035005601
          </p>
          <p className="w-1/4 flex items-center">
            <strong className="">SGA:</strong>
            02100551113003458571
          </p>
          <p className="w-1/4 flex items-center">
            <strong className="">AGB:</strong>
            03200001229251120896
          </p>
        </div>
      </div>
    </div>
  )

  // Modified: accepts optional per-page summary override (keeps design exactly the same)
  const renderTotals = (summaryOverride?: {
    refund?: number
    discount?: number
    stampTax?: number
    Total?: number
    totalHT?: number
    totalTTC?: number
    vat?: number
  }) => {
    const {
      refund: s_refund = refund,
      discount: s_discount = discount,
      stampTax: s_stampTax = stampTax,
      Total: s_Total = Total,
      totalHT: s_totalHT = totalHT,
      totalTTC: s_totalTTC = totalTTC,
      vat: s_vat = vat
    } = summaryOverride ?? {}

    return (
      <div className="totals-section   font-geist-sans">
        <div className="flex justify-end text-sm">
          <div className="w-[15rem] flex flex-col space-y-1">
            <div className=" pl-2 space-y-1 font-geist-sans ">
              <div
                className={cn(
                  'flex justify-between',
                  !data.discountRate && !data.refundRate && 'print:hidden'
                )}
              >
                <span className="text-nowrap">TOTAL BRUTE H.T</span>
                <span className="w-full pl-2 text-end px-2">
                  {formatPrice(s_Total)}
                </span>
              </div>
              <div
                className={cn(
                  'flex justify-between  border-t-[1.6px] pt-[1px]',
                  !data.discountRate && 'print:hidden'
                )}
              >
                <div className="flex gap-1 items-center">
                  <span className="text-nowrap">REMISE </span>
                  <Input
                    value={Number(data.discountRate) * 100}
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
                      'p-0 m-0 w-5  text-end text-muted-foreground print:text-foreground  h-6 focus-visible:ring-0 rounded-none focus-visible:ring-offset-0 border-none'
                    )}
                  />
                  %
                </div>
                <span className="w-full pl-2 text-end font-geist-sans px-2">
                  {formatPrice(s_discount)}
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
                    value={Number(data.refundRate) * 100}
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
                <span className="w-full px-2 pl-2 text-end font-geist-sans">
                  {formatPrice(s_refund)}
                </span>
              </div>
              <div className="flex justify-between border-t-[1.6px] pt-[1px]">
                <span className="text-nowrap">TOTAL NET H.T</span>
                <span className="w-full px-2 pl-2 text-end">
                  {formatPrice(s_totalHT)}
                </span>
              </div>
              <div className="flex justify-between border-t-[1.6px] pt-[1px]">
                <div className="flex items-center gap-2">
                  <span>TVA </span>
                  <Selector
                    className={cn(
                      'p-0 m-0 w-12  h-6 text-muted-foreground print:text-foreground focus-visible:ring-0 rounded-none focus-visible:ring-offset-0 border-none'
                    )}
                    value={`${Number(data.vatRate) * 100}%`}
                    items={['19%', '0%']}
                    setValue={(v) => {
                      setData((prev) => ({
                        ...prev,
                        vatRate: Number(v.replace(/\%/g, '')) / 100
                      }))
                    }}
                  />
                </div>

                <span className="text-end px-2 w-full pl-2">
                  {formatPrice(s_vat)}
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
                    value={Number(data.stampTaxRate) * 100}
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
                      'p-0 m-0 w-5  text-end h-6 text-muted-foreground print:text-foreground   focus-visible:ring-0 rounded-none focus-visible:ring-offset-0 border-none'
                    )}
                  />
                  %
                </div>

                <span className="w-full px-2 text-end ">
                  {formatPrice(s_stampTax)}
                </span>
              </div>
            </div>
            <div className="flex justify-between font-bold bg-gray-100  py-[4px] pl-2  border-y font-geist-sans">
              <span className="text-nowrap">TOTAL TTC</span>
              <span className="w-full px-2  pl-2 text-right ">
                {formatPrice(s_totalTTC)}
              </span>
            </div>
          </div>
        </div>
        <div className="amount-in-words">
          <div className="space-y-[2px] text-sm print:text-black mt-1">
            <p className="font-semibold">
              ARRÊTÉE LA PRÉSENTE FACTURE A LA SOMME EN TTC DE:
            </p>
            <p className="capitalize">{amountToWords(s_totalTTC)}</p>
          </div>
        </div>
        <div className="payment-details">
          <div className="space-y-[2px] text-sm mt-[2px]">
            <div className="space-y-[2px]">
              <h3 className="font-semibold">MODE DE RÉGALEMENT</h3>
              <Select
                value={data.paymentMode ?? undefined}
                onValueChange={handlePaymentTypeChange}
              >
                <SelectTrigger className="w-fit border-none ring-0 h-fit py-[2px] px-0 ring-offset-0 rounded-none focus:ring-0 disabled:opacity-100">
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
            <div className={cn('space-y-[2px] print:hidden')}>
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
              <div className="hidden print:block space-y-[2px]">
                <h3 className="font-semibold">REMARQUE</h3>
                <p className="py-0">{data.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderTable = (items: Invoice['items']) => {
    return (
      <Table className="font-poppins text-[0.9rem] w-full font-regular hide-scrollbar-print text-foreground ">
        <TableHeader className="print:table-header-group bg-gray-100  border-y">
          <TableRow className="">
            <TableHead className="px-2 py-1 h-5 w-8 text-left text-black font-medium border-r-[3px] border-white ">
              N°
            </TableHead>
            <TableHead className="px-2 py-1 h-5 text-center text-black font-medium border-r-[3px] border-white ">
              Désignation
            </TableHead>
            <TableHead className="px-2 py-1 h-5 w-8 text-left text-black font-medium border-r-[3px] border-white ">
              Qté
            </TableHead>
            <TableHead className="px-2 py-1 h-5 w-24 text-left text-black font-medium border-r-[3px] border-white ">
              Prix U/H.T
            </TableHead>
            <TableHead className="px-2 py-1 h-5 w-[6.5rem] text-left text-black font-medium border-r-[3px] border-white ">
              Montant
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items
            .sort((a, b) => Number(a.id) - Number(b.id))
            .map((item, itemIndex) => (
              <TableRow key={item.id} ref={itemIndex === 0 ? rowRef : null}>
                <TableCell className="py-[1.5px] font-sans h-4  px-2 ">
                  {item.number}
                </TableCell>
                <TableCell className="py-[1.5px] h-4  px-2  relative">
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
                    <div className="flex items-center  ">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mr-1 opacity-50 print:hidden hover:opacity-100"
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
                <TableCell className="text-center  py-[1.5px] px-2 h-4 font-geist-sans">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-left  py-[1.5px] px-2 h-4 font-geist-sans">
                  <Input
                    type="txt"
                    value={prices[item.number] ?? item.price?.toString() ?? ''}
                    onChange={(e) =>
                      setPrices((prev) => ({
                        ...prev,
                        [item.number]: e.target.value
                      }))
                    }
                    onBlur={() => {
                      const raw =
                        prices[item.number] ?? item.price?.toString() ?? '0'
                      const num = Number(raw) || 0

                      setData((prev) => ({
                        ...prev,
                        items: prev.items.map((i) =>
                          i.number === item.number
                            ? {
                                ...i,
                                price: num,
                                amount: num * Number(i.quantity)
                              }
                            : i
                        )
                      }))

                      // replace raw input with formatted version
                      setPrices((prev) => ({
                        ...prev,
                        [item.id ?? item.number.toString()]: formatPrice(num)
                      }))
                    }}
                    className="h-6 py-1 w-full pl-0.5 pr-0 max-w-20 text-[.9rem] text-right focus-visible:ring-0 border-none rounded-none"
                  />
                </TableCell>
                <TableCell className="text-right py-[1.5px] px-2 h-4 font-geist-sans">
                  {formatPrice(
                    item.amount ? item.amount : item.price! * item.quantity!
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    )
  }

  const [isUpdating, setIsUpdating] = useState<boolean>(false)

  return (
    <div ref={componentRef} className="flex flex-col gap-6 print:gap-0">
      <div className="print:h-[297mm] min-h-[297mm] w-[210mm] font-geist-sans shadow-2xl rounded-xl print:shadow-none print:rounded-none p-8  bg-white flex flex-col justify-start">
        <div ref={headerRef}>{renderBillHeader()}</div>

        {/* Table */}
        <div>{renderTable(data.items)}</div>

        {/* Totals */}
        <div ref={totalsRef} className="mt-1">
          {renderTotals()}
        </div>

        <div className="mt-auto" ref={footerRef}>
          {renderBillFooter()}
        </div>
      </div>
      <Button
        onClick={() => onUpdate()}
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
