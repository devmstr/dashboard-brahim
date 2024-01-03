type SiteConfig = {
  name: string
  description: string
  url: string
  authors: [
    {
      name: string
      emails: string[]
      github: string
      url: string
    }
  ]
}

export const siteConfig: SiteConfig = {
  name: 'Brahim Admin',
  description: 'Cloud-based HCM SasS Application',
  url: 'https://perfectassesspro.com',
  authors: [
    {
      name: 'DevMSTR',
      emails: [
        'contact@ismailsahli.me',
        'mohamed.ismail.sahli@gmail.com',
        'sahli.ismail.med@gmail.com',
        'sahli.med@outlook.com'
      ],
      github: 'https://gitthub.com/devmstr',
      url: 'https://ismailsahli.me'
    }
  ]
}
