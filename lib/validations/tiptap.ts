import { z } from 'zod'

// Define the TypeScript type for JSONContent to clarify the structure
type JSONContent = {
  type?: string
  attrs?: Record<string, any>
  content?: JSONContent[]
  marks?: {
    type: string
    attrs?: Record<string, any>
    [key: string]: any
  }[]
  text?: string
  [key: string]: any
}

// Define HTMLContent schema (just a string)
const htmlContentSchema = z.string()

// Define JSONContent schema with an explicit type
const jsonContentSchema: z.ZodType<JSONContent> = z.lazy(() =>
  z
    .object({
      type: z.string().optional(),
      attrs: z.record(z.any()).optional(), // `attrs` can have any key-value structure
      content: z.array(jsonContentSchema).optional(), // Allows for nested JSONContent
      marks: z
        .array(
          z
            .object({
              type: z.string(),
              attrs: z.record(z.any()).optional()
              // Additional fields in marks are allowed by catchall
            })
            .catchall(z.any())
        )
        .optional(),
      text: z.string().optional()
      // Allow additional fields in JSONContent
    })
    .catchall(z.any())
)

// Define Content schema as a union of possible types
export const contentSchema = z.union([
  htmlContentSchema, // HTMLContent type
  jsonContentSchema, // JSONContent type
  z.array(jsonContentSchema), // JSONContent[] type
  z.null() // null as a valid type
])
