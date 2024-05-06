import { Card } from '@/components/card'
import { OrderTechnicianEditForm } from './technician'
import { OrderProductionEditForm } from './production'
import { OrderCommercialEditForm } from './commercial.form'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLES } from '@/config/accounts'
import { z } from 'zod'
import { OrderSchema } from '@/lib/validations/order'

interface PageProps {
  params: {
    id: string
  }
}

const getData = async (id: string) => {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/orders/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const jsonData = await res.json()
    return jsonData
  } catch (error) {
    console.log(error)
    return []
  }
}

const Page: React.FC<PageProps> = async ({ params: { id } }: PageProps) => {
  const session = await getServerSession(authOptions)
  const data = await getData(id)
  console.log(data)
  return (
    <Card className="">
      <div className="w-full flex justify-end select-none">
        <span className="w-fit text-4xl font-extrabold text-gray-400/30">
          {id}
        </span>
      </div>
      {session?.user?.role == ROLES.PRODUCTION && (
        <OrderProductionEditForm data={data} />
      )}
      {session?.user?.role == ROLES.SALES && (
        <OrderCommercialEditForm data={data} />
      )}
      {session?.user?.role == ROLES.ADMIN && (
        <OrderCommercialEditForm data={data} />
      )}
      {session?.user?.role == ROLES.ENGINEERING && (
        <OrderTechnicianEditForm data={data} />
      )}
    </Card>
  )
}

export default Page
