'use client'

import React, { useEffect, useRef } from 'react'
import { gantt } from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'

import './gantt.css'
import {
  // adjustVisibleTimeRange,
  calculateFullDuration,
  configureGanttScale,
  customTaskRenderer,
  formatDuration,
  prepareTaskData,
  validateTask
} from './config'
import { usePathname, useRouter } from 'next/navigation'
import { Task } from '@/types/gantt'

interface CustomGanttProps {
  tasks: Task[]
}

const CustomGantt: React.FC<CustomGanttProps> = ({ tasks }) => {
  const ganttContainer = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!ganttContainer.current) return

    // Initialize gantt
    gantt.init(ganttContainer.current)

    // Load data
    const validTasks = tasks.filter(validateTask)
    const preparedTasks = prepareTaskData(validTasks)
    gantt.parse({ data: preparedTasks })
    gantt.config.duration_unit = 'minute'
    gantt.config.xml_date = '%Y-%m-%d %H:%i'
    gantt.config.show_progress = false
    gantt.config.drag_links = false
    gantt.config.drag_move = false
    gantt.config.drag_resize = false
    gantt.config.scroll_size = 8
    gantt.config.horizontal_scroll_key = 'hor-scroll-bar'
    // configure a scale
    configureGanttScale()

    // Customize the grid
    gantt.config.columns = [
      {
        name: 'text',
        label: 'Article',
        tree: true,
        width: 200,
        template: (task: Task) => {
          return `<span" class="gantt-article-link">${task.text}</span>`
        }
      },
      {
        name: 'duration',
        label: 'Durée',
        align: 'center',
        width: 100,
        template: (task: Task) => formatDuration(calculateFullDuration(task))
      }
    ]

    // Set up custom task renderer
    const taskType = gantt.config.types.task
    if (taskType && gantt.config.type_renderers) {
      gantt.config.type_renderers[taskType] = customTaskRenderer
    }

    // Handle double click
    gantt.attachEvent('onLightbox', function (id) {
      // Prevent the default lightbox from opening
      gantt.hideLightbox()

      // Redirect to the dynamic route
      if (id) {
        router.push(`${pathname}/${id}`)
      }

      // Return false to prevent the lightbox from opening
      return false
    })

    //  initial scroll
    gantt.scrollTo(840, null)

    // Render the chart
    gantt.render()

    return () => {
      gantt.clearAll()
      gantt.detachAllEvents()
    }
  }, [tasks, router])

  useEffect(() => {
    const container = ganttContainer.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey) {
        e.preventDefault()
        const scrollAmount = e.deltaY
        gantt.scrollTo(gantt.getScrollState().x + scrollAmount, null)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return <div ref={ganttContainer} style={{ width: '100%', height: '500px' }} />
}

export default CustomGantt
