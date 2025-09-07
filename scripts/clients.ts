import { generateId } from '../helpers/id-generator'
import { PrismaClient, Province } from '@prisma/client'
import data from '../seed/clients.json'

const prisma = new PrismaClient()

interface ClientData {
  id: string
  street: string
  faxNumbers: string[]
  label: string
  name: string
  ai: string // registrationArticle
  nif: string // taxIdNumber
  rc: string // tradeRegisterNumber
  phones: string[]
  wilaya: string
}

// String similarity function using Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}

// Calculate similarity percentage
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 100

  const distance = levenshteinDistance(str1, str2)
  return ((maxLength - distance) / maxLength) * 100
}

// Normalize string for better matching
function normalizeString(str: string): string {
  return (
    str
      .toLowerCase()
      .trim()
      // Handle common abbreviations
      .replace(/^b\.b\.arreridj$/i, 'bordj bou arreridj')
      .replace(/^bb\.arreridj$/i, 'bordj bou arreridj')
      // Remove accents and diacritics
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Standardize common variations
      .replace(/bel\s+/g, 'bel')
      .replace(/sidi\s+/g, 'sidi')
      .replace(/ain\s+/g, 'ain')
      .replace(/oued\s+/g, 'oued')
      .replace(/el\s+/g, 'el')
      // Remove extra spaces and dots
      .replace(/\./g, '')
      .replace(/\s+/g, ' ')
      .trim()
  )
}

// Algerian wilaya name variations mapping
const wilayaVariations: Record<string, string[]> = {
  adrar: ['adrar'],
  chlef: ['chlef', 'ech chlef'],
  laghouat: ['laghouat', 'el aghouat'],
  'oum el bouaghi': ['oum el bouaghi', 'oum bouaghi'],
  batna: ['batna'],
  bejaia: ['bejaia', 'bougie'],
  biskra: ['biskra'],
  bechar: ['bechar', 'béchar'],
  blida: ['blida'],
  bouira: ['bouira'],
  tamanrasset: ['tamanrasset', 'tamanghasset'],
  tebessa: ['tebessa', 'tébessa'],
  tlemcen: ['tlemcen'],
  tiaret: ['tiaret'],
  'tizi ouzou': ['tizi ouzou', 'tizi-ouzou'],
  alger: ['alger', 'algiers', 'el djazair'],
  djelfa: ['djelfa'],
  jijel: ['jijel'],
  setif: ['setif', 'sétif'],
  saida: ['saida', 'saïda'],
  skikda: ['skikda'],
  'sidi bel abbes': [
    'sidi bel abbes',
    'sidi belabbes',
    'sidi belaabes',
    'sidi bel abbès'
  ],
  annaba: ['annaba', 'bône'],
  guelma: ['guelma'],
  constantine: ['constantine'],
  medea: ['medea', 'médéa'],
  mostaganem: ['mostaganem'],
  msila: ['msila', "m'sila"],
  mascara: ['mascara'],
  ouargla: ['ouargla', 'warqla'],
  oran: ['oran', 'wahran'],
  'el bayadh': ['el bayadh', 'el bayad'],
  illizi: ['illizi', 'ilizi'],
  'bordj bou arreridj': [
    'bordj bou arreridj',
    'bordj bou arréridj',
    'b.b.arreridj',
    'bb arreridj',
    'bordj bouarreridj'
  ],
  boumerdes: ['boumerdes', 'boumerdès'],
  'el tarf': ['el tarf', 'el-tarf'],
  tindouf: ['tindouf'],
  tissemsilt: ['tissemsilt'],
  'el oued': ['el oued', 'el-oued'],
  khenchela: ['khenchela'],
  'souk ahras': ['souk ahras', 'souk-ahras'],
  tipaza: ['tipaza', 'tipasa'],
  mila: ['mila'],
  'ain defla': ['ain defla', 'aïn defla'],
  naama: ['naama', 'nâama'],
  'ain temouchent': ['ain temouchent', 'aïn témouchent'],
  ghardaia: ['ghardaia', 'ghardaïa'],
  relizane: ['relizane', 'relizane']
}

// Enhanced province matching function
function findMatchingProvince(wilaya: string, provinces: any[]): any | null {
  const normalizedWilaya = normalizeString(wilaya)

  // 1. Try exact match first
  for (const province of provinces) {
    const normalizedProvince = normalizeString(province.name)
    if (normalizedProvince === normalizedWilaya) {
      return province
    }
  }

  // 2. Try variations mapping
  for (const [key, variations] of Object.entries(wilayaVariations)) {
    if (
      variations.some(
        (variation) => normalizeString(variation) === normalizedWilaya
      )
    ) {
      // Found in variations, now find the province
      for (const province of provinces) {
        const normalizedProvince = normalizeString(province.name)
        if (
          variations.some(
            (variation) => normalizeString(variation) === normalizedProvince
          )
        ) {
          return province
        }
      }
    }
  }

  // 3. Try fuzzy matching with similarity threshold
  let bestMatch: Province | null = null
  let bestSimilarity = 0
  const threshold = 70 // 70% similarity threshold

  for (const province of provinces) {
    const normalizedProvince = normalizeString(province.name)
    const similarity = calculateSimilarity(normalizedWilaya, normalizedProvince)

    if (similarity > threshold && similarity > bestSimilarity) {
      bestSimilarity = similarity
      bestMatch = province
    }
  }

  if (bestMatch) {
    console.log(
      `🔍 Fuzzy match found: "${wilaya}" → "${
        bestMatch.name
      }" (${bestSimilarity.toFixed(1)}% similarity)`
    )
    return bestMatch
  }

  return null
}

