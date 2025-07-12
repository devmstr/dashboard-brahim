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
import {
  amountToWords,
  calculateBillingSummary,
  cn,
  delay,
  skuId
} from '@/lib/utils'
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

export interface InvoiceProps {
  data?: Invoice
  className?: string
}

const ProformaInvoice = forwardRef<InvoiceRef, InvoiceProps>(
  ({ className, data: input }, ref) => {
    const pathname = usePathname()
    const componentRef = useRef<HTMLDivElement>(null)

    const headerRef = useRef<HTMLDivElement>(null)
    const footerRef = useRef<HTMLDivElement>(null)
    const totalsRef = useRef<HTMLDivElement>(null)
    const selectorsRef = useRef<HTMLDivElement>(null)
    const rowRef = useRef<HTMLTableRowElement>(null)

    const [itemsPerPage, setItemsPerPage] = useState(4)
    const [itemsPerPageLast, setItemsPerPageLast] = useState(2)
    const [showOfferValidity, setShowOfferValidity] = useState(true)
    const [showDeliveryTime, setShowDeliveryTime] = useState(true)
    const [showGuaranteeTime, setShowGuaranteeTime] = useState(true)
    const [showNote, setShowNote] = useState(true)

    const [data, setData] = useState<Invoice>(
      input
        ? input
        : {
            id: skuId('FP'),
            reference: '',
            date: null,
            name: null,
            address: null,
            tradeRegisterNumber: null,
            registrationArticle: null,
            taxIdNumber: null,
            type: null,
            status: null,
            paymentMode: null,
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
            tax: null,
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
    const {
      refund,
      discount,
      stampTax,
      Total: TotalBrut,
      totalHT,
      totalTTC,
      vat
    } = billingSummary

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
      const A4_HEIGHT = 1122 // in pixels (A4 at 96dpi)

      const header = headerRef.current?.offsetHeight || 0
      const footer = footerRef.current?.offsetHeight || 0
      const totals = totalsRef.current?.offsetHeight || 0
      const selectors = selectorsRef.current?.offsetHeight || 0
      const row = rowRef.current?.offsetHeight || 32

      const usableHeight = A4_HEIGHT - header - footer - 92 // paddings
      const usableHeightLastPage =
        A4_HEIGHT - header - totals - footer - selectors - 92

      const perPage = Math.floor(usableHeight / row)
      const perLastPage = Math.floor(usableHeightLastPage / row)

      if (perPage && perLastPage) {
        setItemsPerPage(perPage)
        setItemsPerPageLast(perLastPage)
      }
    }, [
      data.items,
      showDeliveryTime,
      showDeliveryTime,
      showGuaranteeTime,
      showNote
    ])

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

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

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
              {mounted && (
                <>
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
                  <span className="text-[0.745rem] w-20 text-center ">
                    {data.id}
                  </span>
                </>
              )}
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
            <p>Du: {mounted ? format(new Date(), 'dd/MM/yyyy') : ''}</p>
          </div>
        </div>
        <div className="text-base mt-4 w-full ">
          <Separator
            style={{ backgroundColor: '#000' }}
            className="separator my-2 h-[1.4px] rounded "
          />
          <h3 className="font-semibold">Client</h3>
          <div className="flex w-full justify-between ">
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
          </div>
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
        <div className="flex flex-col gap-1 my-1">
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
                  value={data.offerValidity}
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
                  value={data.deliveryTime}
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
                  value={data.guaranteeTime}
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
                    value={data.note}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, note: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}
          </div>
          {/* Print-only content - only show in print mode, outside selector UI */}
          <div className="hidden print:block mt-2  text-xs">
            {showOfferValidity && data.offerValidity && (
              <div className="flex gap-1 items-center my-1">
                <h3 className="font-semibold text-xs ">
                  OFFRE DE PRIX VALABLE:
                </h3>
                <p>{data.offerValidity}</p>
              </div>
            )}
            {showDeliveryTime && data.deliveryTime && (
              <div className="flex gap-1 items-center my-1">
                <h3 className="font-semibold text-xs ">DELAI DE LIVRAISON:</h3>
                <p>{data.deliveryTime}</p>
              </div>
            )}
            {showGuaranteeTime && data.guaranteeTime && (
              <div className="flex gap-1 items-center my-1">
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
              <strong className="">A.I:</strong> 4710060038
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
                  {Number(TotalBrut.toFixed(2)).toLocaleString('fr-FR', {
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
                      'p-0 m-0 w-6 text-end text-muted-foreground  print:text-foreground h-6 focus-visible:ring-0 rounded-none focus-visible:ring-offset-0 border-none'
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
                      data.stampTaxRate
                        ? (data.stampTaxRate * 100).toFixed()
                        : 0
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
      </div>
    )

    const renderTable = (pageItems: InvoiceItem[]) => {
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
              <TableHead className="px-2 py-2 h-8 w-[6.5rem] text-left text-black font-medium border-r-[3px] border-white relative">
                Montant
              </TableHead>
              <TableHead className="h-8 px-0  w-10 text-center text-black font-medium border-white print:hidden ">
                <Button
                  className="w-fit"
                  style={{ zIndex: 10 }}
                  onClick={handleAddItem}
                  type="button"
                  variant="ghost"
                >
                  <Icons.packagePlus className="text-foreground h-[1.15rem] w-auto" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((item: InvoiceItem, idx: number) => (
              <TableRow key={item.id} className="relative">
                <TableCell className="py-[3px] px-2 h-8">
                  {item.number}
                </TableCell>
                <TableCell className="py-[3px] px-2 h-8 relative">
                  <Input
                    value={item.label}
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
                    className="min-h-6 h-6 max-h-24 py-1 focus-visible:ring-0 ring-0 border-none rounded-none resize-y "
                  />
                </TableCell>
                <TableCell className="text-left py-[3px] px-2 h-8 font-geist-sans">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
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
                    className="h-6 py-1 max-w-10   text-xs w-full pl-0.5 pr-0 focus-visible:ring-0 border-none rounded-none"
                  />
                </TableCell>
                <TableCell className="text-left py-[3px] px-2 h-8 font-geist-sans">
                  <Input
                    type="number"
                    min={0}
                    value={item.price}
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
                    className="h-6 py-1 w-full pl-0.5 pr-0 max-w-20 text-xs focus-visible:ring-0 border-none rounded-none"
                  />
                </TableCell>
                <TableCell className="text-left py-[3px] px-2  font-geist-sans max-w-20">
                  {Number(
                    item.amount || Number(item.price) * Number(item.quantity)
                  ).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </TableCell>
                <TableCell className="text-center py-[3px] px-1 print:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
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
