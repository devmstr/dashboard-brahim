const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const data = require('./data.json')
const { create } = require('lodash')
async function addAdminAccount() {
  await prisma.user.create({
    data: {
      name: 'admin',
      role: 'admin',
      password: 'Admin1234' // Use hashed passwords in production
    }
  })
  console.log('Admin user created')
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
  console.log('Fake data uploaded successfully created')
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
