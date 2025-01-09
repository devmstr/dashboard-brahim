export interface Task {
  id: number | string
  text: string
  start_date: Date
  end_date: Date
  actual_start: Date
  actual_end: Date
  progress: number
  parent: number
}
