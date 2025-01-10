import { Card } from '@/components/card'
import { OrderComponentsTable } from '@/components/components.table'
import { Icons } from '@/components/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrderMetaForm } from './_components/order-meta.form'
import CustomGantt from '@/components/gantt_chart/CustomGantt'
import { Task } from '@/types/gantt'
import ComponentsTimeline from '@/components/gantt_chart/components-timeline'
import { signIn, useSession } from 'next-auth/react'
import { useServerUser } from '@/hooks/useServerUser'
import { useServerCheckRoles } from '@/hooks/useServerCheckRoles'

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
  title: 'Titre',
  brand: 'Marque',
  model: 'Model',
  type: 'Commande',
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
  const isUserRoleSales = await useServerCheckRoles('SALES')
  const isUserRoleEngineer = await useServerCheckRoles('ENGINEER')
  const isUserRoleProduction = await useServerCheckRoles('PRODUCTION')
  return (
    <div className="space-y-4">
      {isUserRoleSales && (
        <Card className="">
          <OrderMetaForm data={{ id: orderId }} />
        </Card>
      )}
      {isUserRoleEngineer && (
        <Card className="">
          <div className="flex items-center justify-between select-none">
            <span className="absolute -top-0 left-6 bg-background text-xs text-muted-foreground/50 p-2 uppercase">
              articles
            </span>
          </div>
          <OrderComponentsTable t={t} data={testData} />
        </Card>
      )}
      {(isUserRoleSales || isUserRoleProduction) && (
        <Card className="">
          <Tabs defaultValue="table" className="space-y-4">
            <div className="py-1 ">
              <TabsList className="grid w-fit grid-cols-2 ">
                <TabsTrigger className="flex gap-1" value="table">
                  <Icons.table className="h-4 w-auto rotate-180" /> Table
                </TabsTrigger>
                <TabsTrigger className="flex gap-1" value="timeline">
                  <Icons.gantt className="h-4 w-auto" /> Planning
                </TabsTrigger>
              </TabsList>
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
      )}
    </div>
  )
}

export default Page
