const { faker } = require('@faker-js/faker')
const { PrismaClient } = require('@prisma/client')
const { clear } = require('console')
const prisma = new PrismaClient()

// Constants
const MANUFACTURING_TYPES = ['Zigzag', 'Platte']
const PAS_TYPES = ['8', '10', '12']
const ORDER_STATUS = ['Annuler', 'Non Commence', 'Encours', 'Fini']
const ORDER_MANUFACTURING = ['Renovation', 'Confection']
const ORDER_TYPE = ['Faisceau', 'Radiateur']
const DATE_INTERVAL = 30 // the date range variations
const INSIDE_DATE_INTERVAL = 8 // the date range variations
const FIRST_PRODUCT_ID = 1
let orderNumber = FIRST_PRODUCT_ID
function coid() {
  const id = `24-${orderNumber.toString().padStart(4, '0')}`
  orderNumber = orderNumber + 1
  return id
}

// Helper function to generate dates close to the current date
function generateDates() {
  const currentDate = new Date()

  // Generate receivingDate within 5 days before or after the current date
  const receivingDate = faker.date.between({
    from: faker.date.recent({ days: DATE_INTERVAL, refDate: currentDate }),
    to: faker.date.soon({ days: DATE_INTERVAL, refDate: currentDate })
  })

  // Generate startDate within 1-2 days after receivingDate
  const startDate = faker.date.soon({
    days: INSIDE_DATE_INTERVAL,
    refDate: receivingDate
  })

  // Generate endDate within 1-2 days after startDate
  const endDate = faker.date.soon({
    days: INSIDE_DATE_INTERVAL,
    refDate: startDate
  })

  // Generate actualEnd within 1-2 days after endDate
  const actualEnd = faker.date.soon({
    days: INSIDE_DATE_INTERVAL,
    refDate: endDate
  })

  // Ensure total duration is less than 13 days between receivingDate and actualEnd
  const maxDuration = 15 * 24 * 60 * 60 * 1000 // 13 days in milliseconds
  if (actualEnd.getTime() - receivingDate.getTime() > maxDuration) {
    const actualEndCandidate = new Date(receivingDate)
    actualEndCandidate.setDate(receivingDate.getDate() + 12)
    return { receivingDate, startDate, endDate, actualEnd: actualEndCandidate }
  }

  return { receivingDate, startDate, endDate, actualEnd }
}

// Generate fake clients with a 9 or 10 digit phone number
function generateClient() {
  const phoneLength = faker.helpers.arrayElement([9, 10]) // Randomly choose between 9 or 10
  const phoneNumber = faker.string.numeric({ length: phoneLength }) // Generate a numeric string

  return {
    id: faker.string.uuid(),
    phone: phoneNumber,
    fullName: faker.person.fullName()
  }
}

// Generate fake technical info with car brands and models, and random constant values
function generateTechnical() {
  return {
    id: faker.string.uuid(),
    brand: faker.vehicle.manufacturer(),
    model: faker.vehicle.model(),
    type: faker.helpers.arrayElement(MANUFACTURING_TYPES), // Random pick from MANUFACTURING_TYPES
    pas: faker.helpers.arrayElement(PAS_TYPES), // Random pick from PAS_TYPES
    nr: faker.number.int({ min: 1, max: 100 }),
    ec: faker.number.int({ min: 1, max: 100 }),
    lar1: faker.number.int({ min: 1, max: 100 }),
    lon: faker.number.int({ min: 1, max: 100 }),
    lar2: faker.number.int({ min: 1, max: 100 })
  }
}

// Generate fake orders with complete client and technical data included
function generateOrder(clientId, technicalId) {
  const { receivingDate, startDate, endDate, actualEnd } = generateDates()
  const price = faker.number.int({ min: 25000, max: 450000 })
  const deposit = faker.number.int({ min: 8000, max: 25000 })
  const remaining = price - deposit
  return {
    id: coid(),
    serialNumber: faker.string.alphanumeric(10),
    status: faker.helpers.arrayElement(ORDER_STATUS), // Random pick from ORDER_STATUS
    quantity: faker.number.int({ min: 1, max: 100 }),
    productionDays: faker.number.int({ min: 1, max: 30 }),
    type: faker.helpers.arrayElement(ORDER_TYPE), // Random pick from ORDER_TYPE
    manufacturing: faker.helpers.arrayElement(ORDER_MANUFACTURING), // Random pick from ORDER_MANUFACTURING
    receivingDate,
    startDate,
    endDate,
    actualEnd,
    price,
    deposit,
    remaining,
    progress: faker.number.int({ min: 0, max: 100 }),
    clientId,
    technicalId
  }
}

// Generate data with orders containing full client and technical data
function generateData(numClients, numTechnicals, numOrders) {
  const clients = []
  const technicals = []
  const orders = []

  for (let i = 0; i < numClients; i++) {
    clients.push(generateClient())
  }

  for (let i = 0; i < numTechnicals; i++) {
    technicals.push(generateTechnical())
  }

  for (let i = 0; i < numOrders; i++) {
    const clientId = faker.helpers.arrayElement(clients).id
    const technicalId = faker.helpers.arrayElement(technicals).id
    const order = generateOrder(clientId, technicalId)
    orders.push(order)
  }

  return { orders, clients, technicals }
}

// Generate sample data

async function addFakeData() {
  const { orders, clients, technicals } = generateData(10, 5, 20)
  // console.log(orders)
  await Promise.all(
    technicals.map((technical) => {
      return prisma?.technical.create({
        data: technical
      })
    })
  )
  await Promise.all(
    clients.map((client) => {
      return prisma?.client.create({
        data: client
      })
    })
  )
  await Promise.all(
    orders.map((order) => {
      return prisma?.order.create({
        data: order
      })
    })
  )
  console.log('Fake orders data created successfully...')
}

async function main() {
  await prisma?.order.deleteMany()
  await prisma?.client.deleteMany()
  await prisma?.technical.deleteMany()
  await addFakeData()
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma?.$disconnect()
  })
