import { OrderType } from './validations'

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
  car,
  description
}: OrderType) {
  const getTitleDimensions = (dim1?: number, dim2?: number) =>
    dim1 === dim2 ? `${dim1}` : `${dim1}/${dim2}`

  const finsInTitle =
    FINS_DICTIONARY[core?.fins as keyof typeof FINS_DICTIONARY]

  if (type == 'Faisceau') {
    const clampingInTitle =
      CLAMPING_DICTIONARY[
        core?.collector?.cooling as keyof typeof CLAMPING_DICTIONARY
      ]
    const collectorLength = getTitleDimensions(
      core?.collector?.dimensions?.upper?.height,
      core?.collector?.dimensions?.lower?.height
    )
    const collectorWidth = getTitleDimensions(
      core?.collector?.dimensions?.upper?.width,
      core?.collector?.dimensions?.lower?.width
    )
    return `FAIS ${core?.height}X${core?.width}X${core?.rows}R ${finsInTitle} PAS ${core?.finsPitch} COLL ${collectorLength}X${collectorWidth} ${clampingInTitle}`
  } else if (type == 'Radiateur') {
    const fabricationInTitle = fabrication.slice(0, 3).toUpperCase()
    const carInTitle = car
      ? `${car?.manufacture?.toUpperCase()} ${car?.model?.toUpperCase()} ${car?.car?.toUpperCase()}`
      : 'SELON MODEL'
    return `RAD ${fabricationInTitle} ${carInTitle} ${core?.rows}R ${finsInTitle} PAS ${core?.finsPitch}`
  } else {
    return `AUTRE ${description}`
  }
}
