import Invoice from './bill-printable'
import './print.css'

export default function Page() {
  // Sample data
  const items = [
    {
      id: 1,
      designation: 'Renovation radiateur bus 100L6',
      quantity: 2,
      priceHT: 1000,
      amount: 2 * 1000 // 22000
    },
    {
      id: 2,
      designation: 'Renovation radiateur bus 100L7',
      quantity: 3,
      priceHT: 1000,
      amount: 3 * 1000 // 51000
    },
    {
      id: 3,
      designation: 'Changement moteur camion T420',
      quantity: 1,
      priceHT: 2000,
      amount: 1 * 2000 // 25000
    },
    {
      id: 4,
      designation:
        'Réparation boîte de vitesse bus 200X & Entretien complet camion R340',
      quantity: 2,
      priceHT: 3000,
      amount: 2 * 3000 // 76000
    },
    {
      id: 5,
      designation: 'Entretien complet camion R340',
      quantity: 1,
      priceHT: 5000,
      amount: 1 * 5000 // 51000
    },
    {
      id: 6,
      designation: 'Remplacement embrayage bus 150K3',
      quantity: 3,
      priceHT: 7000,
      amount: 3 * 7000 // 216000
    },
    {
      id: 7,
      designation: 'Réparation circuit hydraulique camion 320D',
      quantity: 2,
      priceHT: 9000,
      amount: 2 * 9000 // 180000
    }
  ]

  return (
    <div className="flex justify-center items-start  min-h-screen py-5  print:py-0 bg-gray-100">
      <div className=" print:bg-white shadow-2xl rounded-xl print:shadow-none print:rounded-none">
        <Invoice
          items={items}
          invoiceId={'24-2025'}
          bc="002171"
          bl={[
            '20/2025',
            '21/2025',
            '22/2025',
            '23/2025',
            '25/2025',
            '26/2025'
          ]}
          qrAddress="FACX3DS343"
          client={{
            name: 'etp etus souk ahras',
            address: 'park des travaux publiques w.souk hras',
            rc: '97/B/0862043',
            nif: '99747086204393',
            ai: '471006003'
          }}
        />
      </div>
    </div>
  )
}
