import dynamic from 'next/dynamic'
import { Task } from '@/types/gantt'
import GanttChartLoading from './loading'

const DynamicCustomGantt = dynamic(() => import('./CustomGantt'), {
  ssr: false,
  loading: () => <GanttChartLoading />
})

interface Props {
  tasks: Task[]
}

const Timeline: React.FC<Props> = ({ tasks }) => {
  return <DynamicCustomGantt tasks={tasks} />
}

export default Timeline