function getPreferredPhone(phones: string[]) {
  if (phones.length === 0) return ''

  // Look for mobile numbers (typically start with 05, 06, 07 in Algeria)
  const mobileNumber = phones.find((phone) => {
    const cleanPhone = phone.replace(/\s+/g, '')
    return (
      cleanPhone.startsWith('05') ||
      cleanPhone.startsWith('06') ||
      cleanPhone.startsWith('07')
    )
  })

  // Return mobile if found, otherwise return first phone
  return mobileNumber || phones[0] || undefined
}

function formatPhone(phone?: string): string {
  if (!phone) return ''

  // Clean the phone number
  const cleanPhone = phone.replace(/\s+/g, '')

  // Add +213 prefix if it doesn't start with + or 213
  if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('213')) {
    return `+213${cleanPhone}`
  }

  if (cleanPhone.startsWith('213') && !cleanPhone.startsWith('+')) {
    return `+${cleanPhone}`
  }

  return cleanPhone
}

async function seedClientsFromJson() {
  console.log('🧹 Cleaning up old clients...')
  await prisma.client.deleteMany()

  console.log('📖 Reading client data from JSON file...')

  const clientsData = data as ClientData[]

  console.log(`📊 Found ${clientsData.length} clients in JSON file`)

  console.log('🔍 Fetching location data from database...')

  // Get provinces from Algeria
  const provinces = await prisma.province.findMany({
    where: {
      Country: {
        code: 'DZ'
      }
    }
  })

  if (provinces.length === 0) {
    throw new Error(
      'No provinces found for Algeria. Please seed provinces first.'
    )
  }

  // Get cities for these provinces
  const cities = await prisma.city.findMany({
    where: { provinceId: { in: provinces.map((p) => p.id) } }
  })

  if (cities.length === 0) {
    throw new Error(
      'No cities found for the provinces. Please seed cities first.'
    )
  }

  console.log('🌱 Creating clients from JSON data...')

  // Create a map for wilaya to province matching
  // const wilayaToProvince = new Map<string, any>()
  // provinces.forEach((province) => {
  //   // Try to match wilaya names (you might need to adjust this mapping)
  //   const normalizedProvinceName = province.name.toLowerCase().trim()
  //   wilayaToProvince.set(normalizedProvinceName, province)
  // })

  let successCount = 0
  let errorCount = 0

  // Process each client from JSON
  for (const clientData of clientsData) {
    try {
      // Find matching province for wilaya using enhanced matching
      const matchedProvince = findMatchingProvince(clientData.wilaya, provinces)

      if (!matchedProvince) {
        console.warn(
          `⚠️  No province match found for wilaya: "${clientData.wilaya}", using fallback`
        )
      }

      const finalProvince = matchedProvince || provinces[0] // Fallback to first province

      // Get cities for the matched province
      const provinceCities = cities.filter(
        (city) => city.provinceId === finalProvince.id
      )
      const randomCity =
        provinceCities.length > 0 ? provinceCities[0] : cities[0] // Fallback

      // Create address first
      const address = await prisma.address.create({
        data: {
          street: clientData.street || 'N/A',
          Country: { connect: { code: 'DZ' } },
          Province: { connect: { id: finalProvince.id } },
          City: { connect: { id: randomCity.id } }
        }
      })

      // Get preferred phone number
      const preferredPhone = getPreferredPhone(clientData.phones)
      const formattedPhone = formatPhone(preferredPhone)

      // Create client with real data
      await prisma.client.create({
        data: {
          id: generateId('CL'),
          name: clientData.name,
          phone: formattedPhone,
          label: clientData.label || null,
          email: null, // Not provided in JSON schema
          isCompany: true, // Assuming all are companies based on the data structure
          website: null, // Not provided in JSON schema
          tradeRegisterNumber: clientData.rc || null,
          fiscalNumber: null, // Not provided in JSON schema
          registrationArticle: clientData.ai || null,
          taxIdNumber: clientData.nif || null,
          statisticalIdNumber: null, // Not provided in JSON schema
          approvalNumber: null, // Not provided in JSON schema
          Address: { connect: { id: address.id } }
        }
      })

      successCount++

      if (successCount % 10 === 0) {
        console.log(`✅ Processed ${successCount} clients...`)
      }
    } catch (error) {
      errorCount++
      console.error(`❌ Error processing client ${clientData.id}:`, error)
    }
  }

  console.log(
    `✅ Clients seeded successfully! ${successCount} created, ${errorCount} errors`
  )
}

seedClientsFromJson()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
