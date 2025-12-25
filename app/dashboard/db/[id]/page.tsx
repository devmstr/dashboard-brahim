import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import { RadiatorSchemaType } from '@/lib/validations/radiator'
import { Card } from '@/components/card'
import { RadiatorEditForm } from './radiator-edit.from'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Props {
  params: { id: string }
}

const Page: React.FC<Props> = async ({ params: { id } }: Props) => {
  const record = await prisma.radiator.findUnique({
    where: { id },
    include: {
      CarType: {
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
      }
      // Components: {
      //   include: {
      //     MaterialUsages: {
      //       include: {
      //         Material: true
      //       }
      //     }
      //   }
      // }
    }
  })
  if (!record) return notFound()

  const {
    // Components,

    CarType,
    ...radiator
  } = record

  const data = {
    ...radiator,
    CarType
    // Components: Components.map(({ MaterialUsages, ...component }) => ({
    //   ...component,
    //   usages: MaterialUsages.map(({ Material, quantity }) => ({
    //     ...Material,
    //     quantity
    //   }))
    // }))
  } as RadiatorSchemaType

  return (
    <Card className="space-y-4">
      <Tabs defaultValue="edit" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:w-fit">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>
        <TabsContent value="components" className="mt-0">
          <Card className="min-h-[200px]" />
        </TabsContent>
        <TabsContent value="edit" className="mt-0">
          <RadiatorEditForm data={data} />
        </TabsContent>
      </Tabs>
    </Card>
  )
}

export default Page
