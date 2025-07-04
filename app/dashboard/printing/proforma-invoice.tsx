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
import { amountToWords, calculateBillingSummary, cn, skuId } from '@/lib/utils'
import type { InvoiceItem } from '@/types'
import { format } from 'date-fns'
import { Pencil } from 'lucide-react'
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
import { InvoiceData, InvoiceRef } from './proforma-invoice-wrapper'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import ClientAutocomplete from '@/components/client-autocomplete'

export type InvoiceMetadata = {
  items: InvoiceItem[]
  purchaseOrder?: string
  deliverySlip?: string
  note?: string
  discountRate?: number
  refundRate?: number
  stampTaxRate?: number
}

export interface InvoiceProps {
  className?: string
  data?: InvoiceData
}

const ProformaInvoice = forwardRef<InvoiceRef, InvoiceProps>(
  ({ className }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const scrollYProgress = useScrollProgress(scrollRef)
    const [mounted, setMounted] = useState(false)
    const [invoiceId, setInvoiceId] = useState<string>('')

    useEffect(() => {
      setMounted(true)
      setInvoiceId(skuId('FP'))
    }, [])

    const [note, setNote] = useState<string | undefined>(undefined)
    const [refundRate, setRefundRate] = useState<number>(0)
    const [discountRate, setDiscountRate] = useState<number>(0)
    const [stampTaxRate, setStampTaxRate] = useState<number>(0)
    const [purchaseOrder, setPurchaseOrder] = useState<string>('')
    const [deliverySlip, setDeliverySlip] = useState<string>('')
    const [editingItemId, setEditingItemId] = useState<number | null>(null)
    const [editedItems, setEditedItems] = useState<InvoiceItem[]>([
      {
        id: 1,
        label: 'Designation...',
        quantity: 1,
        price: 0,
        amount: 0
      }
    ])
    const [client, setClient] = useState({
      name: '',
      address: '',
      rc: '',
      nif: '',
      ai: ''
    })
    const componentRef = useRef<HTMLDivElement>(null)

    const [offerValidity, setOfferValidity] = useState<string | undefined>(
      undefined
    )
    const [deliveryTime, setDeliveryTime] = useState<string | undefined>(
      undefined
    )
    const [guaranteeTime, setGuaranteeTime] = useState<string | undefined>(
      undefined
    )

    const billingSummary = useMemo(
      () =>
        calculateBillingSummary(editedItems, {
          discountRate: discountRate,
          refundRate: refundRate,
          stampTaxRate: stampTaxRate,
          vatRate: 0.19
        }),
      [editedItems, discountRate, refundRate, stampTaxRate]
    )

    const { refund, discount, stampTax, Total, totalHT, totalTTC, vat } =
      billingSummary

    // Add useImperativeHandle to expose the data
    useImperativeHandle(
      ref,
      () => ({
        getInvoiceData: (): InvoiceData => ({
          client,
          items: editedItems,
          billingSummary: {
            totalHT,
            vat,
            totalTTC,
            discount,
            refund,
            stampTax
          },
          metadata: {
            note,
            discountRate,
            refundRate,
            stampTaxRate,
            purchaseOrder,
            deliverySlip,
            offerValidity,
            deliveryTime,
            guaranteeTime
          }
        })
      }),
      [
        client,
        editedItems,
        totalHT,
        vat,
        totalTTC,
        discount,
        refund,
        stampTax,
        note,
        discountRate,
        refundRate,
        stampTaxRate,
        purchaseOrder,
        deliverySlip,
        offerValidity,
        deliveryTime,
        guaranteeTime
      ]
    )

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
                    value={invoiceId}
                    className="w-[4.57rem] h-auto"
                  />
                  <span className="text-[0.745rem] w-20 text-center ">
                    {invoiceId}
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
            <ClientAutocomplete client={client} setClient={setClient} />
          </div>
          <Separator
            style={{ backgroundColor: '#000' }}
            className="separator my-2 h-[1.2px] rounded text-black"
          />
        </div>
      </div>
    )

    const [showOfferValidity, setShowOfferValidity] = useState(false)
    const [showDeliveryTime, setShowDeliveryTime] = useState(false)
    const [showGuaranteeTime, setShowGuaranteeTime] = useState(false)
    const [showNote, setShowNote] = useState(false)

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
                <Select value={offerValidity} onValueChange={setOfferValidity}>
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
                <Select value={deliveryTime} onValueChange={setDeliveryTime}>
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
                <Select value={guaranteeTime} onValueChange={setGuaranteeTime}>
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
                    className="w-full h-12 min-h-12 max-h-14 group focus-visible:ring-0 ring-offset-0 rounded-md focus-visible:ring-offset-0 print:border-none print:px-0 print:py-0"
                    placeholder="Saisissez des remarques pour cette facture..."
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value)
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Print-only content - only show in print mode, outside selector UI */}
          <div className="hidden print:block mt-2  text-xs">
            {showOfferValidity && offerValidity && (
              <div className="flex gap-1 items-center my-1">
                <h3 className="font-semibold text-xs ">
                  OFFRE DE PRIX VALABLE:
                </h3>
                <p>{offerValidity}</p>
              </div>
            )}
            {showDeliveryTime && deliveryTime && (
              <div className="flex gap-1 items-center my-1">
                <h3 className="font-semibold text-xs ">DELAI DE LIVRAISON:</h3>
                <p>{deliveryTime}</p>
              </div>
            )}
            {showGuaranteeTime && guaranteeTime && (
              <div className="flex gap-1 items-center my-1">
                <h3 className="font-semibold text-xs ">DELAI DE GARANTE:</h3>
                <p>{guaranteeTime}</p>
              </div>
            )}
            {showNote && note && (
              <div className="space-y-1 mt-2">
                <h3 className="font-semibold text-xs w-full">REMARQUE:</h3>
                <p>{note}</p>
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
                  !discountRate && !refund && 'print:hidden'
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
                  !discountRate && 'print:hidden'
                )}
              >
                <div className="flex gap-1 items-center">
                  <span>REMISE </span>
                  <Input
                    value={
                      discountRate ? (discountRate * 100).toFixed() : undefined
                    }
                    type="number"
                    name="discount-percentage"
                    placeholder="0"
                    onChange={({ target: { value: v } }) => {
                      if (Number(v) < 25 && Number(v) >= 0)
                        setDiscountRate(Number(v) / 100)
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
                  !refund && 'print:hidden'
                )}
              >
                <div className="flex gap-1 items-center">
                  <span>R.G</span>
                  <Input
                    value={
                      refundRate ? (refundRate * 100).toFixed() : undefined
                    }
                    type="number"
                    name="guarantee-refund"
                    placeholder="0"
                    onChange={({ target: { value: v } }) => {
                      if (Number(v) < 100 && Number(v) >= 0)
                        setRefundRate(Number(v) / 100)
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
                  !stampTaxRate && 'print:hidden'
                )}
              >
                <div className="flex gap-1 items-center">
                  <span>TIMBRE</span>
                  <Input
                    value={stampTaxRate ? (stampTaxRate * 100).toFixed() : 0}
                    type="number"
                    name="stamp-tax"
                    placeholder="0"
                    onChange={({ target: { value } }) => {
                      if (Number(value) >= 0 && Number(value) < 2) {
                        setStampTaxRate(Number(value) / 100)
                      }
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
        {/* Remove the old note/remark textarea here */}
        {renderSelectors()}
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
                <TableCell className="py-[3px] px-2 h-8">{item.id}</TableCell>
                <TableCell className="py-[3px] px-2 h-8 relative">
                  <Input
                    value={item.label}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const newValue = e.target.value
                      setEditedItems((prev: InvoiceItem[]) =>
                        prev.map((i: InvoiceItem) =>
                          i.id === item.id ? { ...i, label: newValue } : i
                        )
                      )
                    }}
                    className="h-6 py-1 focus-visible:ring-0 ring-0 border-none rounded-none "
                  />
                </TableCell>
                <TableCell className="text-left py-[3px] px-2 h-8 font-geist-sans">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const quantity = Number(e.target.value)
                      setEditedItems((prev: InvoiceItem[]) =>
                        prev.map((i: InvoiceItem) =>
                          i.id === item.id
                            ? { ...i, quantity, price: quantity * i.price }
                            : i
                        )
                      )
                    }}
                    className="h-6 py-1 w-8 max-w-10 text-xs focus-visible:ring-0 border-none rounded-none"
                  />
                </TableCell>
                <TableCell className="text-left py-[3px] px-2 h-8 font-geist-sans">
                  <Input
                    type="number"
                    min={0}
                    value={item.price}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const price = Number(e.target.value)
                      setEditedItems((prev: InvoiceItem[]) =>
                        prev.map((i: InvoiceItem) =>
                          i.id === item.id
                            ? { ...i, price, amont: price * i.quantity }
                            : i
                        )
                      )
                    }}
                    className="h-6 py-1 w-16 max-w-20 text-xs focus-visible:ring-0 border-none rounded-none"
                  />
                </TableCell>
                <TableCell className="text-left py-[3px] px-2  font-geist-sans max-w-20">
                  {Number(item.price).toLocaleString('fr-FR', {
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
                      setEditedItems((prev: InvoiceItem[]) =>
                        prev.filter((i) => i.id !== item.id)
                      )
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
      setEditedItems((prev: InvoiceItem[]) => {
        const newId =
          prev.length > 0 ? Math.max(...prev.map((i) => i.id)) + 1 : 1
        return [
          ...prev,
          {
            id: newId,
            label: 'Designation...',
            quantity: 1,
            price: 0,
            amount: 0
          }
        ]
      })
    }

    return (
      <>
        <div
          className={cn(
            'flex flex-col w-[210mm] gap-8 font-geist-sans print-preview',
            className
          )}
        >
          {/* Print-only content */}
          {(() => {
            // Pagination constants
            const ITEMS_PER_PAGE = 17
            const ITEMS_ON_TOTALS_PAGE = 4
            const totalItems = editedItems.length
            const pages: InvoiceItem[][] = []

            if (totalItems <= ITEMS_ON_TOTALS_PAGE) {
              // All items fit on one page with totals
              pages.push(editedItems)
            } else {
              // Split all except the last 4 items into 17-item pages
              const mainItems = editedItems.slice(0, -ITEMS_ON_TOTALS_PAGE)
              const lastItems = editedItems.slice(-ITEMS_ON_TOTALS_PAGE)
              let i = 0
              while (i < mainItems.length) {
                pages.push(mainItems.slice(i, i + ITEMS_PER_PAGE))
                i += ITEMS_PER_PAGE
              }
              pages.push(lastItems)
            }

            return (
              <div
                ref={componentRef}
                className="flex flex-col gap-6 print:gap-0 "
              >
                {pages.map((pageItems, pageIndex) => (
                  <div
                    key={pageIndex}
                    className="h-[297mm] w-[210] font-geist-sans shadow-2xl rounded-xl print:shadow-none print:rounded-none pt-10 px-9 pb-8  bg-white flex flex-col"
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
            )
          })()}
        </div>
      </>
    )
  }
)

ProformaInvoice.displayName = 'ProformaInvoice'

export default ProformaInvoice
