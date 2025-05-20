import { z } from 'zod'

export const radiatorEditFormSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
  dirId: z.string(),
  car: z
    .object({
      id: z.string().optional(),
      brand: z.string().optional(),
      family: z.string().optional(),
      model: z.string().optional(),
      type: z.string().optional()
    })
    .optional(),
  core: z
    .object({
      height: z.preprocess(
        (v) => (v === '' ? undefined : Number(v)),
        z.number().optional()
      ),
      width: z.preprocess(
        (v) => (v === '' ? undefined : Number(v)),
        z.number().optional()
      ),
      rows: z.preprocess(
        (v) => (v === '' ? undefined : Number(v)),
        z.number().optional()
      ),
      fins: z.string().optional(),
      finsPitch: z.preprocess(
        (v) => (v === '' ? undefined : Number(v)),
        z.number().optional()
      ),
      tube: z.string().optional()
    })
    .optional(),
  collectors: z
    .object({
      top: z
        .object({
          width: z
            .preprocess((v) => (v === '' ? undefined : Number(v)), z.number())
            .optional(),
          height: z
            .preprocess((v) => (v === '' ? undefined : Number(v)), z.number())
            .optional(),
          thickness: z
            .preprocess((v) => (v === '' ? undefined : Number(v)), z.number())
            .optional(),
          type: z.string().optional(),
          position: z.string().optional(),
          tightening: z.string().optional(),
          isTinned: z.boolean().optional(),
          material: z.string().optional(),
          perforation: z.string().optional()
        })
        .optional(),
      bottom: z
        .object({
          width: z
            .preprocess((v) => (v === '' ? undefined : Number(v)), z.number())
            .optional(),
          height: z
            .preprocess((v) => (v === '' ? undefined : Number(v)), z.number())
            .optional(),
          thickness: z
            .preprocess((v) => (v === '' ? undefined : Number(v)), z.number())
            .optional(),
          type: z.string().optional(),
          position: z.string().optional(),
          tightening: z.string().optional(),
          isTinned: z.boolean().optional(),
          material: z.string().optional(),
          perforation: z.string().optional()
        })
        .optional()
    })
    .optional(),
  radiatorAttachment: z.array(z.any()).optional(),
  modification: z.string().optional()
})

export type radiatorEditFormType = z.infer<typeof radiatorEditFormSchema>
