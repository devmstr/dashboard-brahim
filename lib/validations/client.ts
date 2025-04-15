import * as z from 'zod'

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string()
})

export type ClientType = z.infer<typeof clientSchema>
