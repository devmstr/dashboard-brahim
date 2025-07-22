import { Card } from '@/components/card'
import { RadiatorEditForm } from './radiator-edit.from'
import prisma from '@/lib/db'
import { parseMetadata } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { RadiatorSchemaType } from '@/lib/validations/radiator'

interface Props {
  params: { id: string }
}

const Page: React.FC<Props> = async ({ params: { id } }: Props) => {
  const record = await prisma.radiator.findUnique({
    where: { id },
    include: {
      Types: {
        include: {
          Model: {
            include: {
              Family: {
                include: {
                  Brand: true
                }
              }
            }
          }
        }
      },
      Components: {
        include: {
          MaterialUsages: {
            include: {
              Material: true
            }
          }
        }
      }
    }
  })
  if (!record) return notFound()

  const { Components, Types, ...radiator } = record

  const data = {
    ...radiator,
    Type: Types.at(0),
    Components: Components.map(({ MaterialUsages, ...component }) => ({
      ...component,
      usages: MaterialUsages.map(({ Material, quantity }) => ({
        ...Material,
        quantity
      }))
    }))
  } as RadiatorSchemaType

  return (
    <Card>
      <RadiatorEditForm data={data} />
    </Card>
  )
}

export default Page
