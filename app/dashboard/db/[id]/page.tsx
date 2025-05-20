import { Card } from '@/components/card'
import { RadiatorEditForm } from './radiator-edit.from'
import prisma from '@/lib/db'
import { parseMetadata } from '@/lib/utils'

interface Props {
  params: { id: string }
}

const Page: React.FC<Props> = async ({ params: { id } }: Props) => {
  const radiator = await prisma.radiator.findUniqueOrThrow({
    where: { id },
    include: {
      Models: {
        include: {
          Types: true,
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
  })

  // Find core and collector components
  const coreComponent = radiator.Components.find(
    (c) => c.type === 'CORE'
  )?.Metadata

  const collectors = radiator.Components.filter((c) => c.type === 'COLLECTOR')
  // find collector material name
  const collectorMaterialName = collectors.map((c) => {
    const material = c.MaterialUsages[0]?.Material.name
    return material
  })[0]

  const collectorTop = collectors.find(
    (c) => parseMetadata(c.Metadata)?.type === 'TOP'
  )?.Metadata as any

  const collectorBottom = collectors.find(
    (c) => parseMetadata(c.Metadata)?.type === 'BOTTOM'
  )?.Metadata as any
  const core = parseMetadata(coreComponent)
  const car = {
    id: radiator.Models[0]?.id || '',
    brand: radiator.Models[0]?.Family?.Brand.name || '',
    family: radiator.Models[0]?.Family.name || '',
    model: radiator.Models[0]?.name || '',
    type: radiator.Models[0]?.Types[0]?.name || ''
  }

  // Map to form data structure
  const data = {
    id: radiator.id,
    isActive: Boolean(radiator.isActive),
    dirId: radiator.dir || '',
    ...(car && { car }),
    ...(core && { core }),
    ...(collectorTop &&
      collectorBottom && {
        collectors: {
          top: { ...collectorTop, material: collectorMaterialName },
          bottom: { ...collectorBottom, material: collectorMaterialName }
        }
      }),
    radiatorAttachment: [] // Map attachments if you have them
  }

  return (
    <Card>
      <RadiatorEditForm data={data} />
    </Card>
  )
}

export default Page
