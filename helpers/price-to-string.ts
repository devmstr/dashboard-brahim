import n2words from 'n2words'

export function amountToWords(amount: number): string {
  const dinars = Math.floor(amount)
  const centimes = Math.round((amount - dinars) * 100)

  const dinarsInWords = dinars === 0 ? 'zéro' : n2words(dinars, { lang: 'fr' })
  const centimesInWords =
    centimes === 0 ? 'zéro' : n2words(centimes, { lang: 'fr' })

  return `${dinarsInWords} dinars Algériens et ${centimesInWords} centimes`
}
