'use client'
import { UserRole } from '@/types'
import prisma from '../lib/db'

// const prisma = new PrismaClient()

type User = {
  email: string
  username: string
  passwordHash: string
  role: UserRole
  employeeId: number
  phone: string
}

const users: User[] = [
  {
    email: 'bouchelga.abdelmadjid@gmail.com',
    username: 'Bouchelga Abdelmadjid',
    passwordHash: '0770536564',
    role: 'CONSULTANT',
    employeeId: 210,
    phone: '0770536564'
  },

  {
    email: 'saiti.nesrine@gmail.com',
    username: 'Saiti Nesrine',
    passwordHash: '0676470243',
    role: 'DATA_AGENT',
    employeeId: 818,
    phone: '0676470243'
  },
  {
    email: 'souna.abdelouahab@gmail.com',
    username: 'Souna Abdelouahab',
    passwordHash: '0667012443',
    role: 'ENGINEERING_MANAGER',
    employeeId: 724,
    phone: '0667012443'
  },
  {
    email: 'bouguennamounir@gmail.com',
    username: 'Bouguenna Mounir',
    passwordHash: '0658188351',
    role: 'SALES_AGENT',
    employeeId: 533,
    phone: '0658188351'
  },
  {
    email: 'bouhafs.mustapha@gmail.com',
    username: 'Bouhafs Mustapha',
    passwordHash: '0673124934',
    role: 'SALES_AGENT',
    employeeId: 630,
    phone: '0673124934'
  },
  {
    email: 'cherif_amar@gmail.com',
    username: 'Cherif Amar',
    passwordHash: '0665650862',
    role: 'SALES_AGENT',
    employeeId: 804,
    phone: '0665650862'
  }
]

async function main() {
  const { generateId } = await import('../helpers/id-generator')
  console.log(`Start seeding ...`)
  // Clear existing users
  await prisma.user.deleteMany()
  console.log(`Deleted all existing users.`)

  // Create new users

  for (const data of users) {
    try {
      const user = await prisma.user.create({
        data: {
          id: generateId('EM'), // Generate SKU for employee
          ...data
        }
      })
      console.log(`User ${user.username} created successfully!`)
    } catch (error) {
      console.log({ message: `User Creation error !`, error })
    }
  }
}

main().finally(() => prisma.$disconnect())
