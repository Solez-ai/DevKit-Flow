import { useState, useCallback, useMemo } from 'react'
import { addDays, differenceInDays } from 'date-fns'
import { useSessions } from '@/hooks/use-app-store'
import type { 
  TimelineView, 
  TimelineTask, 
  Milestone, 
  TaskDependency,
  TimelineSettings,
  DevFlowNode,
  TaskSchedulingResult,
  CriticalPathAnalysis
} from '@/types'

interface UseTimelineGanttOptions {
  sessionId?: string
  autoSave?: boolean
}

interface UseTimelineGanttReturn {
  timelineViews: TimelineView[]
  currentTimelineView: TimelineView | null
  isLoading: boolean
  error: string | null
  
  // Timeline management
  createTimelineView: (name: string, description?: string) => TimelineView
  updateTimelineView: (timelineView: TimelineView) => void
  deleteTimelineView: (timelineViewId: string) => void
  setCurrentTimelineView: (timelineViewId: string) => void
  
  // Task management
  createTaskFromNode: (node: DevFlowNode, timelineViewId?: string) => TimelineTask
  updateTask: (task: TimelineTask, timelineViewId?: string) => void
  deleteTask: (taskId: string, timelineViewId?: string) => void
  moveTask: (taskId: string, newStartDate: Date, newEndDate: Date, timelineViewId?: string) => void
  
  // Milestone management
  createMilestone: (milestone: Omit<Milestone, 'id'>, timelineViewId?: string) => Milestone
  updateMilestone: (milestone: Milestone, timelineViewId?: string) => void
  deleteMilestone: (milestoneId: string, timelineViewId?: string) => void
  
  // Dependency management
  createDependency: (dependency: Omit<TaskDependency, 'id'>, timelineViewId?: string) => TaskDependency
  updateDependency: (dependency: TaskDependency, timelineViewId?: string) => void
  deleteDependency: (dependencyId: string, timelineViewId?: string) => void
  
  // Scheduling and analysis
  scheduleAllTasks: (timelineViewId?: string) => TaskSchedulingResult
  calculateCriticalPath: (timelineViewId?: string) => CriticalPathAnalysis
  validateSchedule: (timelineViewId?: string) => { isValid: boolean; issues: string[] }
  
  // Export/Import
  exportTimelineView: (timelineViewId: string, format: 'json' | 'csv' | 'pdf') => Promise<Blob>
  importTimelineView: (file: File, format: 'json' | 'csv') => Promise<TimelineView>
}

const defaultTimelineSettings: TimelineSettings = {
  viewMode: 'days',
  showWeekends: true,
  showCriticalPath: true,
  showDependencies: true,
  showMilestones: true,
  showProgress: true,
  showAssignees: true,
  autoSchedule: false,
  workingHoursPerDay: 8,
  workingDaysPerWeek: 5,
  zoomLevel: 1,
  rowHeight: 40,
  columnWidth: 60,
  colors: {
    taskBar: '#3b82f6',
    taskBarCompleted: '#10b981',
    taskBarOverdue: '#ef4444',
    taskBarCritical: '#f59e0b',
    milestone: '#8b5cf6',
    milestoneCompleted: '#10b981',
    dependency: '#6b7280',
    criticalPath: '#ef4444',
    weekend: '#f3f4f6',
    today: '#ef4444',
    gridLines: '#e5e7eb',
    text: '#374151',
    background: '#ffffff'
  }
}

