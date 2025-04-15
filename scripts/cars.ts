import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

let counter = 1

function skuId() {
  return `VEX${String(counter++).padStart(4, '0')}`
}

async function main() {
  console.log('Starting to seed the database...')

  // Clean up existing data
  await prisma.brand.deleteMany()

  console.log('Cleaned up existing data')

  // BMW
  const bmw = await prisma.brand.create({
    data: {
      name: 'BMW'
    }
  })
  console.log(`Created brand: ${bmw.name}`)

  // BMW X Series
  const bmwXSeries = await prisma.carFamily.create({
    data: {
      name: 'X Series',
      brandId: bmw.id
    }
  })
  console.log(`Created family: ${bmwXSeries.name}`)

  // BMW X1
  const bmwX1 = await prisma.carModel.create({
    data: {
      id: skuId(),
      name: 'X1',
      production: '10/2009 - 06/2015',
      familyId: bmwXSeries.id
    }
  })
  console.log(`Created model: ${bmwX1.name}`)

  // BMW X1 Types
  const bmwX1Types = await Promise.all([
    prisma.carType.create({
      data: {
        name: '16d sDrive 2.0 d 16V DPF 116cv',
        modelId: bmwX1.id
      }
    }),
    prisma.carType.create({
      data: {
        name: '18d sDrive 2.0 d 16V DPF 143cv',
        modelId: bmwX1.id
      }
    }),
    prisma.carType.create({
      data: {
        name: '20d xDrive 2.0 d 16V DPF 184cv',
        modelId: bmwX1.id
      }
    })
  ])
  console.log(`Created ${bmwX1Types.length} types for model: ${bmwX1.name}`)

  // BMW X3
  const bmwX3 = await prisma.carModel.create({
    data: {
      id: skuId(),
      name: 'X3',
      production: '08/2010 - 03/2017',
      familyId: bmwXSeries.id
    }
  })
  console.log(`Created model: ${bmwX3.name}`)

  // BMW X3 Types
  const bmwX3Types = await Promise.all([
    prisma.carType.create({
      data: {
        name: '20d xDrive 2.0 d 16V DPF 184cv',
        modelId: bmwX3.id
      }
    }),
    prisma.carType.create({
      data: {
        name: '30d xDrive 3.0 d 24V DPF 258cv',
        modelId: bmwX3.id
      }
    }),
    prisma.carType.create({
      data: {
        name: '35i xDrive 3.0 i 24V 306cv',
        modelId: bmwX3.id
      }
    })
  ])
  console.log(`Created ${bmwX3Types.length} types for model: ${bmwX3.name}`)

  // BMW 3 Series
  const bmw3Series = await prisma.carFamily.create({
    data: {
      name: '3 Series',
      brandId: bmw.id
    }
  })
  console.log(`Created family: ${bmw3Series.name}`)

  // BMW 3 Series Sedan
  const bmw3Sedan = await prisma.carModel.create({
    data: {
      id: skuId(),
      name: '3 Sedan (F30)',
      production: '02/2012 - 10/2018',
      familyId: bmw3Series.id
    }
  })
  console.log(`Created model: ${bmw3Sedan.name}`)

  // BMW 3 Series Sedan Types
  const bmw3SedanTypes = await Promise.all([
    prisma.carType.create({
      data: {
        name: '316i 1.6 i 16V 136cv',
        modelId: bmw3Sedan.id
      }
    }),
    prisma.carType.create({
      data: {
        name: '320d 2.0 d 16V 184cv',
        modelId: bmw3Sedan.id
      }
    }),
    prisma.carType.create({
      data: {
        name: '335i 3.0 i 24V 306cv',
        modelId: bmw3Sedan.id
      }
    })
  ])
  console.log(
    `Created ${bmw3SedanTypes.length} types for model: ${bmw3Sedan.name}`
  )

  // Mercedes-Benz
  const mercedes = await prisma.brand.create({
    data: {
      name: 'Mercedes-Benz'
    }
  })
  console.log(`Created brand: ${mercedes.name}`)

  // Mercedes C-Class
  const mercedesCClass = await prisma.carFamily.create({
    data: {
      name: 'C-Class',
      brandId: mercedes.id
    }
  })
  console.log(`Created family: ${mercedesCClass.name}`)

  // Mercedes C-Class W205
  const mercedesW205 = await prisma.carModel.create({
    data: {
      id: skuId(),
      name: 'W205',
      production: '03/2014 - 05/2021',
      familyId: mercedesCClass.id
    }
  })
  console.log(`Created model: ${mercedesW205.name}`)

  // Mercedes C-Class W205 Types
  const mercedesW205Types = await Promise.all([
    prisma.carType.create({
      data: {
        name: 'C 180 1.6 i 16V 156cv',
        modelId: mercedesW205.id
      }
    }),
    prisma.carType.create({
      data: {
        name: 'C 220d 2.1 d 16V 170cv',
        modelId: mercedesW205.id
      }
    }),
    prisma.carType.create({
      data: {
        name: 'C 63 AMG 4.0 V8 32V 476cv',
        modelId: mercedesW205.id
      }
    })
  ])
  console.log(
    `Created ${mercedesW205Types.length} types for model: ${mercedesW205.name}`
  )

  // Mercedes E-Class
  const mercedesEClass = await prisma.carFamily.create({
    data: {
      name: 'E-Class',
      brandId: mercedes.id
    }
  })
  console.log(`Created family: ${mercedesEClass.name}`)

  // Mercedes E-Class W213
  const mercedesW213 = await prisma.carModel.create({
    data: {
      id: skuId(),
      name: 'W213',
      production: '04/2016 - Present',
      familyId: mercedesEClass.id
    }
  })
  console.log(`Created model: ${mercedesW213.name}`)

  // Mercedes E-Class W213 Types
  const mercedesW213Types = await Promise.all([
    prisma.carType.create({
      data: {
        name: 'E 200 2.0 i 16V 184cv',
        modelId: mercedesW213.id
      }
    }),
    prisma.carType.create({
      data: {
        name: 'E 220d 2.0 d 16V 194cv',
        modelId: mercedesW213.id
      }
    }),
    prisma.carType.create({
      data: {
        name: 'E 63 AMG 4.0 V8 32V 571cv',
        modelId: mercedesW213.id
      }
    })
  ])
  console.log(
    `Created ${mercedesW213Types.length} types for model: ${mercedesW213.name}`
  )

  // Audi
  const audi = await prisma.brand.create({
    data: {
      name: 'Audi'
    }
  })
  console.log(`Created brand: ${audi.name}`)

  // Audi A Series
  const audiASeries = await prisma.carFamily.create({
    data: {
      name: 'A Series',
      brandId: audi.id
    }
  })
  console.log(`Created family: ${audiASeries.name}`)

  // Audi A4
  const audiA4 = await prisma.carModel.create({
    data: {
      id: skuId(),
      name: 'A4 (B9)',
      production: '11/2015 - Present',
      familyId: audiASeries.id
    }
  })
  console.log(`Created model: ${audiA4.name}`)

  // Audi A4 Types
  const audiA4Types = await Promise.all([
    prisma.carType.create({
      data: {
        name: '30 TDI 2.0 d 16V 136cv',
        modelId: audiA4.id
      }
    }),
    prisma.carType.create({
      data: {
        name: '35 TFSI 2.0 i 16V 150cv',
        modelId: audiA4.id
      }
    }),
    prisma.carType.create({
      data: {
        name: '45 TFSI quattro 2.0 i 16V 245cv',
        modelId: audiA4.id
      }
    })
  ])
  console.log(`Created ${audiA4Types.length} types for model: ${audiA4.name}`)

  // Audi Q Series
  const audiQSeries = await prisma.carFamily.create({
    data: {
      name: 'Q Series',
      brandId: audi.id
    }
  })
  console.log(`Created family: ${audiQSeries.name}`)

  // Audi Q5
  const audiQ5 = await prisma.carModel.create({
    data: {
      id: skuId(),
      name: 'Q5 (FY)',
      production: '01/2017 - Present',
      familyId: audiQSeries.id
    }
  })
  console.log(`Created model: ${audiQ5.name}`)

  // Audi Q5 Types
  const audiQ5Types = await Promise.all([
    prisma.carType.create({
      data: {
        name: '40 TDI quattro 2.0 d 16V 190cv',
        modelId: audiQ5.id
      }
    }),
    prisma.carType.create({
      data: {
        name: '45 TFSI quattro 2.0 i 16V 245cv',
        modelId: audiQ5.id
      }
    }),
    prisma.carType.create({
      data: {
        name: 'SQ5 TDI 3.0 V6 24V 347cv',
        modelId: audiQ5.id
      }
    })
  ])
  console.log(`Created ${audiQ5Types.length} types for model: ${audiQ5.name}`)

  // Toyota
  const toyota = await prisma.brand.create({
    data: {
      name: 'Toyota'
    }
  })
  console.log(`Created brand: ${toyota.name}`)

  // Toyota Corolla
  const toyotaCorollaFamily = await prisma.carFamily.create({
    data: {
      name: 'Corolla',
      brandId: toyota.id
    }
  })
  console.log(`Created family: ${toyotaCorollaFamily.name}`)

  // Toyota Corolla E210
  const toyotaCorollaE210 = await prisma.carModel.create({
    data: {
      id: skuId(),
      name: 'Corolla (E210)',
      production: '07/2018 - Present',
      familyId: toyotaCorollaFamily.id
    }
  })
  console.log(`Created model: ${toyotaCorollaE210.name}`)

  // Toyota Corolla E210 Types
  const toyotaCorollaE210Types = await Promise.all([
    prisma.carType.create({
      data: {
        name: '1.2T 16V 116cv',
        modelId: toyotaCorollaE210.id
      }
    }),
    prisma.carType.create({
      data: {
        name: '1.8 Hybrid 16V 122cv',
        modelId: toyotaCorollaE210.id
      }
    }),
    prisma.carType.create({
      data: {
        name: '2.0 Hybrid 16V 184cv',
        modelId: toyotaCorollaE210.id
      }
    })
  ])
  console.log(
    `Created ${toyotaCorollaE210Types.length} types for model: ${toyotaCorollaE210.name}`
  )

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
