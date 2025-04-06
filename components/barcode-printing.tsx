/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import type React from 'react'
import { useRef, useEffect, useState, useCallback } from 'react'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import { Printer } from 'lucide-react'
import { Button } from './ui/button'

interface ProductLabelProps {
  company: string
  address: string
  phone1: string
  phone2: string
  email: string
  line1?: string
  line2?: string
  qrCode?: string
  barcode?: string
}

const ProductLabel: React.FC<ProductLabelProps> = ({
  company,
  address,
  phone1,
  phone2,
  email,
  line1 = '',
  line2 = '',
  qrCode = '',
  barcode = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isCanvasReady, setIsCanvasReady] = useState(false)
  const [scale, setScale] = useState(1)

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.src = src
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = (err) => reject(err)
    })

  const convertToBinary = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        const color = avg > 128 ? 255 : 0
        data[i] = data[i + 1] = data[i + 2] = color
      }
      ctx.putImageData(imageData, 0, 0)
    },
    []
  )

  const handlePrint = () => {
    if (!canvasRef.current || !isCanvasReady) return
    const canvas = canvasRef.current

    const printCanvas = document.createElement('canvas')
    printCanvas.width = canvas.width
    printCanvas.height = canvas.height
    const printCtx = printCanvas.getContext('2d')
    if (printCtx) {
      printCtx.drawImage(canvas, 0, 0)
      convertToBinary(printCtx, canvas)
    }

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
      <html>
<head>
    <head>
        <title>Print Label</title>
        <style>
            @page {
                size: 10cm 5.8cm;
                margin: 0;
            }

            body {
                margin: 0;
                padding: 0;
            }

            img {
                width: 10cm;
                height: 5.8cm;
                display: block;
            }

            @media print {

                html,
                body {
                    width: 10cm;
                    height: 5.8cm;
                }
            }
        </style>
    </head>
    <title>Print Label</title>
</head>
<body>  
      `)
      printWindow.document.write('<div style="text-align:center;">')
      printWindow.document.write(
        `<img src="${printCanvas.toDataURL(
          'image/png'
        )}" style="width:10cm;height:5.8cm;"/>`
      )
      printWindow.document.write('</div></body></html>')
      printWindow.document.close()
      printWindow.focus()

      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 689.6
    canvas.height = 400

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    try {
      const logo = await loadImage('/images/logo.svg')
      ctx.drawImage(logo, 30, 48, 100, 100)
    } catch (error) {
      console.error('Error loading logo:', error)
    }

    const leftMargin = 150
    ctx.fillStyle = 'black'

    ctx.textAlign = 'center'
    ctx.font = 'bold 36px Arial'
    ctx.fillText(company, canvas.width / 2, 45)

    ctx.textAlign = 'left'
    ctx.font = '24px Arial'
    ctx.fillText(address, leftMargin, 80)

    ctx.font = '20px Arial'
    ctx.fillText(`Tel: ${phone1}        Tel: ${phone2}`, leftMargin, 110)
    ctx.fillText(`Email: ${email}`, leftMargin, 138)

    ctx.textAlign = 'left'
    ctx.font = 'bold 32px Arial'
    ctx.fillText(line1, 30, 190)
    ctx.fillText(line2, 30, 230)

    ctx.textAlign = 'left'
    ctx.font = 'bold 28px Arial'
    ctx.fillText('صنع بالـجزائر', 45, 315)

    if (qrCode) {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(qrCode, {
          width: 100,
          margin: 0
        })
        const qrCodeImage = await loadImage(qrCodeDataUrl)

        const qrCodeX = 250
        const qrCodeY = 250
        const qrCodeWidth = 100
        const qrCodeHeight = 100
        ctx.drawImage(qrCodeImage, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight)

        ctx.textAlign = 'center'
        ctx.font = '18px Arial'
        ctx.fillText(
          qrCode,
          qrCodeX + qrCodeWidth / 2,
          qrCodeY + qrCodeHeight + 24
        )
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    const barcodeCanvas = document.createElement('canvas')
    JsBarcode(barcodeCanvas, barcode, {
      format: 'CODE128',
      displayValue: false
    })

    const barcodeX = 410
    const barcodeY = 240
    const barcodeWidth = 230
    const barcodeHeight = 120
    ctx.drawImage(
      barcodeCanvas,
      barcodeX,
      barcodeY,
      barcodeWidth,
      barcodeHeight
    )
    ctx.textAlign = 'center'
    ctx.font = '20px Arial'
    ctx.fillText(
      barcode,
      barcodeX + barcodeWidth / 2,
      barcodeY + barcodeHeight + 13
    )

    setIsCanvasReady(true)
  }, [
    company,
    address,
    phone1,
    phone2,
    email,
    barcode,
    qrCode,
    line1,
    line2,
    loadImage
  ])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const canvasWidth = canvasRef.current.width
        const newScale = containerWidth / canvasWidth
        setScale(newScale)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden flex flex-col justify-start"
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left'
        }}
      >
        <canvas
          ref={canvasRef}
          width={689.6}
          height={400}
          style={{ width: '685px', height: '390px' }}
          className="border ml-[2px] border-gray-200 rounded-lg shadow-lg"
        />
      </div>
      <div className="w-full flex justify-center">
        <Button
          variant={'outline'}
          onClick={handlePrint}
          disabled={!isCanvasReady}
          className="relative top-3"
        >
          Imprimer
          <Printer className="ml-3 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default ProductLabel
