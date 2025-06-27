'use client'
import { Button } from '@/components/ui/button'
import React from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Printer, Save, AlertTriangle } from 'lucide-react'
import { Icons } from '@/components/icons'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useReactToPrint } from 'react-to-print'
import { toast } from '@/hooks/use-toast'

export interface InvoiceData {
  client: {
    name: string
    address: string
    rc: string
    nif: string
    ai: string
  }
  items: Array<{
    id: number
    label: string
    quantity: number
    price: number
    amount: number
  }>
  billingSummary: {
    totalHT: number
    vat: number
    totalTTC: number
    discount: number
    refund: number
    stampTax: number
  }
  metadata: {
    note?: string
    discountRate?: number
    refundRate?: number
    stampTaxRate?: number
    purchaseOrder?: string
    deliverySlip?: string
  }
}

export interface InvoiceRef {
  getInvoiceData: () => InvoiceData
}

interface InvoicePrinterWrapperProps {
  metadata: {
    fileName: string
  }
  children: React.ReactElement<any, any> & { ref?: React.Ref<InvoiceRef> }
}

export const InvoicePrinterWrapper: React.FC<InvoicePrinterWrapperProps> = ({
  children,
  metadata: { fileName }
}) => {
  const printRef = useRef<HTMLDivElement>(null)
  const invoiceRef = useRef<InvoiceRef>(null)
  const router = useRouter()
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Facture-${fileName}`,
    pageStyle: `
        @page { 
          size: A4;
          margin: 0;
        }
        @media print {
          body { 
            -webkit-print-color-adjust: exact; 
          }
        }
      `
  })

  const validateInvoiceData = (
    data: InvoiceData,
    isFinal = false
  ): string | null => {
    // For final invoices, client name is required
    if (isFinal && !data.client.name.trim()) {
      return 'Le nom du client est requis pour une facture finale'
    }

    if (
      !data.items.length ||
      data.items.every((item) => !item.label.trim() || item.quantity <= 0)
    ) {
      return 'Au moins un article valide est requis'
    }
    return null
  }

  const saveInvoice = async (type: 'PROFORMA' | 'FINAL') => {
    if (!invoiceRef.current) {
      toast({
        title: 'Erreur',
        description: "Impossible d'accéder aux données de la facture",
        variant: 'destructive'
      })
      return null
    }

    const invoiceData = invoiceRef.current.getInvoiceData()
    const validationError = validateInvoiceData(invoiceData, type === 'FINAL')
    if (validationError) {
      toast({
        title: 'Données invalides',
        description: validationError,
        variant: 'destructive'
      })
      return null
    }

    setIsLoading(true)
    try {
      // Transform the data to match the API schema
      const apiData = {
        customer: invoiceData.client.name.trim()
          ? {
              id: null, // Let the API search for existing clients
              name: invoiceData.client.name,
              address: invoiceData.client.address,
              rc: invoiceData.client.rc,
              nif: invoiceData.client.nif,
              ai: invoiceData.client.ai
            }
          : undefined,
        items: invoiceData.items.map((item) => ({
          id: item.id.toString(),
          name: item.label,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: invoiceData.billingSummary.totalHT,
        tax: invoiceData.billingSummary.vat,
        total: invoiceData.billingSummary.totalTTC,
        type: type,
        note: invoiceData.metadata.note,
        metadata: {
          ...invoiceData.metadata,
          items: invoiceData.items,
          discountAmount: invoiceData.billingSummary.discount,
          refundAmount: invoiceData.billingSummary.refund,
          stampTaxAmount: invoiceData.billingSummary.stampTax
        }
      }

      // Use query parameter for draft status
      const isDraft = type === 'PROFORMA'
      const url = `/api/invoice${isDraft ? '?isDraft=true' : ''}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde')
      }

      const result = await response.json()

      toast({
        title: 'Succès',
        description:
          result.message ||
          `${
            type === 'PROFORMA' ? 'Facture proforma' : 'Facture finale'
          } sauvegardée (${result.number})`,
        variant: 'default'
      })

      return result.id
    } catch (error: any) {
      toast({
        title: 'Erreur de sauvegarde',
        description:
          error.message || 'Une erreur est survenue lors de la sauvegarde',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndPrint = async () => {
    const invoiceId = await saveInvoice('PROFORMA')
    if (invoiceId) {
      setShowPrintDialog(false)
      setTimeout(() => {
        handlePrint()
      }, 100)
    }
  }

  const handlePrintOnly = async () => {
    setShowPrintDialog(false)
    setTimeout(() => {
      handlePrint()
    }, 100)
  }

  const handlePrintClick = () => {
    if (!invoiceRef.current) {
      toast({
        title: 'Erreur',
        description: "Impossible d'accéder aux données de la facture",
        variant: 'destructive'
      })
      return
    }
    setShowPrintDialog(true)
  }

  // Check if client data exists for better UX
  const hasClientData = () => {
    if (!invoiceRef.current) return false
    const data = invoiceRef.current.getInvoiceData()
    return data.client.name.trim().length > 0
  }

  return (
    <div className="flex flex-col w-full items-center gap-8 font-poppins">
      <div className="z-20 w-[210mm] justify-center items-center">
        <Button
          onClick={() => router.back()}
          className="w-full flex gap-2 rounded-xl h-12 print:hidden shadow-lg group hover:text-secondary"
          variant="outline"
        >
          <Icons.arrowRight className="mr-2 w-4 rotate-180" />
          Retour
        </Button>
      </div>

      <div ref={printRef}>
        {React.cloneElement(children, { ref: invoiceRef })}
      </div>

      <div className="z-20 w-[210mm] justify-center items-center">
        <Button
          onClick={handlePrintClick}
          disabled={isLoading}
          className="w-full flex gap-2 rounded-xl h-12 print:hidden shadow-lg group hover:text-secondary"
          variant="outline"
        >
          <Printer className="w-4 h-4" />
          {isLoading ? 'Traitement...' : 'Imprimer'}
        </Button>
      </div>

      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Options d'impression</DialogTitle>
            <DialogDescription>
              Choisissez comment vous souhaitez procéder avec cette facture.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPrintDialog(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              variant="outline"
              onClick={handlePrintOnly}
              disabled={isLoading}
              className="flex gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </Button>
            <Button
              onClick={handleSaveAndPrint}
              disabled={isLoading}
              className="flex gap-2"
              variant={!hasClientData() ? 'destructive' : 'default'}
            >
              <Save className="w-4 h-4" />
              Sauvegarder et Imprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