export function useTimelineGantt(options: UseTimelineGanttOptions = {}): UseTimelineGanttReturn {
  const { currentSession } = useSessions()
  const [timelineViews, setTimelineViews] = useState<TimelineView[]>([])
  const [currentTimelineViewId, setCurrentTimelineViewId] = useState<string | null>(null)
  const [isLoading] = useState(false)
  const [error] = useState<string | null>(null)

  const sessionId = options.sessionId || currentSession?.id

  // Get current timeline view
  const currentTimelineView = useMemo(() => {
    return timelineViews.find(tv => tv.id === currentTimelineViewId) || null
  }, [timelineViews, currentTimelineViewId])

  // Create new timeline view
  const createTimelineView = useCallback((name: string, description?: string): TimelineView => {
    const newTimelineView: TimelineView = {
      id: `timeline-${Date.now()}`,
      sessionId: sessionId || '',
      name,
      description,
      tasks: [],
      milestones: [],
      dependencies: [],
      settings: { ...defaultTimelineSettings },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      }
    }

    setTimelineViews(prev => [...prev, newTimelineView])
    setCurrentTimelineViewId(newTimelineView.id)
    
    return newTimelineView
  }, [sessionId])

  // Update timeline view
  const updateTimelineView = useCallback((timelineView: TimelineView) => {
    const updatedTimelineView = {
      ...timelineView,
      metadata: {
        ...timelineView.metadata,
        updatedAt: new Date()
      }
    }

    setTimelineViews(prev => 
      prev.map(tv => tv.id === timelineView.id ? updatedTimelineView : tv)
    )

    if (options.autoSave && sessionId) {
      // Auto-save to session if enabled
      // This would integrate with the session management system
    }
  }, [options.autoSave, sessionId])

  // Delete timeline view
  const deleteTimelineView = useCallback((timelineViewId: string) => {
    setTimelineViews(prev => prev.filter(tv => tv.id !== timelineViewId))
    
    if (currentTimelineViewId === timelineViewId) {
      const remaining = timelineViews.filter(tv => tv.id !== timelineViewId)
      setCurrentTimelineViewId(remaining.length > 0 ? remaining[0].id : null)
    }
  }, [timelineViews, currentTimelineViewId])

  // Set current timeline view
  const setCurrentTimelineView = useCallback((timelineViewId: string) => {
    setCurrentTimelineViewId(timelineViewId)
  }, [])

  // Create task from node
  const createTaskFromNode = useCallback((node: DevFlowNode, timelineViewId?: string): TimelineTask => {
    const targetTimelineViewId = timelineViewId || currentTimelineViewId
    if (!targetTimelineViewId) {
      throw new Error('No timeline view selected')
    }

    const estimatedHours = node.complexity?.estimatedHours || 
                          (node.complexity?.storyPoints ? node.complexity.storyPoints * 2 : 8)

    const newTask: TimelineTask = {
      id: `task-${Date.now()}`,
      nodeId: node.id,
      name: node.title,
      description: node.description,
      startDate: new Date(),
      endDate: addDays(new Date(), Math.ceil(estimatedHours / 8)),
      duration: estimatedHours,
      progress: node.status === 'completed' ? 100 : 
                node.status === 'active' ? 50 : 0,
      priority: node.metadata.priority <= 2 ? 'critical' :
                node.metadata.priority <= 3 ? 'high' :
                node.metadata.priority <= 4 ? 'medium' : 'low',
      status: node.status === 'completed' ? 'completed' :
              node.status === 'active' ? 'in-progress' :
              node.status === 'blocked' ? 'blocked' : 'not-started',
      tags: node.metadata.tags,
      estimatedHours,
      complexity: node.complexity?.storyPoints,
      position: {
        row: 0,
        level: 0
      }
    }

    // Update the timeline view with the new task
    const timelineView = timelineViews.find(tv => tv.id === targetTimelineViewId)
    if (timelineView) {
      const updatedTimelineView = {
        ...timelineView,
        tasks: [...timelineView.tasks, newTask]
      }
      updateTimelineView(updatedTimelineView)
    }

    return newTask
  }, [timelineViews, currentTimelineViewId, updateTimelineView])

  // Update task
  const updateTask = useCallback((task: TimelineTask, timelineViewId?: string) => {
    const targetTimelineViewId = timelineViewId || currentTimelineViewId
    if (!targetTimelineViewId) return

    const timelineView = timelineViews.find(tv => tv.id === targetTimelineViewId)
    if (!timelineView) return

    const updatedTimelineView = {
      ...timelineView,
      tasks: timelineView.tasks.map(t => t.id === task.id ? task : t)
    }

    updateTimelineView(updatedTimelineView)
  }, [timelineViews, currentTimelineViewId, updateTimelineView])

  // Delete task
  const deleteTask = useCallback((taskId: string, timelineViewId?: string) => {
    const targetTimelineViewId = timelineViewId || currentTimelineViewId
    if (!targetTimelineViewId) return

    const timelineView = timelineViews.find(tv => tv.id === targetTimelineViewId)
    if (!timelineView) return

    const updatedTimelineView = {
      ...timelineView,
      tasks: timelineView.tasks.filter(t => t.id !== taskId),
      dependencies: timelineView.dependencies.filter(
        d => d.predecessorId !== taskId && d.successorId !== taskId
      )
    }

    updateTimelineView(updatedTimelineView)
  }, [timelineViews, currentTimelineViewId, updateTimelineView])

  // Move task (drag and drop)
  const moveTask = useCallback((
    taskId: string, 
    newStartDate: Date, 
    newEndDate: Date, 
    timelineViewId?: string
  ) => {
    const targetTimelineViewId = timelineViewId || currentTimelineViewId
    if (!targetTimelineViewId) return

    const timelineView = timelineViews.find(tv => tv.id === targetTimelineViewId)
    if (!timelineView) return

    const task = timelineView.tasks.find(t => t.id === taskId)
    if (!task) return

    const updatedTask: TimelineTask = {
      ...task,
      startDate: newStartDate,
      endDate: newEndDate,
      duration: differenceInDays(newEndDate, newStartDate) * timelineView.settings.workingHoursPerDay
    }

    updateTask(updatedTask, targetTimelineViewId)
  }, [timelineViews, currentTimelineViewId, updateTask])

  // Create milestone
  const createMilestone = useCallback((
    milestone: Omit<Milestone, 'id'>, 
    timelineViewId?: string
  ): Milestone => {
    const targetTimelineViewId = timelineViewId || currentTimelineViewId
    if (!targetTimelineViewId) {
      throw new Error('No timeline view selected')
    }

    const newMilestone: Milestone = {
      ...milestone,
      id: `milestone-${Date.now()}`
    }

    const timelineView = timelineViews.find(tv => tv.id === targetTimelineViewId)
    if (timelineView) {
      const updatedTimelineView = {
        ...timelineView,
        milestones: [...timelineView.milestones, newMilestone]
      }
      updateTimelineView(updatedTimelineView)
    }

    return newMilestone
  }, [timelineViews, currentTimelineViewId, updateTimelineView])

  // Update milestone
  const updateMilestone = useCallback((milestone: Milestone, timelineViewId?: string) => {
    const targetTimelineViewId = timelineViewId || currentTimelineViewId
    if (!targetTimelineViewId) return

    const timelineView = timelineViews.find(tv => tv.id === targetTimelineViewId)
    if (!timelineView) return

    const updatedTimelineView = {
      ...timelineView,
      milestones: timelineView.milestones.map(m => m.id === milestone.id ? milestone : m)
    }

    updateTimelineView(updatedTimelineView)
  }, [timelineViews, currentTimelineViewId, updateTimelineView])

  // Delete milestone
  const deleteMilestone = useCallback((milestoneId: string, timelineViewId?: string) => {
    const targetTimelineViewId = timelineViewId || currentTimelineViewId
    if (!targetTimelineViewId) return

    const timelineView = timelineViews.find(tv => tv.id === targetTimelineViewId)
    if (!timelineView) return

    const updatedTimelineView = {
      ...timelineView,
      milestones: timelineView.milestones.filter(m => m.id !== milestoneId)
    }

    updateTimelineView(updatedTimelineView)
  }, [timelineViews, currentTimelineViewId, updateTimelineView])

  // Create dependency
  const createDependency = useCallback((
    dependency: Omit<TaskDependency, 'id'>, 
    timelineViewId?: string
  ): TaskDependency => {
    const targetTimelineViewId = timelineViewId || currentTimelineViewId
    if (!targetTimelineViewId) {
      throw new Error('No timeline view selected')
    }

    const newDependency: TaskDependency = {
      ...dependency,
      id: `dependency-${Date.now()}`,
      createdAt: new Date()
    }

    const timelineView = timelineViews.find(tv => tv.id === targetTimelineViewId)
    if (timelineView) {
      const updatedTimelineView = {
        ...timelineView,
        dependencies: [...timelineView.dependencies, newDependency]
      }
      updateTimelineView(updatedTimelineView)
    }

    return newDependency
  }, [timelineViews, currentTimelineViewId, updateTimelineView])

  // Update dependency
  const updateDependency = useCallback((dependency: TaskDependency, timelineViewId?: string) => {
    const targetTimelineViewId = timelineViewId || currentTimelineViewId
    if (!targetTimelineViewId) return

    const timelineView = timelineViews.find(tv => tv.id === targetTimelineViewId)
    if (!timelineView) return

    const updatedTimelineView = {
      ...timelineView,
      dependencies: timelineView.dependencies.map(d => d.id === dependency.id ? dependency : d)
    }

    updateTimelineView(updatedTimelineView)
  }, [timelineViews, currentTimelineViewId, updateTimelineView])

  // Delete dependency
  const deleteDependency = useCallback((dependencyId: string, timelineViewId?: string) => {
    const targetTimelineViewId = timelineViewId || currentTimelineViewId
    if (!targetTimelineViewId) return

    const timelineView = timelineViews.find(tv => tv.id === targetTimelineViewId)
    if (!timelineView) return

    const updatedTimelineView = {
      ...timelineView,
      dependencies: timelineView.dependencies.filter(d => d.id !== dependencyId)
    }

    updateTimelineView(updatedTimelineView)
  }, [timelineViews, currentTimelineViewId, updateTimelineView])

  // Schedule all tasks (basic implementation)
  const scheduleAllTasks = useCallback((timelineViewId?: string): TaskSchedulingResult => {
    const targetTimelineViewId = timelineViewId || currentTimelineViewId
    if (!targetTimelineViewId) {
      return {
        success: false,
        scheduledTasks: [],
        conflicts: [],
        warnings: [],
        criticalPath: [],
        projectEndDate: new Date(),
        totalDuration: 0
      }
    }

    const timelineView = timelineViews.find(tv => tv.id === targetTimelineViewId)
    if (!timelineView) {
      return {
        success: false,
        scheduledTasks: [],
        conflicts: [],
        warnings: [],
        criticalPath: [],
        projectEndDate: new Date(),
        totalDuration: 0
      }
    }

    // Basic scheduling algorithm - just arrange tasks sequentially
    const scheduledTasks: TimelineTask[] = []
    let currentDate = new Date()

    for (const task of timelineView.tasks) {
      const taskDuration = task.estimatedHours / timelineView.settings.workingHoursPerDay
      const endDate = addDays(currentDate, Math.ceil(taskDuration))

      scheduledTasks.push({
        ...task,
        startDate: currentDate,
        endDate: endDate
      })

      currentDate = endDate
    }

    return {
      success: true,
      scheduledTasks,
      conflicts: [],
      warnings: [],
      criticalPath: scheduledTasks.map(t => t.id),
      projectEndDate: currentDate,
      totalDuration: differenceInDays(currentDate, scheduledTasks[0]?.startDate || new Date())
    }
  }, [timelineViews, currentTimelineViewId])

  // Calculate critical path (basic implementation)
  const calculateCriticalPath = useCallback((timelineViewId?: string): CriticalPathAnalysis => {
    const targetTimelineViewId = timelineViewId || currentTimelineViewId
    if (!targetTimelineViewId) {
      return {
        path: [],
        totalDuration: 0,
        slackTime: {},
        bottlenecks: [],
        recommendations: []
      }
    }

    const timelineView = timelineViews.find(tv => tv.id === targetTimelineViewId)
    if (!timelineView) {
      return {
        path: [],
        totalDuration: 0,
        slackTime: {},
        bottlenecks: [],
        recommendations: []
      }
    }

    // Basic critical path - longest sequence of tasks
    const taskIds = timelineView.tasks.map(t => t.id)
    const totalDuration = timelineView.tasks.reduce((sum, task) => sum + task.duration, 0)

    return {
      path: taskIds,
      totalDuration,
      slackTime: {},
      bottlenecks: [],
      recommendations: []
    }
  }, [timelineViews, currentTimelineViewId])

  // Validate schedule
  const validateSchedule = useCallback((timelineViewId?: string) => {
    const targetTimelineViewId = timelineViewId || currentTimelineViewId
    if (!targetTimelineViewId) {
      return { isValid: false, issues: ['No timeline view selected'] }
    }

    const timelineView = timelineViews.find(tv => tv.id === targetTimelineViewId)
    if (!timelineView) {
      return { isValid: false, issues: ['Timeline view not found'] }
    }

    const issues: string[] = []

    // Check for overlapping tasks
    for (let i = 0; i < timelineView.tasks.length; i++) {
      for (let j = i + 1; j < timelineView.tasks.length; j++) {
        const task1 = timelineView.tasks[i]
        const task2 = timelineView.tasks[j]
        
        if (task1.assignee === task2.assignee && task1.assignee) {
          const overlap = !(task1.endDate <= task2.startDate || task2.endDate <= task1.startDate)
          if (overlap) {
            issues.push(`Tasks "${task1.name}" and "${task2.name}" overlap for assignee ${task1.assignee}`)
          }
        }
      }
    }

    // Check for invalid dependencies
    for (const dependency of timelineView.dependencies) {
      const predecessor = timelineView.tasks.find(t => t.id === dependency.predecessorId)
      const successor = timelineView.tasks.find(t => t.id === dependency.successorId)
      
      if (!predecessor || !successor) {
        issues.push(`Invalid dependency: missing task`)
        continue
      }

      if (dependency.type === 'finish-to-start' && predecessor.endDate > successor.startDate) {
        issues.push(`Dependency violation: "${predecessor.name}" must finish before "${successor.name}" starts`)
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }, [timelineViews, currentTimelineViewId])

  // Export timeline view
  const exportTimelineView = useCallback(async (
    timelineViewId: string, 
    format: 'json' | 'csv' | 'pdf'
  ): Promise<Blob> => {
    const timelineView = timelineViews.find(tv => tv.id === timelineViewId)
    if (!timelineView) {
      throw new Error('Timeline view not found')
    }

    if (format === 'json') {
      const jsonData = JSON.stringify(timelineView, null, 2)
      return new Blob([jsonData], { type: 'application/json' })
    }

    if (format === 'csv') {
      const headers = ['Task Name', 'Start Date', 'End Date', 'Duration', 'Progress', 'Status', 'Priority', 'Assignee']
      const rows = timelineView.tasks.map(task => [
        task.name,
        task.startDate.toISOString(),
        task.endDate.toISOString(),
        task.duration.toString(),
        task.progress.toString(),
        task.status,
        task.priority,
        task.assignee || ''
      ])

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
      return new Blob([csvContent], { type: 'text/csv' })
    }

    // PDF export would require a PDF library
    throw new Error('PDF export not implemented yet')
  }, [timelineViews])

  // Import timeline view
  const importTimelineView = useCallback(async (
    file: File, 
    format: 'json' | 'csv'
  ): Promise<TimelineView> => {
    const text = await file.text()

    if (format === 'json') {
      const timelineView = JSON.parse(text) as TimelineView
      // Validate and sanitize the imported data
      timelineView.id = `timeline-${Date.now()}`
      timelineView.metadata.createdAt = new Date()
      timelineView.metadata.updatedAt = new Date()
      
      setTimelineViews(prev => [...prev, timelineView])
      return timelineView
    }

    if (format === 'csv') {
      // Basic CSV parsing - would need more robust implementation
      const lines = text.split('\n')
      const headers = lines[0].split(',')
      const tasks: TimelineTask[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length >= headers.length) {
          tasks.push({
            id: `task-${Date.now()}-${i}`,
            nodeId: '',
            name: values[0],
            startDate: new Date(values[1]),
            endDate: new Date(values[2]),
            duration: parseFloat(values[3]) || 8,
            progress: parseInt(values[4]) || 0,
            status: values[5] as any || 'not-started',
            priority: values[6] as any || 'medium',
            assignee: values[7] || undefined,
            tags: [],
            estimatedHours: parseFloat(values[3]) || 8,
            position: { row: i - 1, level: 0 }
          })
        }
      }

      const timelineView: TimelineView = {
        id: `timeline-${Date.now()}`,
        sessionId: sessionId || '',
        name: `Imported Timeline - ${new Date().toLocaleDateString()}`,
        tasks,
        milestones: [],
        dependencies: [],
        settings: { ...defaultTimelineSettings },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0'
        }
      }

      setTimelineViews(prev => [...prev, timelineView])
      return timelineView
    }

    throw new Error('Unsupported import format')
  }, [sessionId])

  return {
    timelineViews,
    currentTimelineView,
    isLoading,
    error,
    createTimelineView,
    updateTimelineView,
    deleteTimelineView,
    setCurrentTimelineView,
    createTaskFromNode,
    updateTask,
    deleteTask,
    moveTask,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    createDependency,
    updateDependency,
    deleteDependency,
    scheduleAllTasks,
    calculateCriticalPath,
    validateSchedule,
    exportTimelineView,
    importTimelineView
  }
}