const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const data = require('./data.json')

async function addAdminAccount() {
  await prisma.user.createMany({
    data: [
      {
        name: 'admin',
        role: 'admin',
        password: 'Password1234' // Use hashed passwords in production
      }
      // {
      //   name: 'production',
      //   role: 'production',
      //   password: 'Password1234'
      // },
      // {
      //   name: 'sales',
      //   role: 'sales',
      //   password: 'Password1234'
      // },
      // {
      //   name: 'engineering',
      //   role: 'engineering',
      //   password: 'Password1234'
      // }
    ]
  })
  console.log('Fake Users list created successfully...')
}

async function addFakeData() {
  await Promise.all(
    data.map(({ customer, ...item }) => {
      return prisma.order.create({
        data: {
          ...item,
          Client: {
            connectOrCreate: {
              where: {
                phone: customer.phone
              },
              create: {
                ...customer
              }
            }
          }
        }
      })
    })
  )
  console.log('Fake orders data created successfully...')
}

async function main() {
  await prisma.user.deleteMany()
  await prisma.client.deleteMany()
  await prisma.order.deleteMany()
  addAdminAccount()
  // addFakeData()
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
