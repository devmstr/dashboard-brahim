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
import { Printer, Save } from 'lucide-react'
import { Icons } from '@/components/icons'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useReactToPrint } from 'react-to-print'
import { toast } from '@/hooks/use-toast'
import { InvoiceSchemaType } from '@/lib/procurement/validations/invoice'
import Link from 'next/link'

export interface InvoiceRef {
  getInvoiceData: () => InvoiceSchemaType
}

interface InvoicePrinterWrapperProps {
  metadata: {
    fileName: string
  }
  children: React.ReactElement<any, any> & { ref?: React.Ref<InvoiceRef> }
}

export const ProformaInvoicePrinterWrapper: React.FC<
  InvoicePrinterWrapperProps
> = ({ children, metadata: { fileName } }) => {
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

  const validateInvoiceData = (data: InvoiceSchemaType): string | null => {
    if (
      !data.items?.length ||
      data.items.every((item) => !item.label.trim() || item.quantity <= 0)
    ) {
      return 'Au moins un article valide est requis'
    }
    return null
  }

  const saveInvoice = async () => {
    if (!invoiceRef.current) {
      toast({
        title: 'Erreur',
        description: "Impossible d'accéder aux données de la facture",
        variant: 'destructive'
      })
      return null
    }

    const invoiceData = invoiceRef.current.getInvoiceData()
    const validationError = validateInvoiceData(invoiceData)
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
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...invoiceData,
          type: 'PROFORMA',
          status: 'UNPAID',
          date: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde')
      }

      const result = (await response.json()) as { id: string }

      toast({
        title: 'Succès',
        description: (
          <p>
            Facture proforma sauvegardée{' '}
            <a className="text-blue-500 underline" href={`/dashboard/ledger`}>
              Journal des factures
            </a>
          </p>
        ),
        variant: 'success'
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
    const invoiceId = await saveInvoice()
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
    return !!data.name
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
