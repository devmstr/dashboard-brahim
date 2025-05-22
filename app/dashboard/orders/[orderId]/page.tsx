import { Card } from '@/components/card'
import {
  ComponentsTableEntry,
  OrderComponentsTable
} from '@/components/components.table'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'
import { useServerUser } from '@/hooks/useServerUser'
import { Task } from '@/types/gantt'
import { signIn } from 'next-auth/react'
import prisma from '@/lib/db'
import { ca } from 'date-fns/locale'

interface PageProps {
  params: {
    orderId: string
  }
}

const testData = [
  {
    id: 'FAX34ER7S',
    title: 'FAIS 440X470X2R TR COLL 490X50 PL',
    brand: 'CAT',
    model: 'D5',
    type: 'Faisceau',
    fabrication: 'Confection',
    quantity: 2
  },
  {
    id: 'BAR12XYZ',
    title: 'FAIS 500X530X2P TR COLL 450X55 PL',
    brand: 'CAT',
    model: 'D5',
    type: 'Faisceau',
    fabrication: 'Confection',
    quantity: 2
  },
  {
    id: 'QUX78ABC',
    title: 'FAIS 380X420X3S TR COLL 510X60 PL',
    brand: 'CAT',
    model: 'D5',
    type: 'Faisceau',
    fabrication: 'Confection',
    quantity: 2
  }
]
const t = {
  id: 'Matricule',
  title: 'Désignation',
  brand: 'Marque',
  model: 'Model',
  type: 'Type',
  fabrication: 'Fabrication',
  quantity: 'Quantité'
}

const tasks: Task[] = [
  {
    id: 'FAX34ER7S',
    text: 'FAX34ER7S',
    start_date: new Date(2023, 5, 1, 8, 0),
    end_date: new Date(2023, 5, 1, 11, 0),
    actual_start: new Date(2023, 5, 1, 8, 30),
    actual_end: new Date(2023, 5, 1, 11, 30),
    progress: 0.6,
    parent: 0
  },
  {
    id: 'BAR12XYZ',
    text: 'BAR12XYZ',
    start_date: new Date(2023, 5, 1, 9, 0),
    end_date: new Date(2023, 5, 1, 13, 0),
    actual_start: new Date(2023, 5, 1, 9, 15),
    actual_end: new Date(2023, 5, 1, 13, 45),
    progress: 0.8,
    parent: 0
  },
  {
    id: 'QUX78ABC',
    text: 'QUX78ABC',
    start_date: new Date(2023, 5, 1, 10, 0),
    end_date: new Date(2023, 5, 1, 12, 0),
    actual_start: new Date(2023, 5, 1, 10, 30),
    actual_end: new Date(2023, 5, 1, 11, 45),
    progress: 1,
    parent: 0
  }
]

const Page: React.FC<PageProps> = async ({
  params: { orderId }
}: PageProps) => {
  const user = await useServerUser()
  if (!user) return signIn()
  const isUserRoleSales = await useServerCheckRoles([
    'SALES_AGENT',
    'SALES_MANAGER'
  ])
  const isUserRoleEngineer = await useServerCheckRoles([
    'ENGINEER',
    'ENGINEERING_MANAGER'
  ])
  const isUserRoleProduction = await useServerCheckRoles([
    'PRODUCTION_MANAGER',
    'PRODUCTION_MANAGER'
  ])

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      Client: true,
      Payment: true,
      OrdersItems: {
        include: {
          Radiator: {
            include: {
              Models: {
                include: {
                  Family: {
                    include: {
                      Brand: true
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
          },
          Attachments: true
        }
      },
      Attachments: true
    }
  })

  const data = order?.OrdersItems.map(
    ({
      id,
      Radiator: { label, category, Models },
      radiatorId,
      fabrication,
      quantity,
      type,
      isModified
    }) => {
      return {
        id,
        radiatorId,
        label,
        type,
        category,
        fabrication,
        quantity,
        isModified,
        model: Models[0]?.name || '_',
        brand: Models[0]?.Family?.Brand?.name || '_'
      }
    }
  ) as ComponentsTableEntry[]

  return (
    <div className="space-y-4">
      {/* {isUserRoleSales && (
        <Card className="">
          <OrderMetaForm data={{ id: orderId }} />
        </Card>
      )} */}
      {true && (
        <Card className="">
          <OrderComponentsTable data={data} />
        </Card>
      )}
      {/* {(isUserRoleSales || isUserRoleProduction) && (
        <Card className="">
          <Tabs defaultValue="table" className="space-y-4">
            <div className="py-1 ">
              {isUserRoleProduction && (
                <TabsList className="grid w-fit grid-cols-2 ">
                  <TabsTrigger className="flex gap-1" value="table">
                    <Icons.table className="h-4 w-auto rotate-180" /> Table
                  </TabsTrigger>
                  <TabsTrigger className="flex gap-1" value="timeline">
                    <Icons.gantt className="h-4 w-auto" /> Planning
                  </TabsTrigger>
                </TabsList>
              )}
            </div>
            <TabsContent value="table" className="relative">
              <div className="flex items-center justify-between select-none">
                <span className="absolute -top-4 left-2 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
                  articles
                </span>
              </div>
              <OrderComponentsTable t={t} data={testData} />
            </TabsContent>
            <TabsContent className="space-y-4" value="timeline">
              <ComponentsTimeline tasks={tasks} />
            </TabsContent>
          </Tabs>
        </Card>
      )} */}
    </div>
  )
}

export default Page
