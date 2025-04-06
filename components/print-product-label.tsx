'use client'

import type React from 'react'
import { useRef, useEffect, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from './ui/button'
import Image from 'next/image'
import { Separator } from './ui/separator'
import { Icons } from './icons'

interface CompanyData {
  company: string
  address: string
  phone1: string
  phone2: string
  email: string
  logoSrc: string
}

interface VehicleData {
  brand: string
  model: string
}

interface PrintLabelProps {
  companyData: CompanyData
  designation?: string
  qrCode?: string
  barcode?: string
}

export const PrintProductLabel: React.FC<PrintLabelProps> = ({
  companyData,
  designation,
  qrCode,
  barcode = ''
}) => {
  const componentRef = useRef<HTMLDivElement>(null)
  const barcodeRef = useRef<SVGSVGElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [barcodeLoaded, setBarcodeLoaded] = useState(!barcode)
  const [imageError, setImageError] = useState(false)

  // Normalize the logo path to ensure it starts with a slash
  const normalizedLogoPath = companyData.logoSrc.startsWith('/')
    ? companyData.logoSrc
    : `/${companyData.logoSrc}`

  // Split designation into two parts based on PC, BC, PD, or BD pattern
  let designationPart1 = ''
  let designationPart2 = ''

  if (designation) {
    const match = designation.match(/(.*?)(PC|BC|PD|BD)(\s+)(.*)/)
    if (match) {
      // match[1] is the text before the pattern
      // match[2] is the pattern itself (PC, BC, PD, BD)
      // match[4] is the text after the pattern and space
      designationPart1 = `${match[1]}${match[2]}`
      designationPart2 = match[4]
    } else {
      // If no match, use the whole designation as part 1
      designationPart1 = designation
    }
  }

  // Effect to render barcode after component mounts
  useEffect(() => {
    let isMounted = true

    if (typeof window !== 'undefined' && barcodeRef.current && barcode) {
      setBarcodeLoaded(false)

      // Dynamically import JSBarcode only on client side when needed
      const loadJsBarcode = async () => {
        try {
          const JsBarcode = (await import('jsbarcode')).default

          if (isMounted && barcodeRef.current) {
            JsBarcode(barcodeRef.current, barcode, {
              format: 'CODE128',
              displayValue: false,
              width: 2,
              height: 80,
              margin: 0
            })
            setBarcodeLoaded(true)
          }
        } catch (error) {
          console.error('Failed to load or render barcode:', error)
          if (isMounted) {
            setBarcodeLoaded(true) // Still mark as loaded even if there's an error
          }
        }
      }

      loadJsBarcode()
    } else if (!barcode) {
      setBarcodeLoaded(true)
    }

    return () => {
      isMounted = false
    }
  }, [barcode])

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    fonts: [
      {
        source: '/fonts/Poppins/Poppins-Regular.ttf',
        weight: '400',
        style: 'normal',
        family: 'Poppins'
      },
      {
        source: '/fonts/Noto_Naskh_Arabic/NotoNaskhArabic-Bold.ttf',
        weight: '700',
        style: 'normal',
        family: 'Noto_Naskh_Arabic'
      }
    ],
    pageStyle: `
      @page {
        size: 10cm 5.8cm;
        margin: 0;
      }
      @media print {
        * {
          page-break-inside: avoid;
        }
        body {
          font-family: 'Poppins','Noto_Naskh_Arabic', sans-serif;
          margin: 0;
          padding: 0;
        }
        .print-container {
          width: 10cm;
          height: 5.8cm;
          position: relative;
          background-color: white;
          overflow: hidden;
          page-break-after: always;
        }
        img, svg {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    `,
    onBeforePrint: () => {
      if (componentRef.current) {
        console.log('Content height:', componentRef.current.offsetHeight)
        console.log('Content width:', componentRef.current.offsetWidth)
      }
      return Promise.resolve()
    }
  })

  // if (isLoading || !barcodeLoaded) {
  //   return (
  //     <div className="w-full flex flex-col items-center justify-center py-12">
  //       <Loader2 className="h-8 w-8 animate-spin text-primary" />
  //       <p className="mt-2 text-sm text-muted-foreground">
  //         Loading label preview...
  //       </p>
  //       {imageError && (
  //         <p className="mt-2 text-sm text-red-500">
  //           Error loading logo image. Check that the path is correct:{' '}
  //           {normalizedLogoPath}
  //         </p>
  //       )}
  //     </div>
  //   )
  // }

  return (
    <div className="w-full overflow-hidden p-2">
      {/* Preview container */}
      <div className="flex justify-center flex-col border-2  border-muted rounded-lg shadow-md">
        <div
          ref={componentRef}
          className="print-container mx-auto py-2 print:px-4 print:py-2 "
          style={{ width: 570, height: 320 }}
        >
          {/* Label Header */}
          <div className="flex flex-col">
            {/* Company Name */}
            <div className="w-full flex justify-center items-center text-center ">
              <h1 className="text-3xl font-bold text-black">
                {companyData.company}
              </h1>
            </div>
            <div className="flex gap-2 justify-between items-center">
              {/* Logo */}
              <div className="w-20 h-20">
                <Image
                  src={normalizedLogoPath || '/images/logo.svg'}
                  alt="Company Logo"
                  width={100}
                  height={100}
                  style={{ objectFit: 'contain' }}
                  onLoadingComplete={() => setIsLoading(false)}
                  onError={() => {
                    console.error('Failed to load image:', normalizedLogoPath)
                    setImageError(true)
                    setIsLoading(false)
                  }}
                  priority
                />
              </div>

              {/* Address and Contact */}
              <div
                style={{
                  fontSize: '1.11rem',
                  lineHeight: '1.75rem'
                }}
                className="font-poppins text-black text-nowrap "
              >
                <p>{companyData.address}</p>
                <div className="flex gap-10">
                  <p>Tel: {companyData.phone1}</p>
                  <p>Tel: {companyData.phone2}</p>
                </div>
                <p className="ml-[1px]">Email: {companyData.email}</p>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div className="relative left-0.5 top-2">
                  <QRCodeSVG value={qrCode} size={76} />
                  <p className="text-center text-[0.80rem] mt-1 -ml-[1px] text-black">
                    {qrCode}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="mt-1">
            <p
              style={{
                fontSize: '1.6rem',
                lineHeight: '2rem'
              }}
              className=" font-bold text-black"
            >
              {designationPart1}
              <br />
              {designationPart2}
            </p>
          </div>

          <div className="flex justify-between pt-1">
            {/* Made in Algeria */}
            <div className="w-1/2 px-3 pt-4">
              <p className="text-2xl font-geist-sans font-bold text-black">
                صنع في الـجزائر
              </p>
            </div>

            {/* Barcode */}
            <div className="relative -top-3  flex flex-col items-center ">
              <svg ref={barcodeRef} className="w-[200px] h-[75px]"></svg>
              <p className="relative -top-1   tracking-widest	 text-lg text-black">
                {barcode}
              </p>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="w-full">
          <Separator />
          <Button
            variant="ghost"
            onClick={() => handlePrint()}
            className="w-full text-lg rounded-none"
          >
            Imprimer l&apos;étiquette
            <Icons.printer className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
