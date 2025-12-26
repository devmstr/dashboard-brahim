'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import { usePathname, useSearchParams } from 'next/navigation'
import './print.css'
import { format } from 'date-fns'

type PurchaseOrderPrintItem = {
  id: string
  description: string | null
  quantity: number | null
  unit: string | null
  unitPrice: number | null
  total: number | null
  Item?: {
    id: string
    name: string
  } | null
}

export type PurchaseOrderPrintData = {
  reference: string
  vendor: string | null
  contactName: string | null
  contactEmail: string | null
  phone: string | null
  expectedDate: Date | string | null
  currency: string | null
  notes: string | null
  Supplier?: {
    name: string
  } | null
  Items: PurchaseOrderPrintItem[]
}

export const PurchaseOrderPrint = ({
  data
}: {
  data: PurchaseOrderPrintData
}) => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const url = `${pathname}?${searchParams.toString()}`
  const expectedDate = data.expectedDate ? new Date(data.expectedDate) : null

  const total = data.Items.reduce((sum, item) => {
    const lineTotal =
      item.total ??
      (item.quantity && item.unitPrice ? item.quantity * item.unitPrice : 0)
    return sum + (lineTotal || 0)
  }, 0)

  return (
    <div className="print:h-[297mm] min-h-[297mm] w-[210mm] font-geist-sans shadow-2xl rounded-xl print:shadow-none print:rounded-none p-8 bg-white flex flex-col gap-4">
      <div className="print-header">
        <div className="flex justify-between items-start">
          <div className="w-full flex items-center justify-between">
            <div className="flex justify-start items-start h-fit w-1/6 ">
              <div className="w-[4.57rem] h-[4.57rem] ">
                <Image
                  className="w-full"
                  src={'/images/logo.svg'}
                  alt={'company-logo'}
                  width={250}
                  height={250}
                  priority
                />
              </div>
            </div>
            <div className="w-full flex flex-col items-center text-center font-poppins">
              <h1 className="text-[1.7rem] leading-tight font-bold font-poppins translate-y-[4px]">
                SARL SO.NE.RA.S
              </h1>
              <p className="text-[1.57rem] leading-tight font-bold font-naskh-arabic">
                ش . ذ . م . م . صونيـراس
              </p>
              <p className="text-xl leading-tight font-poppins">
                Capital: 104 002 000.00
              </p>
            </div>
            <div className="w-1/6 h-20 flex justify-end text-sm items-start font-poppins ">
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
                value={url}
                className="w-[4.57rem] h-auto"
              />
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
          <div className="space-y-1">
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
          className="separator my-1 h-[1.8px] rounded text-black"
        />
        <div className="w-full h-fit flex justify-between text-center">
          <div className="flex flex-col items-start justify-center w-1/3">
            <p className="text-sm text-muted-foreground text-nowrap">
              Reference:{' '}
              <span className="text-foreground">{data.reference}</span>
            </p>
          </div>
          <h2 className="text-2xl font-semibold font-poppins w-1/3 uppercase text-center">
            Bon de commande
          </h2>
          <h6 className="flex justify-end  items-center text-nowrap font-geist-sans text-sm w-1/3">
            {`Le : ${format(new Date(), 'dd/MM/yyy')}`}
          </h6>
        </div>
        <div className="text-base mt-1">
          <Separator
            style={{ backgroundColor: '#000' }}
            className="separator my-1 h-[1.4px] rounded"
          />
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1 text-base">
          <p className="text-muted-foreground text-sm">Fournisseur</p>
          <p className="font-medium">
            {data.Supplier?.name || data.vendor || '-'}
          </p>
          {/* {data.contactName && <p>Contact: {data.contactName}</p>} */}
          {data.contactEmail && <p>Email: {data.contactEmail}</p>}
          {data.phone && <p>Tel: {data.phone}</p>}
        </div>
        <div className="flex-col gap-1 items-end">
          {expectedDate && (
            <p className="text-sm text-muted-foreground">
              Livraison:{' '}
              <span className="text-foreground">
                {expectedDate.toLocaleDateString('fr-FR')}
              </span>
            </p>
          )}
        </div>
      </div>
      <div className="border rounded-t-md">
        <Table className="font-poppins text-[0.9rem] w-full font-regular hide-scrollbar-print text-foreground">
          <TableHeader className="print:table-header-group bg-gray-100 border-y ">
            <TableRow className="text-black">
              <TableHead className="px-2 py-1 h-5  w-8 text-left font-medium  ">
                N°
              </TableHead>
              <TableHead className="py-[3px] px-2 h-5">Reference</TableHead>
              <TableHead className="py-[3px] px-2 h-5">Article</TableHead>
              <TableHead className="text-left py-[3px] px-2 h-5">
                Quantite
              </TableHead>
              <TableHead className="text-right py-[3px] px-2 h-5">
                Prix Unitaire
              </TableHead>
              <TableHead className="text-right py-[3px] px-2 h-5">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.Items.map((item, idx) => {
              const lineTotal =
                item.total ??
                (item.quantity && item.unitPrice
                  ? item.quantity * item.unitPrice
                  : 0)
              return (
                <TableRow key={item.id} className="h-5 p-0">
                  <TableCell className="py-[3px] px-2 h-5">{idx + 1}</TableCell>
                  <TableCell className="py-[3px] px-2 h-5">
                    {item.Item?.id || '-'}
                  </TableCell>
                  <TableCell className="py-[3px] px-2 h-5">
                    {item.Item?.name || '-'}
                  </TableCell>
                  <TableCell className="text-left py-[3px] px-2 h-5">
                    {item.quantity
                      ? `${item.quantity} ${item.unit || ''}`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right py-[3px] px-2 h-5">
                    {item.unitPrice ? formatPrice(item.unitPrice) : '-'}
                  </TableCell>
                  <TableCell className="text-right py-[3px] px-2 h-5">
                    {lineTotal ? formatPrice(lineTotal) : '-'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end text-sm">
        <div className="flex w-[14.3rem] justify-between font-bold bg-gray-100  py-[4px] pl-2  border font-geist-sans rounded-md">
          <span className="text-nowrap">TOTAL</span>
          <span className="w-full px-2  pl-2 text-right ">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {data.notes && (
        <div className="space-y-1 mt-2 border rounded-md ">
          <h3 className="font-semibold text-sm px-2 py-1 border-b rounded-t-md text-muted-foreground w-full bg-gray-100">
            REMARQUE:
          </h3>
          <p className="text-sm px-2 py-1 ">{data.notes}</p>
        </div>
      )}

      <div className="print-footer  flex flex-col mt-auto font-poppins text-xs">
        {/* <div className="text-right">
          <p>
            Page: {props?.page}|
            <span className="text-muted-foreground">{props?.pages}</span>
          </p>
        </div> */}
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
    </div>
  )
}
