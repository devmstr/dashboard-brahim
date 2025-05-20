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
      Directory: true,
      Inventory: true,
      Price: true,
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
          Materials: true
        }
      },
      OrderItems: true
      // Attachments if you have them
    }
  })

  // Find core and collector components
  const coreComponent = radiator.Components.find(
    (c) => c.type === 'CORE'
  )?.Metadata
  const collectors = radiator.Components.filter((c) => c.type === 'COLLECTOR')

  const topCollector = parseMetadata(
    collectors.find((c) => parseMetadata(c.Metadata)?.type === 'TOP')?.Metadata
  )
  const bottomCollector = parseMetadata(
    collectors.find((c) => parseMetadata(c.Metadata)?.type === 'BOTTOM')
      ?.Metadata
  )
  const core = parseMetadata(coreComponent)

  // Map to form data structure
  const formData = {
    id: radiator.id,
    isActive: Boolean(radiator.isActive),
    type: 'Radiateur', // or from your data
    fabrication: 'Confection', // or from your data
    cooling: radiator.cooling || '',
    packaging: '', // fill as needed
    quantity: 1, // fill as needed
    dirId: radiator.dir || '',
    description: '', // fill as needed
    note: '', // fill as needed
    modification: '', // fill as needed
    car: radiator.Models[0]
      ? {
          id: radiator.Models[0].id,
          model: radiator.Models[0].name,
          brand: radiator.Models[0].Family?.Brand?.name
        }
      : undefined,
    core: core
      ? {
          fins: core.fins || '',
          finsPitch: core.finsPitch || 0,
          tube: core.tube || '',
          rows: core.rows || 0,
          dimensions: core.dimensions || {
            height: core.height || 0,
            width: core.width || 0
          }
        }
      : {
          fins: '',
          finsPitch: 0,
          tube: '',
          rows: 0,
          dimensions: { height: 0, width: 0 }
        },
    collector: {
      isTinned: topCollector?.isTinned || false,
      perforation: topCollector?.perforation,
      tightening: topCollector?.tightening,
      position: topCollector?.position,
      material: 'Laiton', // or from your data
      upperDimensions: topCollector?.dimensions || {
        height: topCollector?.height || 0,
        width: topCollector?.width || 0,
        thickness: topCollector?.thickness || 0
      },
      lowerDimensions: bottomCollector?.dimensions || {
        height: bottomCollector?.height || 0,
        width: bottomCollector?.width || 0,
        thickness: bottomCollector?.thickness || 0
      }
    },
    radiatorAttachment: [] // Map attachments if you have them
  }

  console.log('formData', formData)
  return (
    <Card>
      <RadiatorEditForm data={formData} />
    </Card>
  )
}

export default Page
