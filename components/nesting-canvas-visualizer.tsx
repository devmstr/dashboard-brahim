'use client'

import React, { MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import type {
  RectPackingInput,
  RectPackingOutput,
  PlacedPiece,
  WasteRectangle
} from '@/lib/nesting/types'

const CANVAS_WIDTH = 1600
const CANVAS_HEIGHT = 800

type HoverKind = 'piece' | 'waste'

type HoverState = {
  kind: HoverKind
  index: number
} | null

type NestingCanvasVisualizerProps = {
  input: RectPackingInput
  result: RectPackingOutput
  className?: string
}

export const NestingCanvasVisualizer: React.FC<
  NestingCanvasVisualizerProps
> = ({ input, result, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [hover, setHover] = useState<HoverState>(null)

  const sheetWidth = input.sheetWidth || 1
  const sheetHeight = input.sheetHeight || 1

  // ------------------------------------------------------------
  // Scaling / centering so the sheet fits the canvas
  // ------------------------------------------------------------

  const { scale, offsetX, offsetY } = useMemo(() => {
    const safeW = sheetWidth || 1
    const safeH = sheetHeight || 1

    const scaleX = (CANVAS_WIDTH - 40) / safeW
    const scaleY = (CANVAS_HEIGHT - 40) / safeH
    const scale = Math.min(scaleX, scaleY)

    const offsetX = (CANVAS_WIDTH - safeW * scale) / 2
    const offsetY = (CANVAS_HEIGHT - safeH * scale) / 2

    return { scale, offsetX, offsetY }
  }, [sheetWidth, sheetHeight])

  // ------------------------------------------------------------
  // Canvas drawing
  // ------------------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    const bg = '#f3f4f6' // gray-100
    const sheetFill = '#f9fafb' // gray-50
    const sheetBorder = '#000000'
    const panelFill = '#f5f0ff'
    const panelBorder = '#000000'
    const wasteFill = '#ffe4e6'
    const wasteBorder = '#b91c1c'
    const textColor = '#4b5563' // gray-600

    ctx.fillStyle = bg
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    // Sheet
    ctx.fillStyle = sheetFill
    ctx.fillRect(0, 0, sheetWidth, sheetHeight)
    ctx.strokeStyle = sheetBorder
    ctx.lineWidth = 1 / Math.max(scale, 1e-6)
    ctx.strokeRect(0, 0, sheetWidth, sheetHeight)

    // Panels (used pieces)
    ctx.fillStyle = panelFill
    ctx.strokeStyle = panelBorder
    for (const p of result.placedPieces) {
      ctx.fillRect(p.x, p.y, p.width, p.height)
      ctx.strokeRect(p.x, p.y, p.width, p.height)
    }

    // Waste rectangles
    ctx.fillStyle = wasteFill
    ctx.strokeStyle = wasteBorder
    for (const w of result.wastedRectangles) {
      ctx.fillRect(w.x, w.y, w.width, w.height)
      ctx.strokeRect(w.x, w.y, w.width, w.height)
    }

    // Dimension labels inside rectangles: "width×height"
    ctx.font = `${14 / Math.max(scale, 1e-6)}px system-ui`
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const drawDimLabel = (
      r: { x: number; y: number; width: number; height: number },
      vertical: boolean
    ) => {
      const cx = r.x + r.width / 2
      const cy = r.y + r.height / 2
      const value = `${Math.round(r.width)}×${Math.round(r.height)}`
      if (vertical) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(value, 0, 0)
        ctx.restore()
      } else {
        ctx.fillText(value, cx, cy)
      }
    }

    for (const p of result.placedPieces) {
      const vertical = p.height >= p.width
      drawDimLabel(p, vertical)
    }

    for (const w of result.wastedRectangles) {
      const vertical = w.height >= w.width
      drawDimLabel(w, vertical)
    }

    // Outer dimensions (bottom & right) – slightly bigger
    ctx.save()
    ctx.font = `${16 / Math.max(scale, 1e-6)}px system-ui`
    ctx.fillStyle = '#ef4444'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(
      String(sheetWidth),
      sheetWidth / 2,
      sheetHeight + 12 / Math.max(scale, 1e-6)
    )
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.translate(sheetWidth + 12 / Math.max(scale, 1e-6), sheetHeight / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(String(sheetHeight), 0, 0)
    ctx.restore()
    ctx.restore()

    ctx.restore()
  }, [result, sheetWidth, sheetHeight, scale, offsetX, offsetY])

  // ------------------------------------------------------------
  // Hover detection
  // ------------------------------------------------------------

  const hitRect = (
    x: number,
    y: number,
    r: { x: number; y: number; width: number; height: number }
  ) => x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      setHover(null)
      return
    }

    const internalX = ((event.clientX - rect.left) * CANVAS_WIDTH) / rect.width
    const internalY = ((event.clientY - rect.top) * CANVAS_HEIGHT) / rect.height

    const sheetX = (internalX - offsetX) / scale
    const sheetY = (internalY - offsetY) / scale

    if (
      sheetX < 0 ||
      sheetY < 0 ||
      sheetX > sheetWidth ||
      sheetY > sheetHeight
    ) {
      setHover(null)
      return
    }

    for (let i = 0; i < result.placedPieces.length; i++) {
      if (hitRect(sheetX, sheetY, result.placedPieces[i])) {
        setHover({ kind: 'piece', index: i })
        return
      }
    }

    for (let i = 0; i < result.wastedRectangles.length; i++) {
      if (hitRect(sheetX, sheetY, result.wastedRectangles[i])) {
        setHover({ kind: 'waste', index: i })
        return
      }
    }

    setHover(null)
  }

  const handleMouseLeave = () => setHover(null)

  // ------------------------------------------------------------
  // Hover overlay + tooltip (SVG)
  // ------------------------------------------------------------

  const hoverRect: PlacedPiece | WasteRectangle | null =
    hover == null
      ? null
      : hover.kind === 'piece'
      ? result.placedPieces[hover.index]
      : result.wastedRectangles[hover.index]

  const tooltip = useMemo(() => {
    if (!hover || !hoverRect) return null

    const rectCanvasX = offsetX + hoverRect.x * scale
    const rectCanvasY = offsetY + hoverRect.y * scale
    const rectCanvasW = hoverRect.width * scale
    const rectCanvasH = hoverRect.height * scale

    const tooltipWidth = 260
    const tooltipHeight = hover.kind === 'piece' ? 84 : 64

    let tooltipX = rectCanvasX + 8
    let tooltipY = rectCanvasY + 8

    if (tooltipX + tooltipWidth > CANVAS_WIDTH - 8) {
      tooltipX = CANVAS_WIDTH - tooltipWidth - 8
    }
    if (tooltipY + tooltipHeight > CANVAS_HEIGHT - 8) {
      tooltipY = CANVAS_HEIGHT - tooltipHeight - 8
    }

    const isPiece = hover.kind === 'piece'
    const piece =
      isPiece && hover.kind === 'piece'
        ? result.placedPieces[hover.index]
        : null

    const title = isPiece
      ? `Panel #${hover.index + 1}`
      : `Waste #${hover.index + 1}`
    const dimensions = `W: ${hoverRect.width} × H: ${hoverRect.height}`
    const rotatedText =
      isPiece && piece ? `Rotated: ${piece.rotated ? 'Yes' : 'No'}` : undefined

    return {
      rectCanvasX,
      rectCanvasY,
      rectCanvasW,
      rectCanvasH,
      tooltipX,
      tooltipY,
      tooltipWidth,
      tooltipHeight,
      title,
      dimensions,
      rotatedText
    }
  }, [hover, hoverRect, offsetX, scale, result])

  return (
    <div
      className={[
        'rounded border border-slate-300 bg-white p-3 shadow-sm',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Details top-left */}
      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px] text-slate-700">
        <div>
          <span className="font-semibold text-slate-900">Sheet</span>{' '}
          {sheetWidth}×{sheetHeight}
        </div>
        <div>
          <span className="font-semibold text-slate-900">Panel</span>{' '}
          {input.pieceWidth}×{input.pieceHeight}
        </div>
        <div>
          <span className="font-semibold text-slate-900">Used</span>{' '}
          {result.usedArea.toLocaleString()} (
          {result.usedAreaPercentage.toFixed(0)}%)
        </div>
        <div>
          <span className="font-semibold text-slate-900">Waste</span>{' '}
          {result.wastedArea.toLocaleString()} (
          {result.wastedAreaPercentage.toFixed(0)}%)
        </div>
        <div>
          <span className="font-semibold text-slate-900">Panels</span>{' '}
          {result.placedPieces.length}
        </div>
        <div>
          <span className="font-semibold text-slate-900">Waste panels</span>{' '}
          {result.wastedRectangles.length}
        </div>
      </div>

      {/* Legend */}
      <div className="mb-2 flex items-center gap-4 text-[12px] text-slate-700">
        <div className="inline-flex items-center gap-1">
          <span className="h-[11px] w-[11px] border border-slate-400 bg-[#f5f0ff]" />
          <span>Panels</span>
        </div>
        <div className="inline-flex items-center gap-1">
          <span className="h-[11px] w-[11px] border border-rose-400 bg-[#ffe4e6]" />
          <span>Waste</span>
        </div>
      </div>

      {/* Canvas: full width of container */}
      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="h-auto w-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* SVG overlay for highlight + tooltip */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          aria-hidden="true"
        >
          {tooltip && hover && (
            <>
              <rect
                x={tooltip.rectCanvasX}
                y={tooltip.rectCanvasY}
                width={tooltip.rectCanvasW}
                height={tooltip.rectCanvasH}
                fill={hover.kind === 'piece' ? '#c4d9ff' : '#fecaca'}
                fillOpacity={0.5}
                stroke={hover.kind === 'piece' ? '#2563eb' : '#dc2626'}
                strokeWidth={2}
              />
              <rect
                x={tooltip.tooltipX}
                y={tooltip.tooltipY}
                width={tooltip.tooltipWidth}
                height={tooltip.tooltipHeight}
                rx={4}
                ry={4}
                fill="#111827"
                opacity={0.98}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text
                x={tooltip.tooltipX + 10}
                y={tooltip.tooltipY + 20}
                fontSize={24}
                fill="#e5e7eb"
              >
                {tooltip.title}
              </text>
              <text
                x={tooltip.tooltipX + 10}
                y={tooltip.tooltipY + 38}
                fontSize={20}
                fill="#d1d5db"
              >
                {tooltip.dimensions}
              </text>
              {tooltip.rotatedText && (
                <text
                  x={tooltip.tooltipX + 10}
                  y={tooltip.tooltipY + 56}
                  fontSize={20}
                  fill="#9ca3af"
                >
                  {tooltip.rotatedText}
                </text>
              )}
            </>
          )}
        </svg>
      </div>
    </div>
  )
}
