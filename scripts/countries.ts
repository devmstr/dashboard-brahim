// uploadCountries.ts

import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

// Define a type for the country data based on what we expect from the API
interface CountryData {
  code: string
  name_ar: string
  name: string
}

async function upload() {
  try {
    // Fetch country data from the public API
    const response = await axios.get('https://restcountries.com/v3.1/all')

    const countries = response.data as {
      cca2: string
      translations: { ara: { common: string } }
      name: { common: string }
    }[]

    // Prepare the data in the desired format for Prisma
    const countryData: CountryData[] = countries.map((country, index) => ({
      code: country.cca2, // Alpha-2 code
      name_ar: country.translations.ara.common || country.name.common,
      name: country.name.common
    }))

    // Insert the country data into the database
    await prisma.country.createMany({
      data: countryData
    })

    console.log('[======= done! =======]')
  } catch (error) {
    console.error('Error uploading countries:', error)
  } finally {
    await prisma.$disconnect()
  }
}

upload()
