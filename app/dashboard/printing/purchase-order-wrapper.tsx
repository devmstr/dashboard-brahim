'use client'

import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { Printer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

interface PurchaseOrderPrinterWrapperProps {
  children: React.ReactNode
  data?: { reference?: string | null }
}

export const PurchaseOrderPrinterWrapper: React.FC<
  PurchaseOrderPrinterWrapperProps
> = ({ children, data }) => {
  const printRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bon-de-commande-${data?.reference || Date.now()}`,
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
      <div ref={printRef}>{children}</div>
      <div className="z-20 w-[210mm] justify-center items-center">
        <Button
          onClick={() => handlePrint()}
          className="w-full flex gap-2 rounded-xl h-12 print:hidden shadow-lg group hover:text-secondary"
          variant="outline"
        >
          <Printer className="w-4 h-4" />
          Imprimer
        </Button>
      </div>
    </div>
  )
}
