import { NestingCanvasVisualizer } from '@/components/nesting-canvas-visualizer'
import { computeMaxPackedPiecesExtended } from '@/lib/nesting/max-rec-packing'
import type { RectPackingInput, RectPackingOutput } from '@/lib/nesting/types'

const input: RectPackingInput = {
  sheetWidth: 2000,
  sheetHeight: 1000,
  pieceWidth: 945,
  pieceHeight: 200,
  // pieceWidth: 865,
  // pieceHeight: 200
  // spacingX: 10,
  spacingY: 10
}

const output = computeMaxPackedPiecesExtended(input)

export default function Page() {
  return (
    <div className="p-6 flex justify-center items-center">
      <div className="w-full h-full rounded-lg max-w-6xl max-h-[100px] border border-gray-300">
        <NestingCanvasVisualizer input={input} result={output} />
      </div>
    </div>
  )
}
