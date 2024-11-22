export enum ROLES {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  PRODUCTION = 'PRODUCTION',
  ENGINEERING = 'ENGINEER'
}

export const ROLES_MAP = new Map<string, string>([
  ['Commerciale', 'SALES'],
  ['Production', 'PRODUCTION'],
  ['Technicien', 'ENGINEER']
])
