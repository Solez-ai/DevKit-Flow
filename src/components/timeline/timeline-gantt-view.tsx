import React, { useState, useMemo, useCallback, useRef } from 'react'
import { format, addDays, isWeekend, isToday, differenceInDays } from 'date-fns'
import { 
  Calendar, 
  CheckCircle, 
  Circle, 
  Play, 
  Pause, 
  Square,
  Flag,
  ZoomIn,
  ZoomOut,
  Search,
  Plus,
  Target,
  Save
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// import { 
//   ContextMenu,
//   ContextMenuContent,
//   ContextMenuItem,
//   ContextMenuTrigger,
//   ContextMenuSeparator,
//   ContextMenuSub,
//   ContextMenuSubContent,
//   ContextMenuSubTrigger,
// } from '@/components/ui/context-menu'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { 
  TimelineView,
  TimelineTask, 
  Milestone, 
  TaskDependency,
  DevFlowNode,
  TimeScale,
  TaskDragData
} from '@/types'

interface TimelineGanttViewProps {
  timelineView: TimelineView
  nodes: DevFlowNode[]
  onUpdateTimeline: (timeline: TimelineView) => void
  onTaskClick?: (task: TimelineTask) => void
  onMilestoneClick?: (milestone: Milestone) => void
  className?: string
}

interface TaskEditDialog {
  isOpen: boolean
  task: TimelineTask | null
  mode: 'create' | 'edit'
}

