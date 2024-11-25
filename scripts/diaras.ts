import { PrismaClient } from '@prisma/client'
import { wilayas } from './data/algeria-cities.json'

const prisma = new PrismaClient()

async function upload() {
  try {
    for (const { code: codeWilaya, dairas } of wilayas) {
      for (const { code, name, name_ar } of dairas) {
        await prisma.daira.create({
          data: {
            code,
            name,
            name_ar,
            Wilaya: {
              connect: {
                code: codeWilaya
              }
            }
          }
        })
      }
    }

    console.log('[======= done! =======]')
  } catch (error) {
    console.error('Error uploading countries:', error)
  } finally {
    await prisma.$disconnect()
  }
}

upload()
