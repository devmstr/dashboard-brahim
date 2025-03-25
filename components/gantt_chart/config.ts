import { Task } from '@/types/gantt'
import { gantt } from 'dhtmlx-gantt'

type FullTask = Task

export const calculateFullDuration = (task: FullTask): number => {
  const start = new Date(task.start_date)
  const actualEnd = new Date(task.actual_end)
  return Math.ceil((actualEnd.getTime() - start.getTime()) / (1000 * 60)) // Convert milliseconds to minutes
}

export const formatDuration = (durationInMinutes: number): string => {
  if (durationInMinutes < 60) {
    return `${durationInMinutes}m`
  } else if (durationInMinutes < 1440) {
    const hours = Math.floor(durationInMinutes / 60)
    const minutes = durationInMinutes % 60
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  } else {
    const days = Math.floor(durationInMinutes / 1440)
    const hours = Math.floor((durationInMinutes % 1440) / 60)
    const minutes = durationInMinutes % 60
    let result = `${days}d`
    if (hours > 0) result += ` ${hours}h`
    if (minutes > 0) result += ` ${minutes}m`
    return result
  }
}

export const prepareTaskData = (tasks: Task[]) => {
  return tasks.map((task) => {
    const start = new Date(task.start_date)
    const end = new Date(task.end_date)
    const actualStart = new Date(task.actual_start)
    const actualEnd = new Date(task.actual_end)

    return {
      ...task,
      start_date: start,
      end_date: end,
      actual_start: actualStart,
      actual_end: actualEnd
    }
  })
}

export const validateTask = (task: Task): boolean => {
  const start = new Date(task.start_date)
  const end = new Date(task.end_date)
  const actualStart = new Date(task.actual_start)
  const actualEnd = new Date(task.actual_end)

  if (start >= end) {
    console.error('Task start date must be before end date')
    return false
  }
  if (actualStart >= actualEnd) {
    console.error('Task actual start date must be before actual end date')
    return false
  }
  return true
}

export const customTaskRenderer = (
  task: FullTask,
  defaultRender?: (task: Task) => HTMLElement
): HTMLElement => {
  const element = defaultRender
    ? defaultRender(task)
    : document.createElement('div')
  element.className += ' custom-task'

  const taskWrapper = document.createElement('div')
  taskWrapper.className = 'custom-task-wrapper'

  const start = new Date(task.start_date).getTime()
  const plannedEnd = new Date(task.end_date).getTime()
  const actualStart = new Date(task.actual_start).getTime()
  const actualEnd = new Date(task.actual_end).getTime()

  const totalPlannedDuration = plannedEnd - start
  const actualTaskDuration = actualEnd - actualStart

  const coldStartDuration = actualStart - start
  const coldStartPercentage = (coldStartDuration / totalPlannedDuration) * 100
  const taskDurationPercentage =
    (actualTaskDuration / totalPlannedDuration) * 100

  // Calculate delay and gained time
  const delayDuration = Math.max(0, actualEnd - plannedEnd)
  const gainedTimeDuration = Math.max(0, plannedEnd - actualEnd)

  // Calculate percentages
  const delayPercentage = (delayDuration / totalPlannedDuration) * 100
  const gainedTimePercentage = (gainedTimeDuration / totalPlannedDuration) * 100

  // Cold start section
  if (coldStartPercentage > 0) {
    const coldStart = document.createElement('div')
    coldStart.className = 'task-section cold-start'
    coldStart.style.width = `${coldStartPercentage}%`
    taskWrapper.appendChild(coldStart)
  }

  // Main task duration section
  const taskDurationElement = document.createElement('div')
  taskDurationElement.className = 'task-section task-duration'
  taskDurationElement.style.width = `${Math.min(100, taskDurationPercentage)}%`

  // Apply rounded corners
  if (coldStartPercentage === 0)
    taskDurationElement.classList.add('rounded-left')
  if (delayPercentage === 0 && gainedTimePercentage === 0)
    taskDurationElement.classList.add('rounded-right')

  // Add progress percentage text
  const progressText = document.createElement('div')
  progressText.className = 'task-progress-text'
  progressText.textContent = `${Math.round(task.progress * 100)}%`
  taskDurationElement.appendChild(progressText)

  taskWrapper.appendChild(taskDurationElement)

  // Gained time section
  if (gainedTimePercentage > 0) {
    const gainedTime = document.createElement('div')
    gainedTime.className = 'task-section task-gain'
    gainedTime.style.width = `${gainedTimePercentage}%`

    // Apply rounded right corner only if there's no delay
    if (delayPercentage === 0) gainedTime.classList.add('rounded-right')
    taskWrapper.appendChild(gainedTime)
  }

  // Task delay section
  if (delayPercentage > 0) {
    const taskDelay = document.createElement('div')
    taskDelay.className = 'task-section task-delay'
    taskDelay.style.width = `${delayPercentage}%`

    // Extend the total width when delay exists
    taskWrapper.style.width = `calc(100% + ${delayPercentage}%)`
    taskWrapper.appendChild(taskDelay)
  }

  element.appendChild(taskWrapper)

  return element
}

