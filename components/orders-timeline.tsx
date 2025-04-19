// import dynamic from 'next/dynamic'
// import { Task } from '@/types/gantt'
// import GanttChartLoading from './gantt_chart/loading'
// import { FullRecord } from './orders-grant-chart'
// import { Skeleton } from './ui/skeleton'

// const OrdersCustomGantt = dynamic(() => import('./orders-grant-chart'), {
//   ssr: false,
//   loading: () => (
//     <div className="flex flex-col gap-3">
//       <div className="flex justify-between">
//         <div className="flex ml-1 gap-2 items-center">
//           <span className="text-sm text-muted-foreground/60">Limit</span>
//           <Skeleton className="h-10 w-[4.5rem]" />
//         </div>
//       </div>
//       <GanttChartLoading />
//       <div className="flex gap-3 w-full justify-end">
//         <Skeleton className="h-9 w-20" />
//         <Skeleton className="h-9 w-20" />
//       </div>
//     </div>
//   )
// })

// interface Props {
//   orders: FullRecord[]
// }

// const OrdersTimeline: React.FC<Props> = ({ orders }) => {
//   return <OrdersCustomGantt data={orders} />
// }

// export default OrdersTimeline
