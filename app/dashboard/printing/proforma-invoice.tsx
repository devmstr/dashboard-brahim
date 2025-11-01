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
import { cn, delay, formatPrice } from '@/lib/utils'
import { calculateBillingSummary } from '@/helpers/invoice'
import { amountToWords } from '@/helpers/price-to-string'
import { generateId } from '@/helpers/id-generator'
import type { Invoice } from '@/types'
import { format } from 'date-fns'
import { Pencil, RefreshCcw } from 'lucide-react'
import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef
} from 'react'
import './print.css'
import { toast } from '@/hooks/use-toast'
import { Icons } from '@/components/icons'
import { InvoiceRef } from './proforma-invoice-wrapper'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import ClientAutocomplete, {
  type Client as AutoCompleteClient
} from '@/components/client-autocomplete'
import { InvoiceItem } from '@/types'
import { InvoiceSchemaType } from '@/lib/validations/invoice'
import { useParams, usePathname } from 'next/navigation'
import { Selector } from '@/components/selector'
import { AutoResizeTextarea } from '@/components/auto-resize.textarea'
import React from 'react'

export interface InvoiceProps {
  data?: Invoice
  className?: string
}

const ProformaInvoice = forwardRef<InvoiceRef, InvoiceProps>(
  ({ className, data: input }, ref) => {
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()
    const componentRef = useRef<HTMLDivElement>(null)

    const headerRef = useRef<HTMLDivElement>(null)
    const tableRef = useRef<HTMLTableElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const totalsRef = useRef<HTMLDivElement>(null)
    const selectorsRef = useRef<HTMLDivElement>(null)
    const rowRef = useRef<HTMLTableRowElement>(null)

    const [itemsPerPage, setItemsPerPage] = useState(4)
    const [itemsPerPageLast, setItemsPerPageLast] = useState(2)
    const [showOfferValidity, setShowOfferValidity] = useState(false)
    const [showDeliveryTime, setShowDeliveryTime] = useState(false)
    const [showGuaranteeTime, setShowGuaranteeTime] = useState(false)
    const [showNote, setShowNote] = useState(true)

    const [data, setData] = useState<Invoice>(
      input
        ? input
        : {
            id: generateId('FP'),
            reference: '',
            date: null,
            name: null,
            address: null,
            tradeRegisterNumber: null,
            registrationArticle: null,
            taxIdNumber: null,
            type: null,
            status: null,
            paymentMode: 'Espèces',
            purchaseOrder: null,
            deliverySlip: null,
            discountRate: null,
            refundRate: null,
            stampTaxRate: null,
            offerValidity: null,
            guaranteeTime: null,
            deliveryTime: null,
            note: null,
            total: null,
            subtotal: null,
            vatRate: 0.19,
            vat: null,
            discount: null,
            refund: null,
            stampTax: null,
            orderId: null,
            clientId: null,
            items: [
              {
                number: 1,
                label: 'Désignation ...',
                price: 0,
                amount: 0,
                quantity: 1
              }
            ]
          }
    )

    const handlePaymentTypeChange = (value: (typeof PAYMENT_TYPES)[number]) => {
      setData((prev) => ({
        ...prev,
        paymentMode: value,
        stampTaxRate:
          value === 'Espèces' || value === 'Espèces + Versement' ? 0.01 : 0
      }))
    }

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
    const { refund, discount, stampTax, Total, totalHT, totalTTC, vat } =
      billingSummary

    useEffect(() => {
      setData((prev) => ({
        ...prev,
        subtotal: totalHT,
        total: totalTTC
      }))
    }, [totalHT, totalTTC])

    useImperativeHandle(
      ref,
      () => ({
        getInvoiceData: (): InvoiceSchemaType => data
      }),
      [data, totalHT, vat, totalTTC, discount, refund, stampTax]
    )

    useEffect(() => {
      const VAILIBALE_TABLE_AREA = 625 // the table place

      let totals = totalsRef.current?.offsetHeight || 0

      if (data.stampTaxRate === 0) {
        totals -= 26 // adjust for hidden stamp tax row
      }
      if (data.vatRate === 0) {
        totals -= 26 // adjust for hidden vat row
      }
      if (!data.refundRate) {
        totals -= 26 // adjust for hidden refund row
      }

      const selectors = selectorsRef.current?.offsetHeight || 0
      const row = rowRef.current?.offsetHeight || 30

      const usableHeightLastPage = VAILIBALE_TABLE_AREA - totals - selectors

      const perPage = Math.floor(VAILIBALE_TABLE_AREA / row)
      const perLastPage = Math.floor(usableHeightLastPage / row)

      setItemsPerPage(perPage)
      setItemsPerPageLast(perLastPage)
    }, [
      data.items,
      data.vatRate,
      data.stampTaxRate,
      data.refundRate,
      data.discountRate,
      showDeliveryTime,
      showDeliveryTime,
      showGuaranteeTime,
      showNote
    ])

    useEffect(() => {
      setMounted(true)
    }, [])

    // ---- Step 2: compute dynamic pagination ----
    const pages = useMemo(() => {
      const totalItems = data.items.length
      if (totalItems === 0) return []

      const perPage = itemsPerPage
      const perLast = Math.max(2, itemsPerPageLast) // ensure min 2 rows on last page

      // Case 1: all fit on one page
      if (totalItems <= perLast) {
        return [data.items]
      }

      // Reserve the last page
      const lastPageItems = data.items.slice(-perLast)
      const remaining = data.items.slice(0, totalItems - perLast)

      // Compute how many pages are needed for the remaining items
      const otherPageCount = Math.ceil(remaining.length / perPage)

      // Calculate ideal per-page size without exceeding perPage
      const ideal = Math.min(
        perPage,
        Math.ceil(remaining.length / otherPageCount)
      )

      const chunks: Invoice['items'][] = []
      let start = 0

      for (let i = 0; i < otherPageCount; i++) {
        const end = Math.min(start + ideal, remaining.length)
        chunks.push(remaining.slice(start, end))
        start = end
      }

      // Add the last page (always filled)
      chunks.push(lastPageItems)

      return chunks
    }, [data.items, itemsPerPage, itemsPerPageLast])

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
            {mounted && (
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
            )}
            {mounted && (
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
            )}
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
              <span className="tracking-[0.017em]">
                Tel | Fax: 029 27 22 06
              </span>
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
            <div className="flex gap-[.2rem] items-center print:hidden"></div>
          </div>
          <div className="w-2/4 flex justify-center text-center ">
            <h2 className="text-3xl -translate-y-1 font-bold font-poppins">
              FACTURE PROFORMA
            </h2>
          </div>
          <div className="w-1/4 flex justify-end  text-right text-sm font-geist-sans">
            <p>Du: {format(new Date(), 'dd/MM/yyyy')}</p>
          </div>
        </div>
        <div className="text-base mt-1 w-full ">
          <Separator
            style={{ backgroundColor: '#000' }}
            className="separator my-1 h-[1.4px] rounded "
          />
          <h3 className="font-semibold">Client</h3>
          <ClientAutocomplete
            client={{
              id: data.clientId || '',
              name: data.name || '',
              street: data.address,
              registrationArticle: data.registrationArticle,
              tradeRegisterNumber: data.tradeRegisterNumber,
              taxIdNumber: data.taxIdNumber
            }}
            setClient={({ id, street, ...client }) => {
              setData((prev) => ({
                ...prev,
                ...client,
                clientId: id,
                address: street || ''
              }))
            }}
          />
          <Separator
            style={{ backgroundColor: '#000' }}
            className="separator my-2 h-[1.2px] rounded text-black"
          />
        </div>
      </div>
    )

    const renderSelectors = () => {
      // Define a type for selector options
      type SelectorType = {
        key: string
        label: string
        onClick: () => void
      }
      // Only include valid selector objects
      const availableSelectors: SelectorType[] = []
      if (!showOfferValidity) {
        availableSelectors.push({
          key: 'offerValidity',
          label: 'OFFRE DE PRIX VALABLE',
          onClick: () => setShowOfferValidity(true)
        })
      }
      if (!showDeliveryTime) {
        availableSelectors.push({
          key: 'deliveryTime',
          label: 'DELAI DE LIVRAISON',
          onClick: () => setShowDeliveryTime(true)
        })
      }
      if (!showGuaranteeTime) {
        availableSelectors.push({
          key: 'guaranteeTime',
          label: 'DELAI DE GARANTE',
          onClick: () => setShowGuaranteeTime(true)
        })
      }
      if (!showNote) {
        availableSelectors.push({
          key: 'note',
          label: 'REMARQUE',
          onClick: () => setShowNote(true)
        })
      }

      return (
        <div className="flex flex-col gap-1 mb-1">
          {/* Single Add button with popover menu */}
          {availableSelectors.length > 0 && (
            <Popover>
              <div className="w-48 relative flex items-end">
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="absolute top-2.5 -left-7 h-6 w-6 p-0 group print:hidden "
                  >
                    <Icons.plus className="h-4 w-4 text-primary group-hover:text-secondary group-hover:font-bold" />
                    <span className="sr-only">Ajouter un champ</span>
                  </Button>
                </PopoverTrigger>
              </div>
              <PopoverContent className="p-1 w-48" side="bottom">
                <div className="flex flex-col gap-1">
                  {availableSelectors.map((sel) => (
                    <Button
                      key={sel.key}
                      variant="ghost"
                      className="justify-start w-full h-8 px-2 text-xs"
                      onClick={sel.onClick}
                    >
                      {sel.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          {/* Selectors UI - hidden in print mode */}
          <div className="flex flex-col gap-1 print:hidden">
            {showOfferValidity && (
              <div className="relative flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute -right-1 h-5 w-5 p-0 text-destructive z-10"
                  onClick={() => setShowOfferValidity(false)}
                  aria-label="Supprimer OFFRE DE PRIX VALABLE"
                >
                  <Icons.close className="w-3 h-3" />
                </Button>
                <label className="block text-xs font-semibold pr-6">
                  OFFRE DE PRIX VALABLE
                </label>
                <Select
                  value={data.offerValidity ?? undefined}
                  onValueChange={(value) => {
                    setData((prev) => ({ ...prev, offerValidity: value }))
                  }}
                >
                  <SelectTrigger className="w-fit mb-0.5 border-none ring-0 h-fit py-1 px-0 ring-offset-0 rounded-none focus:ring-0 disabled:opacity-100">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15 jours">15 jours</SelectItem>
                    <SelectItem value="30 jours">30 jours</SelectItem>
                    <SelectItem value="60 jours">60 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {showDeliveryTime && (
              <div className="relative flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute -right-1 h-5 w-5 p-0 text-destructive z-10"
                  onClick={() => setShowDeliveryTime(false)}
                  aria-label="Supprimer DELAI DE LIVRAISON"
                >
                  <Icons.close className="w-3 h-3" />
                </Button>
                <label className="block text-xs font-semibold pr-6">
                  DELAI DE LIVRAISON
                </label>
                <Select
                  value={data.deliveryTime ?? undefined}
                  onValueChange={(v) =>
                    setData((prev) => ({ ...prev, deliveryTime: v }))
                  }
                >
                  <SelectTrigger className="w-fit mb-0.5 border-none ring-0 h-fit py-1 px-0 ring-offset-0 rounded-none focus:ring-0 disabled:opacity-100">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((week) => (
                      <SelectItem key={week} value={`${week} semaines`}>
                        {week} semaines
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {showGuaranteeTime && (
              <div className="relative flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute -right-1 h-5 w-5 p-0 text-destructive z-10"
                  onClick={() => setShowGuaranteeTime(false)}
                  aria-label="Supprimer DELAI DE GARANTE"
                >
                  <Icons.close className="w-3 h-3" />
                </Button>
                <label className="block text-xs font-semibold pr-6">
                  DELAI DE GARANTE
                </label>
                <Select
                  value={data.guaranteeTime ?? undefined}
                  onValueChange={(v) =>
                    setData((prev) => ({ ...prev, guaranteeTime: v }))
                  }
                >
                  <SelectTrigger className="w-fit mb-0.5 border-none ring-0 h-fit py-1 px-0 ring-offset-0 rounded-none focus:ring-0 disabled:opacity-100">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6 mois">6 mois</SelectItem>
                    <SelectItem value="12 mois">12 mois</SelectItem>
                    <SelectItem value="24 mois">24 mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {showNote && (
              <div className="relative flex  items-center gap-2 mt-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-destructive z-10"
                  onClick={() => setShowNote(false)}
                  aria-label="Supprimer REMARQUE"
                >
                  <Icons.close className="w-3 h-3" />
                </Button>
                <div className="flex-1 flex-col ">
                  <h3 className="font-semibold text-xs w-full">REMARQUE</h3>
                  <Textarea
                    className="w-full h-14 max-h-14 group focus-visible:ring-0 ring-offset-0 rounded-md focus-visible:ring-offset-0 print:border-none print:px-0 print:py-0"
                    placeholder="Saisissez des remarques pour cette facture..."
                    value={data.note ?? undefined}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, note: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}
          </div>
          {/* Print-only content - only show in print mode, outside selector UI */}
          <div className="hidden print:block  text-xs">
            {showOfferValidity && data.offerValidity && (
              <div className="flex gap-1 items-center mt-1">
                <h3 className="font-semibold text-xs ">
                  OFFRE DE PRIX VALABLE:
                </h3>
                <p>{data.offerValidity}</p>
              </div>
            )}
            {showDeliveryTime && data.deliveryTime && (
              <div className="flex gap-1 items-center mt-1">
                <h3 className="font-semibold text-xs ">DELAI DE LIVRAISON:</h3>
                <p>{data.deliveryTime}</p>
              </div>
            )}
            {showGuaranteeTime && data.guaranteeTime && (
              <div className="flex gap-1 items-center mt-1">
                <h3 className="font-semibold text-xs ">DELAI DE GARANTE:</h3>
                <p>{data.guaranteeTime}</p>
              </div>
            )}
            {showNote && data.note && (
              <div className="space-y-1 mt-2">
                <h3 className="font-semibold text-xs w-full">REMARQUE:</h3>
                <p>{data.note}</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    const renderBillFooter = (props?: { page?: number; pages?: number }) => (
      <div className="print-footer  flex flex-col mt-auto font-poppins text-xs">
        <div className="text-right">
          <p>
            Page: {props?.page}|
            <span className="text-muted-foreground">{props?.pages}</span>
          </p>
        </div>
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
                  <SelectTrigger className="w-fit border-none ring-0 h-fit p-0 ring-offset-0 rounded-none focus:ring-0 disabled:opacity-100">
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
            </div>
          </div>
        </div>
      )
    }

    const renderTable = (pageItems: InvoiceItem[]) => {
      return (
        <Table
          ref={tableRef}
          className="font-poppins text-[0.9rem] w-full font-regular hide-scrollbar-print text-foreground "
        >
          <TableHeader className="print:table-header-group bg-gray-100  border-y">
            <TableRow className="">
              <TableHead className="px-2 py-1 h-5  w-8 text-left text-black font-medium border-r-[3px] border-white ">
                N°
              </TableHead>
              <TableHead className="px-2 py-1 h-5  text-center text-black font-medium border-r-[3px] border-white ">
                Désignation
              </TableHead>
              <TableHead className="px-2 py-1 h-5  w-8 text-left text-black font-medium border-r-[3px] border-white ">
                Qté
              </TableHead>
              <TableHead className="px-2 py-1 h-5  w-24 text-left text-black font-medium border-r-[3px] border-white ">
                Prix U/H.T
              </TableHead>
              <TableHead className="px-2 py-1 h-5  w-[6.5rem] text-left text-black font-medium border-r-[3px] border-white relative">
                Montant
              </TableHead>
              <TableHead className=" h-5  w-10 text-center text-black font-medium border-white print:hidden ">
                <Button
                  className="w-full h-full px-0 "
                  style={{ zIndex: 10 }}
                  onClick={handleAddItem}
                  type="button"
                  variant="ghost"
                >
                  <Icons.packagePlus className="text-foreground h-4 w-auto" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((item: InvoiceItem, idx: number) => (
              <TableRow key={item.id} className="relative">
                <TableCell className="py-[3px] px-2 h-5">
                  {item.number}
                </TableCell>
                <TableCell className="py-[3px] px-2 h-5">
                  <AutoResizeTextarea
                    value={item.label ?? undefined}
                    onChange={({ target: { value } }) => {
                      setData((prev) => ({
                        ...prev,
                        items: prev.items.map((nonEditedItem) =>
                          nonEditedItem.number === item.number
                            ? { ...nonEditedItem, label: value }
                            : nonEditedItem
                        )
                      }))
                    }}
                    // style={{ height: 'auto' }}
                    className="h-5 w-full p-0  focus-visible:ring-0 ring-0 border-none rounded-none resize-y print:resize-none"
                  />
                </TableCell>
                <TableCell className="text-left py-[3px] px-2 h-5 font-geist-sans">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity ?? undefined}
                    onChange={({
                      target: { value: v }
                    }: React.ChangeEvent<HTMLInputElement>) => {
                      setData((prev) => ({
                        ...prev,
                        items: prev.items.map((i) => {
                          return i.number === item.number
                            ? {
                                ...i,
                                quantity: parseInt(v),
                                amount: parseInt(v) * Number(i.price || 0)
                              }
                            : i
                        })
                      }))
                    }}
                    className="h-full  w-full p-0 max-w-10   text-xs  pr-0 focus-visible:ring-0 border-none rounded-none"
                  />
                </TableCell>
                <TableCell className="text-left py-[3px] px-2 h-5 font-geist-sans">
                  <Input
                    type="number"
                    min={0}
                    value={item.price ?? undefined}
                    onChange={({
                      target: { value: v }
                    }: React.ChangeEvent<HTMLInputElement>) => {
                      setData((prev) => ({
                        ...prev,
                        items: prev.items.map((i) => {
                          return i.number === item.number
                            ? {
                                ...i,
                                price: Number(v),
                                amount: Number(v) * Number(i.quantity)
                              }
                            : i
                        })
                      }))
                    }}
                    className="h-full  w-full p-0  max-w-20 text-xs focus-visible:ring-0 border-none rounded-none"
                  />
                </TableCell>
                <TableCell className="text-left h-5 py-[3px] px-2  font-geist-sans max-w-20">
                  {Number(
                    item.amount || Number(item.price) * Number(item.quantity)
                  ).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
                <TableCell className="text-center h-5 py-[3px] px-1 print:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-full w-full p-0 m-0"
                    onClick={() => {
                      const newItems = data.items
                        .filter((i) => i.number !== item.number) // Remove the item
                        .map((i, index) => ({
                          ...i,
                          number: index + 1 // Reassign sequential number starting from 1
                        }))

                      setData((prev) => ({
                        ...prev,
                        items: newItems
                      }))
                    }}
                  >
                    <Icons.trash className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }
    // Add Item handler (must be in scope for renderTable)
    const handleAddItem = () => {
      setData((prev) => {
        const maxId =
          prev.items.length > 0
            ? Math.max(...prev.items.map(({ number }) => number || 0))
            : 0
        return {
          ...prev,
          items: [
            ...prev.items,
            {
              number: maxId + 1,
              label: 'Designation...',
              quantity: 1,
              price: 0,
              amount: 0
            }
          ]
        }
      })
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

    return (
      <div ref={componentRef} className="flex flex-col gap-6 print:gap-0">
        {pages.map((pageItems, pageIndex) => (
          <div
            key={pageIndex}
            className="min-h-[297mm] print:h-[297mm] w-[210mm] font-geist-sans shadow-2xl rounded-xl print:shadow-none print:rounded-none pt-10 px-9 pb-8 bg-white flex flex-col justify-start"
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

            {/* Remove the old note/remark textarea here */}
            {pageIndex === pages.length - 1 && (
              <div className="" ref={selectorsRef}>
                {renderSelectors()}
              </div>
            )}

            <div className="mt-auto" ref={pageIndex === 0 ? footerRef : null}>
              {renderBillFooter({
                page: pageIndex + 1,
                pages: pages.length
              })}
            </div>
          </div>
        ))}
        {pathname.split('/').filter(Boolean).length > 2 && (
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
        )}
      </div>
    )
  }
)

ProformaInvoice.displayName = 'ProformaInvoice'

export default ProformaInvoice
