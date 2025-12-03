export interface RectPackingInput {
  sheetWidth: number
  sheetHeight: number
  pieceWidth: number
  pieceHeight: number
  marginX?: number
  marginY?: number
  spacingX?: number
  spacingY?: number
}

export interface PlacedPiece {
  x: number
  y: number
  width: number
  height: number
  rotated: boolean
}

export interface WasteRectangle {
  x: number
  y: number
  width: number
  height: number
}

export interface RectPackingOutput {
  maxPieces: number
  usedArea: number
  usedAreaPercentage: number
  wastedArea: number
  wastedAreaPercentage: number
  placedPieces: PlacedPiece[]
  wastedRectangles: WasteRectangle[]
}