export const configureGanttScale = () => {
  // Custom date functions
  gantt.date.minute_custom_start = (date: Date) => {
    const startDate = new Date(date)
    const currentHour = startDate.getHours()
    const currentMinute = startDate.getMinutes()

    if (currentHour < 8) {
      startDate.setHours(8, 0, 0, 0)
    } else if (currentHour >= 15) {
      startDate.setDate(startDate.getDate() + 1)
      startDate.setHours(8, 0, 0, 0)
    } else {
      // Ensure minute is rounded to the nearest 10
      startDate.setMinutes(Math.floor(currentMinute / 10) * 10, 0, 0)
    }

    return startDate
  }

  gantt.date.add_minute_custom = (date: Date, inc: number) => {
    const newDate = new Date(date)
    let currentHour = newDate.getHours()
    let currentMinute = newDate.getMinutes()

    currentMinute += inc
    while (currentMinute >= 60) {
      currentHour++
      currentMinute -= 60
    }

    if (currentHour >= 15) {
      newDate.setDate(newDate.getDate() + 1)
      newDate.setHours(8, 0, 0, 0)
    } else if (currentHour < 8) {
      newDate.setHours(8, 0, 0, 0)
    } else {
      newDate.setHours(currentHour, currentMinute, 0, 0)
    }

    return newDate
  }

  gantt.date.hour_custom_start = (date: Date) => {
    const startDate = new Date(date)
    const currentHour = startDate.getHours()

    if (currentHour < 8) {
      startDate.setHours(8, 0, 0, 0)
    } else if (currentHour >= 15) {
      startDate.setDate(startDate.getDate() + 1)
      startDate.setHours(8, 0, 0, 0)
    } else {
      startDate.setMinutes(0, 0, 0)
    }

    return startDate
  }

  gantt.date.add_hour_custom = (date: Date, inc: number) => {
    const nextDate = new Date(date)
    let currentHour = nextDate.getHours()

    currentHour += inc
    if (currentHour >= 15) {
      nextDate.setDate(nextDate.getDate() + 1)
      nextDate.setHours(8 + (currentHour - 15), 0, 0, 0)
    } else if (currentHour < 8) {
      nextDate.setHours(8, 0, 0, 0)
    } else {
      nextDate.setHours(currentHour, 0, 0, 0)
    }

    return nextDate
  }

  gantt.date.day_custom_start = (date: Date) => {
    const adjustedDate = new Date(date)
    adjustedDate.setHours(8, 0, 0, 0)
    return adjustedDate
  }

  gantt.date.add_day_custom = (date: Date, inc: number) => {
    const adjustedDate = new Date(date)
    adjustedDate.setDate(adjustedDate.getDate() + inc)
    adjustedDate.setHours(8, 0, 0, 0)
    return adjustedDate
  }

  // Configure scales
  gantt.config.scales = [
    { unit: 'day_custom', step: 1, format: '%d %M' },
    {
      unit: 'hour_custom',
      step: 1,
      format: '%Hh'
    },
    {
      unit: 'minute_custom',
      step: 10,
      format: '%i'
    }
  ]

  // Set scale height
  gantt.config.scale_height = 90

  // Set working time
  gantt.config.work_time = true
  gantt.setWorkTime({ hours: ['8:00-15:00'] })

  // Adjust task positioning
  gantt.config.correct_work_time = true

  // Set the minimum column width for the 10-minute intervals
  gantt.config.min_column_width = 20

  // Set the start date to 3 hours before the min_date
  gantt.config.start_date = gantt.getState().min_date

  // Set the end date to one day after the max_date
  gantt.config.end_date = gantt.getState().max_date
}
