import { generateId } from '../helpers/id-generator'
import prisma from '../lib/db'
import { UserRole } from '../types'

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
    email: 'test@test4.com',
    username: 'Production mamanger',
    passwordHash: '12345678',
    role: 'PRODUCTION_MANAGER',
    employeeId: 501,
    phone: '0676470240'
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
  },

  // testing accounts
  {
    email: 'test@test.com',
    username: 'Finance Manager',
    passwordHash: '12345678',
    role: 'FINANCE_MANAGER',
    employeeId: 100,
    phone: '0'
  },
  {
    email: 'admin@test.com',
    username: 'Admin',
    passwordHash: '12345678',
    role: 'ADMIN',
    employeeId: 11,
    phone: '0000000000'
  },

  {
    email: 'inventory_agent@test.com',
    username: 'Inventory Manager',
    passwordHash: '12345678',
    role: 'INVENTORY_AGENT',
    employeeId: 101,
    phone: '1'
  },
  {
    email: 'test2@test.com',
    username: 'Sales Manager',
    passwordHash: '12345678',
    role: 'SALES_MANAGER',
    employeeId: 102,
    phone: '2'
  },
  {
    email: 'test3@gmail.com',
    username: 'Hmad Bouchaala',
    passwordHash: '12345678',
    role: 'PROCRUTEMENT_AGENT',
    employeeId: 103,
    phone: '0665650868'
  },
  {
    email: 'a.bouchala@okindustrie.com',
    username: 'Bouchaala',
    passwordHash: '0770506517',
    role: 'PROCRUTEMENT_MANAGER',
    employeeId: 15,
    phone: '0770506517'
  },
  {
    email: 'a.tabet@okindustrie.com',
    username: 'Tabet Ahmed',
    passwordHash: '0770497280',
    role: 'PROCRUTEMENT_AGENT',
    employeeId: 806,
    phone: '0770497280'
  },
  {
    email: 'bensaniabellacem@gmail.com',
    username: 'Bensania',
    passwordHash: '0664410743',
    role: 'PROCRUTEMENT_AGENT',
    employeeId: 879,
    phone: '0664410743'
  },
  {
    email: 'n.mehaya@okindustrie.com',
    username: 'Mehaya',
    passwordHash: '0770536544',
    role: 'PROCRUTEMENT_AGENT',
    employeeId: 896,
    phone: '0770536544'
  }
]

async function main() {
  console.log(`Start seeding ...`)
  for (const data of users) {
    try {
      const user = await prisma.user.upsert({
        where: { email: data.email },
        create: {
          id: generateId('EM'),
          ...data
        },
        update: {
          username: data.username,
          passwordHash: data.passwordHash,
          role: data.role,
          employeeId: data.employeeId,
          phone: data.phone
        }
      })
      console.log(`User ${user.username} upserted successfully!`)
    } catch (error) {
      console.log({ message: `User Creation error !`, error })
    }
  }
}

main().finally(() => prisma.$disconnect())
