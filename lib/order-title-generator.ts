import { ArticleValidationType } from './validations'

const FINS_DICTIONARY = {
  'Droite (Normale)': 'NL',
  'Droite (Aérer)': 'AERE',
  Zigzag: 'TR'
}
const CLAMPING_DICTIONARY = {
  Plié: 'PL',
  Boulonné: 'BL'
}

export function genTitle({
  type,
  fabrication,
  core,
  collector,
  car,
  description
}: ArticleValidationType) {
  const getTitleDimensions = (dim1?: number, dim2?: number) =>
    dim1 === dim2 ? `${dim1}` : `${dim1}/${dim2}`

  const finsInTitle =
    FINS_DICTIONARY[core?.fins as keyof typeof FINS_DICTIONARY]

  if (type == 'Faisceau') {
    const clampingInTitle =
      CLAMPING_DICTIONARY[
        collector?.tightening as keyof typeof CLAMPING_DICTIONARY
      ]
    const collectorLength = getTitleDimensions(
      collector?.upperDimensions.height,
      collector?.lowerDimensions?.height
    )
    const collectorWidth = getTitleDimensions(
      collector?.upperDimensions.width,
      collector?.lowerDimensions?.width
    )
    return `FAIS ${core?.dimensions.height}X${core?.dimensions.width}X${core?.rows}R ${finsInTitle} PAS ${core?.finsPitch} COLL ${collectorLength}X${collectorWidth} ${clampingInTitle}`
  } else if (type == 'Radiateur') {
    const fabricationInTitle = fabrication.slice(0, 3).toUpperCase()
    const carInTitle = car
      ? `${car?.brand?.toUpperCase()} ${car?.model?.toUpperCase()} ${car?.brand?.toUpperCase()}`
      : 'SELON MODEL'
    return `RAD ${fabricationInTitle} ${carInTitle} ${core?.rows}R ${finsInTitle} PAS ${core?.finsPitch}`
  } else {
    return `AUTRE ${description}`
  }
}
