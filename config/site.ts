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
  name: 'Système de Gestion de Produit',
  description: '',
  url: '#',
  authors: [
    {
      name: 'Dev_MSTR',
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