interface MilestoneEditDialog {
  isOpen: boolean
  milestone: Milestone | null
  mode: 'create' | 'edit'
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const statusIcons = {
  'not-started': Circle,
  'in-progress': Play,
  'completed': CheckCircle,
  'blocked': Pause,
  'cancelled': Square
}

const statusColors = {
  'not-started': 'text-gray-500',
  'in-progress': 'text-blue-500',
  'completed': 'text-green-500',
  'blocked': 'text-red-500',
  'cancelled': 'text-gray-400'
}

export function TimelineGanttView({ 
  timelineView, 
  nodes, 
  onUpdateTimeline, 
  onTaskClick, 
  onMilestoneClick,
  className = '' 
}: TimelineGanttViewProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'gantt'>('gantt')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [dragData, setDragData] = useState<TaskDragData | null>(null)
  const [taskEditDialog, setTaskEditDialog] = useState<TaskEditDialog>({ isOpen: false, task: null, mode: 'create' })
  const [milestoneEditDialog, setMilestoneEditDialog] = useState<MilestoneEditDialog>({ isOpen: false, milestone: null, mode: 'create' })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [showCriticalPath, setShowCriticalPath] = useState(true)
  const [showDependencies, setShowDependencies] = useState(true)
  const [showMilestones, setShowMilestones] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  
  // const ganttRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  // const [scrollLeft, setScrollLeft] = useState(0)
  // const [scrollTop, setScrollTop] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  // const [dragStartY, setDragStartY] = useState(0)

  // Calculate time scale based on settings
  const timeScale = useMemo((): TimeScale => {
    const { viewMode: scaleMode, startDate, endDate } = timelineView.settings
    
    if (timelineView.tasks.length === 0) {
      const now = new Date()
      return {
        unit: 'day',
        startDate: now,
        endDate: addDays(now, 30),
        intervals: []
      }
    }
    
    const projectStart = startDate || new Date(Math.min(...timelineView.tasks.map(t => t.startDate.getTime())))
    const projectEnd = endDate || new Date(Math.max(...timelineView.tasks.map(t => t.endDate.getTime())))
    
    // Add padding to the timeline
    const paddedStart = addDays(projectStart, -7)
    const paddedEnd = addDays(projectEnd, 14)
    
    const intervals: any[] = []
    let current = paddedStart
    
    while (current <= paddedEnd) {
      const intervalEnd = scaleMode === 'days' ? addDays(current, 1) :
                         scaleMode === 'weeks' ? addDays(current, 7) :
                         scaleMode === 'months' ? addDays(current, 30) :
                         addDays(current, 90) // quarters
      
      intervals.push({
        start: current,
        end: intervalEnd,
        label: scaleMode === 'days' ? format(current, 'MMM d') :
               scaleMode === 'weeks' ? format(current, 'MMM d') :
               scaleMode === 'months' ? format(current, 'MMM yyyy') :
               format(current, 'QQQ yyyy'),
        isWeekend: scaleMode === 'days' && isWeekend(current),
        isToday: scaleMode === 'days' && isToday(current)
      })
      
      current = intervalEnd
    }
    
    return {
      unit: scaleMode === 'days' ? 'day' : 
            scaleMode === 'weeks' ? 'week' :
            scaleMode === 'months' ? 'month' : 'quarter',
      startDate: paddedStart,
      endDate: paddedEnd,
      intervals
    }
  }, [timelineView.settings, timelineView.tasks])

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return timelineView.tasks.filter(task => {
      const matchesSearch = !searchQuery || 
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus
      const matchesAssignee = filterAssignee === 'all' || task.assignee === filterAssignee
      
      return matchesSearch && matchesPriority && matchesStatus && matchesAssignee
    })
  }, [timelineView.tasks, searchQuery, filterPriority, filterStatus, filterAssignee])

  // Get unique assignees for filter
  const assignees = useMemo(() => {
    const unique = new Set(timelineView.tasks.map(t => t.assignee).filter(Boolean))
    return Array.from(unique)
  }, [timelineView.tasks])

  // Calculate critical path
  const criticalPath = useMemo(() => {
    // Simple critical path calculation - tasks with no slack time
    // const taskMap = new Map(timelineView.tasks.map(t => [t.id, t]))
    const dependencyMap = new Map<string, string[]>()
    
    // Build dependency map
    timelineView.dependencies.forEach(dep => {
      if (!dependencyMap.has(dep.successorId)) {
        dependencyMap.set(dep.successorId, [])
      }
      dependencyMap.get(dep.successorId)!.push(dep.predecessorId)
    })
    
    // For now, return the longest chain of tasks
    return timelineView.tasks
      .filter(t => t.status !== 'completed')
      .sort((a, b) => b.duration - a.duration)
      .slice(0, Math.ceil(timelineView.tasks.length * 0.3))
      .map(t => t.id)
  }, [timelineView.tasks, timelineView.dependencies])

  // Calculate task position and width in pixels
  const getTaskPosition = useCallback((task: TimelineTask) => {
    const totalDays = differenceInDays(timeScale.endDate, timeScale.startDate)
    const dayWidth = (800 * zoomLevel) / totalDays // Base width scaled by zoom
    
    const startOffset = differenceInDays(task.startDate, timeScale.startDate)
    const taskDuration = differenceInDays(task.endDate, task.startDate) || 1
    
    return {
      left: startOffset * dayWidth,
      width: taskDuration * dayWidth,
      dayWidth
    }
  }, [timeScale, zoomLevel])

  // Handle task drag
  const handleTaskDragStart = useCallback((e: React.MouseEvent, task: TimelineTask) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStartX(e.clientX)
    // setDragStartY(e.clientY)
    setDragData({
      taskId: task.id,
      originalStartDate: task.startDate,
      originalEndDate: task.endDate,
      dragType: 'move',
      constraints: {
        respectDependencies: true,
        respectWorkingHours: true
      }
    })
  }, [])

  const handleTaskDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragData) return
    
    const deltaX = e.clientX - dragStartX
    const { dayWidth } = getTaskPosition(timelineView.tasks.find(t => t.id === dragData.taskId)!)
    const daysDelta = Math.round(deltaX / dayWidth)
    
    if (daysDelta !== 0) {
      // const task = timelineView.tasks.find(t => t.id === dragData.taskId)!
      const newStartDate = addDays(dragData.originalStartDate, daysDelta)
      const newEndDate = addDays(dragData.originalEndDate, daysDelta)
      
      // Update task temporarily for visual feedback
      const updatedTasks = timelineView.tasks.map(t => 
        t.id === dragData.taskId 
          ? { ...t, startDate: newStartDate, endDate: newEndDate }
          : t
      )
      
      onUpdateTimeline({
        ...timelineView,
        tasks: updatedTasks
      })
    }
  }, [isDragging, dragData, dragStartX, getTaskPosition, timelineView, onUpdateTimeline])

  const handleTaskDragEnd = useCallback(() => {
    setIsDragging(false)
    setDragData(null)
  }, [])

  // Handle milestone creation
  // const handleCreateMilestone = useCallback((date: Date) => {
  //   const newMilestone: Milestone = {
  //     id: `milestone-${Date.now()}`,
  //     name: 'New Milestone',
  //     date,
  //     completed: false,
  //     type: 'checkpoint',
  //     priority: 'medium',
  //     linkedTaskIds: [],
  //     notifications: []
  //   }
  //   
  //   onUpdateTimeline({
  //     ...timelineView,
  //     milestones: [...timelineView.milestones, newMilestone]
  //   })
  // }, [timelineView, onUpdateTimeline])

  // Handle task creation from node
  const handleCreateTaskFromNode = useCallback((node: DevFlowNode) => {
    const estimatedHours = node.complexity?.estimatedHours || 8
    const newTask: TimelineTask = {
      id: `task-${Date.now()}`,
      nodeId: node.id,
      name: node.title,
      description: node.description,
      startDate: new Date(),
      endDate: addDays(new Date(), Math.ceil(estimatedHours / 8)),
      duration: estimatedHours,
      progress: node.status === 'completed' ? 100 : 0,
      priority: node.metadata.priority <= 2 ? 'critical' : 'medium',
      status: node.status === 'completed' ? 'completed' : 'not-started',
      tags: node.metadata.tags,
      estimatedHours,
      complexity: node.complexity?.storyPoints,
      position: { row: timelineView.tasks.length, level: 0 }
    }
    
    onUpdateTimeline({
      ...timelineView,
      tasks: [...timelineView.tasks, newTask]
    })
  }, [timelineView, onUpdateTimeline])

  // Render task bar
  const renderTaskBar = useCallback((task: TimelineTask, index: number) => {
    const position = getTaskPosition(task)
    const isCritical = criticalPath.includes(task.id)
    const isSelected = selectedTasks.includes(task.id)
    const StatusIcon = statusIcons[task.status]
    
    const taskBarColor = task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'blocked' ? 'bg-red-500' :
                        task.status === 'in-progress' ? 'bg-blue-500' :
                        'bg-gray-400'
    
    const criticalPathColor = isCritical && showCriticalPath ? 'ring-2 ring-red-400' : ''
    
    return (
      <div
        key={task.id}
        className={`absolute flex items-center cursor-move transition-all duration-200 ${criticalPathColor}`}
        style={{
          left: position.left,
          width: position.width,
          top: index * 50 + 10,
          height: 30,
          minWidth: 60
        }}
        onMouseDown={(e) => handleTaskDragStart(e, task)}
        onClick={() => {
          setSelectedTasks(prev => 
            prev.includes(task.id) 
              ? prev.filter(id => id !== task.id)
              : [...prev, task.id]
          )
          onTaskClick?.(task)
        }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`
                h-full w-full rounded px-2 flex items-center justify-between
                ${taskBarColor} text-white text-xs font-medium
                ${isSelected ? 'ring-2 ring-blue-400' : ''}
                hover:opacity-90 transition-opacity
              `}>
                <div className="flex items-center gap-1 min-w-0">
                  <StatusIcon className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{task.name}</span>
                </div>
                
                {task.progress > 0 && (
                  <div className="flex-shrink-0 ml-1">
                    <div className="w-8 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <div className="font-medium">{task.name}</div>
                <div className="text-muted-foreground">
                  {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}
                </div>
                <div className="text-muted-foreground">
                  Duration: {task.duration}h | Progress: {task.progress}%
                </div>
                {task.assignee && (
                  <div className="text-muted-foreground">
                    Assignee: {task.assignee}
                  </div>
                )}
                {isCritical && (
                  <div className="text-red-400 font-medium">Critical Path</div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }, [getTaskPosition, criticalPath, showCriticalPath, selectedTasks, handleTaskDragStart, onTaskClick])

  // Render milestone
  const renderMilestone = useCallback((milestone: Milestone) => {
    const totalDays = differenceInDays(timeScale.endDate, timeScale.startDate)
    const dayWidth = (800 * zoomLevel) / totalDays
    const milestoneOffset = differenceInDays(milestone.date, timeScale.startDate)
    const left = milestoneOffset * dayWidth
    
    const isOverdue = !milestone.completed && milestone.date < new Date()
    const milestoneColor = milestone.completed ? 'text-green-500' :
                          isOverdue ? 'text-red-500' :
                          'text-blue-500'
    
    return (
      <div
        key={milestone.id}
        className="absolute flex flex-col items-center cursor-pointer"
        style={{
          left: left - 8,
          top: -10,
          zIndex: 10
        }}
        onClick={() => onMilestoneClick?.(milestone)}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`${milestoneColor}`}>
                <Flag className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <div className="font-medium">{milestone.name}</div>
                <div className="text-muted-foreground">
                  {format(milestone.date, 'MMM d, yyyy')}
                </div>
                <div className={`${milestoneColor} text-xs`}>
                  {milestone.completed ? 'Completed' :
                   isOverdue ? 'Overdue' : 'Upcoming'}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Milestone line */}
        <div 
          className={`w-0.5 ${milestone.completed ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ height: filteredTasks.length * 50 + 20 }}
        />
      </div>
    )
  }, [timeScale, zoomLevel, filteredTasks.length, onMilestoneClick])

  // Render dependency arrow
  const renderDependency = useCallback((dependency: TaskDependency) => {
    const predecessorTask = timelineView.tasks.find(t => t.id === dependency.predecessorId)
    const successorTask = timelineView.tasks.find(t => t.id === dependency.successorId)
    
    if (!predecessorTask || !successorTask) return null
    
    const predIndex = filteredTasks.findIndex(t => t.id === dependency.predecessorId)
    const succIndex = filteredTasks.findIndex(t => t.id === dependency.successorId)
    
    if (predIndex === -1 || succIndex === -1) return null
    
    const predPosition = getTaskPosition(predecessorTask)
    const succPosition = getTaskPosition(successorTask)
    
    const startX = predPosition.left + predPosition.width
    const startY = predIndex * 50 + 25
    const endX = succPosition.left
    const endY = succIndex * 50 + 25
    
    const isCriticalDependency = criticalPath.includes(dependency.predecessorId) && 
                                criticalPath.includes(dependency.successorId)
    
    return (
      <svg
        key={dependency.id}
        className="absolute pointer-events-none"
        style={{
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          zIndex: 5
        }}
      >
        <defs>
          <marker
            id={`arrowhead-${dependency.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill={isCriticalDependency ? '#ef4444' : '#6b7280'}
            />
          </marker>
        </defs>
        <path
          d={`M ${startX} ${startY} Q ${startX + 20} ${startY} ${startX + 20} ${(startY + endY) / 2} Q ${startX + 20} ${endY} ${endX - 20} ${endY} Q ${endX} ${endY} ${endX} ${endY}`}
          stroke={isCriticalDependency ? '#ef4444' : '#6b7280'}
          strokeWidth="2"
          fill="none"
          markerEnd={`url(#arrowhead-${dependency.id})`}
          className={isCriticalDependency ? 'opacity-80' : 'opacity-50'}
        />
      </svg>
    )
  }, [timelineView.tasks, filteredTasks, getTaskPosition, criticalPath])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{timelineView.name}</h2>
          <Badge variant="outline">
            {filteredTasks.length} tasks
          </Badge>
          {timelineView.milestones.length > 0 && (
            <Badge variant="outline">
              {timelineView.milestones.length} milestones
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <Select value={viewMode} onValueChange={(value: 'timeline' | 'gantt') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timeline">Timeline</SelectItem>
              <SelectItem value="gantt">Gantt Chart</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Time Scale */}
          <Select 
            value={timelineView.settings.viewMode} 
            onValueChange={(value: 'days' | 'weeks' | 'months' | 'quarters') => {
              onUpdateTimeline({
                ...timelineView,
                settings: { ...timelineView.settings, viewMode: value }
              })
            }}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
              <SelectItem value="quarters">Quarters</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs px-2">{Math.round(zoomLevel * 100)}%</span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Action Buttons */}
          <Button 
            size="sm" 
            onClick={() => setTaskEditDialog({ isOpen: true, task: null, mode: 'create' })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Task
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setMilestoneEditDialog({ isOpen: true, milestone: null, mode: 'create' })}
          >
            <Flag className="h-4 w-4 mr-1" />
            Milestone
          </Button>
        </div>
      </div>
      
      {/* Filters and View Options */}
      <div className="flex items-center gap-2 p-4 border-b bg-muted/30">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        {assignees.length > 0 && (
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {assignees.map(assignee => (
                <SelectItem key={assignee} value={assignee!}>
                  {assignee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* View Options */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Switch 
              checked={showCriticalPath} 
              onCheckedChange={setShowCriticalPath}
              id="critical-path"
            />
            <Label htmlFor="critical-path" className="text-xs">Critical Path</Label>
          </div>
          
          <div className="flex items-center gap-1">
            <Switch 
              checked={showDependencies} 
              onCheckedChange={setShowDependencies}
              id="dependencies"
            />
            <Label htmlFor="dependencies" className="text-xs">Dependencies</Label>
          </div>
          
          <div className="flex items-center gap-1">
            <Switch 
              checked={showMilestones} 
              onCheckedChange={setShowMilestones}
              id="milestones"
            />
            <Label htmlFor="milestones" className="text-xs">Milestones</Label>
          </div>
        </div>
      </div>
      
      {/* Gantt Chart */}
      <div className="flex-1 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No tasks to display</p>
              <p className="text-sm">Create tasks from your DevFlow nodes or add new tasks</p>
              <div className="mt-4 space-x-2">
                <Button 
                  onClick={() => setTaskEditDialog({ isOpen: true, task: null, mode: 'create' })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Task
                </Button>
                {nodes.length > 0 && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Create tasks from all nodes
                      nodes.forEach(node => handleCreateTaskFromNode(node))
                    }}
                  >
                    <Target className="h-4 w-4 mr-1" />
                    Import from Nodes
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex">
            {/* Task List Sidebar */}
            <div className="w-80 border-r bg-muted/30">
              <div className="p-4 border-b">
                <h3 className="font-medium">Tasks</h3>
              </div>
              <ScrollArea className="h-full">
                <div className="p-2">
                  {filteredTasks.map((task) => {
                    const StatusIcon = statusIcons[task.status]
                    const isCritical = criticalPath.includes(task.id)
                    const isSelected = selectedTasks.includes(task.id)
                    
                    return (
                      <div
                        key={task.id}
                        className={`
                          p-3 mb-2 rounded-lg border cursor-pointer transition-colors
                          ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-background hover:bg-muted/50'}
                          ${isCritical ? 'ring-1 ring-red-200' : ''}
                        `}
                        style={{ height: 50 }}
                        onClick={() => {
                          setSelectedTasks(prev => 
                            prev.includes(task.id) 
                              ? prev.filter(id => id !== task.id)
                              : [...prev, task.id]
                          )
                          onTaskClick?.(task)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <StatusIcon className={`h-4 w-4 ${statusColors[task.status]}`} />
                            <span className="font-medium text-sm truncate">{task.name}</span>
                            {isCritical && (
                              <Badge variant="destructive" className="text-xs">Critical</Badge>
                            )}
                          </div>
                          <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}
                          </span>
                          {task.progress > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {task.progress}%
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
            
            {/* Timeline Chart */}
            <div className="flex-1 overflow-auto">
              <div 
                ref={timelineRef}
                className="relative"
                style={{ 
                  width: 800 * zoomLevel,
                  height: Math.max(400, filteredTasks.length * 50 + 100),
                  minWidth: '100%'
                }}
                onMouseMove={handleTaskDragMove}
                onMouseUp={handleTaskDragEnd}
                onMouseLeave={handleTaskDragEnd}
              >
                {/* Time Scale Header */}
                <div className="sticky top-0 z-20 bg-background border-b">
                  <div className="h-12 flex items-center relative">
                    {timeScale.intervals.map((interval, index) => {
                      const totalDays = differenceInDays(timeScale.endDate, timeScale.startDate)
                      const dayWidth = (800 * zoomLevel) / totalDays
                      const intervalDays = differenceInDays(interval.end, interval.start)
                      const width = intervalDays * dayWidth
                      const left = differenceInDays(interval.start, timeScale.startDate) * dayWidth
                      
                      return (
                        <div
                          key={index}
                          className={`
                            absolute border-r text-xs font-medium flex items-center justify-center
                            ${interval.isToday ? 'bg-blue-50 text-blue-700' : ''}
                            ${interval.isWeekend ? 'bg-gray-50 text-gray-500' : ''}
                          `}
                          style={{
                            left,
                            width,
                            height: '100%'
                          }}
                        >
                          {interval.label}
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* Task Bars */}
                <div className="relative" style={{ paddingTop: 20 }}>
                  {filteredTasks.map((task, index) => renderTaskBar(task, index))}
                  
                  {/* Dependencies */}
                  {showDependencies && timelineView.dependencies.map(renderDependency)}
                  
                  {/* Milestones */}
                  {showMilestones && timelineView.milestones.map(renderMilestone)}
                  
                  {/* Today Line */}
                  {(() => {
                    const today = new Date()
                    if (today >= timeScale.startDate && today <= timeScale.endDate) {
                      const totalDays = differenceInDays(timeScale.endDate, timeScale.startDate)
                      const dayWidth = (800 * zoomLevel) / totalDays
                      const todayOffset = differenceInDays(today, timeScale.startDate)
                      const left = todayOffset * dayWidth
                      
                      return (
                        <div
                          className="absolute top-0 w-0.5 bg-red-500 z-10"
                          style={{
                            left,
                            height: filteredTasks.length * 50 + 40
                          }}
                        >
                          <div className="absolute -top-2 -left-8 text-xs text-red-500 font-medium">
                            Today
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Task Edit Dialog */}
      <Dialog open={taskEditDialog.isOpen} onOpenChange={(open) => 
        setTaskEditDialog({ isOpen: open, task: null, mode: 'create' })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {taskEditDialog.mode === 'create' ? 'Create Task' : 'Edit Task'}
            </DialogTitle>
            <DialogDescription>
              {taskEditDialog.mode === 'create' 
                ? 'Create a new task for your timeline'
                : 'Edit the selected task details'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-name">Task Name</Label>
              <Input
                id="task-name"
                placeholder="Enter task name..."
                defaultValue={taskEditDialog.task?.name || ''}
              />
            </div>
            
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Enter task description..."
                defaultValue={taskEditDialog.task?.description || ''}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  defaultValue={taskEditDialog.task?.startDate 
                    ? format(taskEditDialog.task.startDate, 'yyyy-MM-dd')
                    : format(new Date(), 'yyyy-MM-dd')
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  defaultValue={taskEditDialog.task?.endDate 
                    ? format(taskEditDialog.task.endDate, 'yyyy-MM-dd')
                    : format(addDays(new Date(), 1), 'yyyy-MM-dd')
                  }
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select defaultValue={taskEditDialog.task?.priority || 'medium'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  placeholder="Enter assignee name..."
                  defaultValue={taskEditDialog.task?.assignee || ''}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => 
              setTaskEditDialog({ isOpen: false, task: null, mode: 'create' })
            }>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle task save
              setTaskEditDialog({ isOpen: false, task: null, mode: 'create' })
            }}>
              <Save className="h-4 w-4 mr-1" />
              Save Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Milestone Edit Dialog */}
      <Dialog open={milestoneEditDialog.isOpen} onOpenChange={(open) => 
        setMilestoneEditDialog({ isOpen: open, milestone: null, mode: 'create' })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {milestoneEditDialog.mode === 'create' ? 'Create Milestone' : 'Edit Milestone'}
            </DialogTitle>
            <DialogDescription>
              {milestoneEditDialog.mode === 'create' 
                ? 'Create a new milestone for your timeline'
                : 'Edit the selected milestone details'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="milestone-name">Milestone Name</Label>
              <Input
                id="milestone-name"
                placeholder="Enter milestone name..."
                defaultValue={milestoneEditDialog.milestone?.name || ''}
              />
            </div>
            
            <div>
              <Label htmlFor="milestone-description">Description</Label>
              <Textarea
                id="milestone-description"
                placeholder="Enter milestone description..."
                defaultValue={milestoneEditDialog.milestone?.description || ''}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="milestone-date">Date</Label>
                <Input
                  id="milestone-date"
                  type="date"
                  defaultValue={milestoneEditDialog.milestone?.date 
                    ? format(milestoneEditDialog.milestone.date, 'yyyy-MM-dd')
                    : format(new Date(), 'yyyy-MM-dd')
                  }
                />
              </div>
              
              <div>
                <Label htmlFor="milestone-type">Type</Label>
                <Select defaultValue={milestoneEditDialog.milestone?.type || 'checkpoint'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="checkpoint">Checkpoint</SelectItem>
                    <SelectItem value="release">Release</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => 
              setMilestoneEditDialog({ isOpen: false, milestone: null, mode: 'create' })
            }>
              Cancel
            </Button>
            <Button onClick={() => {
              // Handle milestone save
              setMilestoneEditDialog({ isOpen: false, milestone: null, mode: 'create' })
            }}>
              <Save className="h-4 w-4 mr-1" />
              Save Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}