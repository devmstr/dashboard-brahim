const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const data = require('./data.json')
const { create } = require('lodash')
async function addAdminAccount() {
  const adminExists = await prisma.user.findFirst({
    where: {
      role: 'admin'
    }
  })
  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: 'brahim',
        role: 'admin',
        password: 'Admin1234' // Use hashed passwords in production
      }
    })
    console.log('Admin user created')
  } else {
    console.log('Admin user already exists')
  }
}

async function addFakeData() {
  const isDataExist = await prisma.order.findFirst({
    where: {
      id: '24-0299'
    }
  })
  if (!isDataExist) {
    await prisma.order.deleteMany()
    await prisma.client.deleteMany()
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
  } else {
    console.log('Fake data already exists')
  }
}

async function main() {
  addAdminAccount()
  addFakeData()
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
