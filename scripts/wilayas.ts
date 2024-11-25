import { PrismaClient } from '@prisma/client'
import { wilayas } from './data/algeria-cities.json'

const prisma = new PrismaClient()

async function upload() {
  try {
    await prisma.wilaya.createMany({
      data: wilayas.map(({ code, name, name_ar }) => ({
        code,
        name,
        name_ar
      }))
    })
    console.log('[======= done! =======]')
  } catch (error) {
    console.error('Error uploading countries:', error)
  } finally {
    await prisma.$disconnect()
  }
}

upload()
