import { useState, useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { 
  Calendar, 
  Clock, 
  Plus,
  Edit,
  Download,
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Save,
  FileText
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TimelineGanttView } from './timeline-gantt-view'
import { useTimelineGantt } from '@/hooks/use-timeline-gantt'
import type { 
  TimelineView,
  DevFlowNode,
  CriticalPathAnalysis,
  TaskSchedulingResult
} from '@/types'

interface TimelineManagerProps {
  sessionId: string
  nodes: DevFlowNode[]
  className?: string
}

interface TimelineCreateDialog {
  isOpen: boolean
  timeline: TimelineView | null
  mode: 'create' | 'edit'
}

interface SchedulingDialog {
  isOpen: boolean
  result: TaskSchedulingResult | null
}

interface CriticalPathDialog {
  isOpen: boolean
  analysis: CriticalPathAnalysis | null
}

export function TimelineManager({ sessionId, nodes, className = '' }: TimelineManagerProps) {
  const {
    timelineViews,
    currentTimelineView,
    isLoading,
    error,
    createTimelineView,
    updateTimelineView,
    setCurrentTimelineView,
    createTaskFromNode,
    scheduleAllTasks,
    calculateCriticalPath,
    validateSchedule,
    exportTimelineView,
    importTimelineView
  } = useTimelineGantt({ sessionId, autoSave: true })

  const [timelineDialog, setTimelineDialog] = useState<TimelineCreateDialog>({
    isOpen: false,
    timeline: null,
    mode: 'create'
  })
  const [schedulingDialog, setSchedulingDialog] = useState<SchedulingDialog>({
    isOpen: false,
    result: null
  })
  const [criticalPathDialog, setCriticalPathDialog] = useState<CriticalPathDialog>({
    isOpen: false,
    analysis: null
  })
  const [activeTab, setActiveTab] = useState('timeline')

  // Calculate timeline statistics
  const timelineStats = useMemo(() => {
    if (!currentTimelineView) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        totalMilestones: 0,
        completedMilestones: 0,
        overdueMilestones: 0,
        completionPercentage: 0,
        averageProgress: 0
      }
    }

    const now = new Date()
    const tasks = currentTimelineView.tasks
    const milestones = currentTimelineView.milestones

    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.endDate < now).length
    const completedMilestones = milestones.filter(m => m.completed).length
    const overdueMilestones = milestones.filter(m => !m.completed && m.date < now).length
    const averageProgress = tasks.length > 0 
      ? tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length 
      : 0

    return {
      totalTasks: tasks.length,
      completedTasks,
      overdueTasks,
      totalMilestones: milestones.length,
      completedMilestones,
      overdueMilestones,
      completionPercentage: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0,
      averageProgress
    }
  }, [currentTimelineView])

  // Handle timeline creation
  const handleCreateTimeline = useCallback((name: string, description?: string) => {
    const newTimeline = createTimelineView(name, description)
    setTimelineDialog({ isOpen: false, timeline: null, mode: 'create' })
    return newTimeline
  }, [createTimelineView])

  // Handle timeline update
  const handleUpdateTimeline = useCallback((timeline: TimelineView) => {
    updateTimelineView(timeline)
  }, [updateTimelineView])

  // Handle task creation from nodes
  const handleCreateTasksFromNodes = useCallback(() => {
    if (!currentTimelineView) return
    
    nodes.forEach(node => {
      // Check if task already exists for this node
      const existingTask = currentTimelineView.tasks.find(t => t.nodeId === node.id)
      if (!existingTask) {
        createTaskFromNode(node)
      }
    })
  }, [currentTimelineView, nodes, createTaskFromNode])

  // Handle auto-scheduling
  const handleAutoSchedule = useCallback(() => {
    if (!currentTimelineView) return
    
    const result = scheduleAllTasks()
    setSchedulingDialog({ isOpen: true, result })
    
    if (result.success) {
      updateTimelineView({
        ...currentTimelineView,
        tasks: result.scheduledTasks
      })
    }
  }, [currentTimelineView, scheduleAllTasks, updateTimelineView])

  // Handle critical path analysis
  const handleCriticalPathAnalysis = useCallback(() => {
    if (!currentTimelineView) return
    
    const analysis = calculateCriticalPath()
    setCriticalPathDialog({ isOpen: true, analysis })
  }, [currentTimelineView, calculateCriticalPath])

  // Handle timeline export
  const handleExport = useCallback(async (format: 'json' | 'csv' | 'pdf') => {
    if (!currentTimelineView) return
    
    try {
      const blob = await exportTimelineView(currentTimelineView.id, format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentTimelineView.name}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }, [currentTimelineView, exportTimelineView])

  // Handle timeline import
  const handleImport = useCallback(async (file: File, format: 'json' | 'csv') => {
    try {
      const importedTimeline = await importTimelineView(file, format)
      setCurrentTimelineView(importedTimeline.id)
    } catch (error) {
      console.error('Import failed:', error)
    }
  }, [importTimelineView, setCurrentTimelineView])

  // Validate current schedule
  const scheduleValidation = useMemo(() => {
    if (!currentTimelineView) return { isValid: true, issues: [] }
    return validateSchedule()
  }, [currentTimelineView, validateSchedule])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading timeline...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Timeline Manager</h2>
          {currentTimelineView && (
            <Badge variant="outline">{currentTimelineView.name}</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Timeline Selector */}
          {timelineViews.length > 0 && (
            <Select 
              value={currentTimelineView?.id || ''} 
              onValueChange={setCurrentTimelineView}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select timeline..." />
              </SelectTrigger>
              <SelectContent>
                {timelineViews.map(timeline => (
                  <SelectItem key={timeline.id} value={timeline.id}>
                    {timeline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Action Buttons */}
          <Button 
            size="sm" 
            onClick={() => setTimelineDialog({ isOpen: true, timeline: null, mode: 'create' })}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Timeline
          </Button>
          
          {currentTimelineView && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setTimelineDialog({ 
                  isOpen: true, 
                  timeline: currentTimelineView, 
                  mode: 'edit' 
                })}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleExport('json')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {!currentTimelineView ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Timeline Selected</h3>
            <p className="text-muted-foreground mb-4">
              Create a new timeline to start planning your project schedule and tracking milestones.
            </p>
            <div className="space-x-2">
              <Button onClick={() => setTimelineDialog({ isOpen: true, timeline: null, mode: 'create' })}>
                <Plus className="h-4 w-4 mr-1" />
                Create Timeline
              </Button>
              {timelineViews.length > 0 && (
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-1" />
                  Select Existing
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 pt-2">
            <TabsList>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="timeline" className="flex-1 mt-0">
            <div className="h-full">
              {/* Quick Actions Bar */}
              <div className="flex items-center gap-2 p-4 border-b bg-muted/30">
                <Button 
                  size="sm" 
                  onClick={handleCreateTasksFromNodes}
                  disabled={nodes.length === 0}
                >
                  <Target className="h-4 w-4 mr-1" />
                  Import from Nodes ({nodes.length})
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleAutoSchedule}
                  disabled={currentTimelineView.tasks.length === 0}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Auto Schedule
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleCriticalPathAnalysis}
                  disabled={currentTimelineView.tasks.length === 0}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Critical Path
                </Button>
                
                <Separator orientation="vertical" className="h-6" />
                
                {/* Schedule Validation */}
                {!scheduleValidation.isValid && (
                  <Alert className="flex-1">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {scheduleValidation.issues.length} scheduling issues found
                    </AlertDescription>
                  </Alert>
                )}
                
                {scheduleValidation.isValid && currentTimelineView.tasks.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Schedule is valid
                  </div>
                )}
              </div>
              
              {/* Timeline/Gantt Chart */}
              <div className="flex-1">
                <TimelineGanttView
                  timelineView={currentTimelineView}
                  nodes={nodes}
                  onUpdateTimeline={handleUpdateTimeline}
                  onTaskClick={(task) => console.log('Task clicked:', task)}
                  onMilestoneClick={(milestone) => console.log('Milestone clicked:', milestone)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="flex-1 mt-0 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Task Statistics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{timelineStats.totalTasks}</div>
                  <div className="text-xs text-muted-foreground">
                    {timelineStats.completedTasks} completed
                  </div>
                  <Progress 
                    value={timelineStats.completionPercentage} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
              
              {/* Milestone Statistics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{timelineStats.totalMilestones}</div>
                  <div className="text-xs text-muted-foreground">
                    {timelineStats.completedMilestones} completed
                  </div>
                  {timelineStats.overdueMilestones > 0 && (
                    <div className="text-xs text-red-500 mt-1">
                      {timelineStats.overdueMilestones} overdue
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Progress Statistics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(timelineStats.averageProgress)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Across all tasks
                  </div>
                  <Progress 
                    value={timelineStats.averageProgress} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>
              
              {/* Issues */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {timelineStats.overdueTasks + timelineStats.overdueMilestones}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Overdue items
                  </div>
                  {scheduleValidation.issues.length > 0 && (
                    <div className="text-xs text-orange-500 mt-1">
                      {scheduleValidation.issues.length} scheduling conflicts
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Schedule Issues */}
              {scheduleValidation.issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Schedule Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {scheduleValidation.issues.map((issue, index) => (
                          <Alert key={index}>
                            <AlertDescription className="text-sm">
                              {issue}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
              
              {/* Task Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['not-started', 'in-progress', 'completed', 'blocked', 'cancelled'].map(status => {
                      const count = currentTimelineView.tasks.filter(t => t.status === status).length
                      const percentage = currentTimelineView.tasks.length > 0 
                        ? (count / currentTimelineView.tasks.length) * 100 
                        : 0
                      
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{status.replace('-', ' ')}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{count}</span>
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="flex-1 mt-0 p-4">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Working Hours per Day</Label>
                      <Input 
                        type="number" 
                        value={currentTimelineView.settings.workingHoursPerDay}
                        onChange={(e) => handleUpdateTimeline({
                          ...currentTimelineView,
                          settings: {
                            ...currentTimelineView.settings,
                            workingHoursPerDay: parseInt(e.target.value) || 8
                          }
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label>Working Days per Week</Label>
                      <Input 
                        type="number" 
                        value={currentTimelineView.settings.workingDaysPerWeek}
                        onChange={(e) => handleUpdateTimeline({
                          ...currentTimelineView,
                          settings: {
                            ...currentTimelineView.settings,
                            workingDaysPerWeek: parseInt(e.target.value) || 5
                          }
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Show Weekends</Label>
                      <Switch 
                        checked={currentTimelineView.settings.showWeekends}
                        onCheckedChange={(checked) => handleUpdateTimeline({
                          ...currentTimelineView,
                          settings: {
                            ...currentTimelineView.settings,
                            showWeekends: checked
                          }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Auto Schedule</Label>
                      <Switch 
                        checked={currentTimelineView.settings.autoSchedule}
                        onCheckedChange={(checked) => handleUpdateTimeline({
                          ...currentTimelineView,
                          settings: {
                            ...currentTimelineView.settings,
                            autoSchedule: checked
                          }
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Show Critical Path</Label>
                      <Switch 
                        checked={currentTimelineView.settings.showCriticalPath}
                        onCheckedChange={(checked) => handleUpdateTimeline({
                          ...currentTimelineView,
                          settings: {
                            ...currentTimelineView.settings,
                            showCriticalPath: checked
                          }
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Import/Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Export Timeline</Label>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handleExport('json')}>
                        <Download className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                      <Button size="sm" onClick={() => handleExport('csv')}>
                        <Download className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button size="sm" onClick={() => handleExport('pdf')}>
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Import Timeline</Label>
                    <div className="mt-2">
                      <Input 
                        type="file" 
                        accept=".json,.csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const format = file.name.endsWith('.json') ? 'json' : 'csv'
                            handleImport(file, format)
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Timeline Create/Edit Dialog */}
      <Dialog open={timelineDialog.isOpen} onOpenChange={(open) => 
        setTimelineDialog({ isOpen: open, timeline: null, mode: 'create' })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {timelineDialog.mode === 'create' ? 'Create Timeline' : 'Edit Timeline'}
            </DialogTitle>
            <DialogDescription>
              {timelineDialog.mode === 'create' 
                ? 'Create a new timeline for your project planning'
                : 'Edit the timeline details'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="timeline-name">Timeline Name</Label>
              <Input
                id="timeline-name"
                placeholder="Enter timeline name..."
                defaultValue={timelineDialog.timeline?.name || ''}
              />
            </div>
            
            <div>
              <Label htmlFor="timeline-description">Description</Label>
              <Textarea
                id="timeline-description"
                placeholder="Enter timeline description..."
                defaultValue={timelineDialog.timeline?.description || ''}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => 
              setTimelineDialog({ isOpen: false, timeline: null, mode: 'create' })
            }>
              Cancel
            </Button>
            <Button onClick={() => {
              const nameInput = document.getElementById('timeline-name') as HTMLInputElement
              const descInput = document.getElementById('timeline-description') as HTMLTextAreaElement
              
              if (timelineDialog.mode === 'create') {
                handleCreateTimeline(nameInput.value, descInput.value)
              } else if (timelineDialog.timeline) {
                handleUpdateTimeline({
                  ...timelineDialog.timeline,
                  name: nameInput.value,
                  description: descInput.value
                })
                setTimelineDialog({ isOpen: false, timeline: null, mode: 'create' })
              }
            }}>
              <Save className="h-4 w-4 mr-1" />
              {timelineDialog.mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Scheduling Results Dialog */}
      <Dialog open={schedulingDialog.isOpen} onOpenChange={(open) => 
        setSchedulingDialog({ isOpen: open, result: null })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-Scheduling Results</DialogTitle>
            <DialogDescription>
              Review the automatic scheduling results and conflicts
            </DialogDescription>
          </DialogHeader>
          
          {schedulingDialog.result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project End Date</Label>
                  <div className="text-lg font-medium">
                    {format(schedulingDialog.result.projectEndDate, 'MMM d, yyyy')}
                  </div>
                </div>
                
                <div>
                  <Label>Total Duration</Label>
                  <div className="text-lg font-medium">
                    {schedulingDialog.result.totalDuration} days
                  </div>
                </div>
              </div>
              
              {schedulingDialog.result.conflicts.length > 0 && (
                <div>
                  <Label>Conflicts ({schedulingDialog.result.conflicts.length})</Label>
                  <ScrollArea className="h-32 mt-2">
                    <div className="space-y-2">
                      {schedulingDialog.result.conflicts.map((conflict, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {conflict.description}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              {schedulingDialog.result.warnings.length > 0 && (
                <div>
                  <Label>Warnings ({schedulingDialog.result.warnings.length})</Label>
                  <ScrollArea className="h-32 mt-2">
                    <div className="space-y-2">
                      {schedulingDialog.result.warnings.map((warning, index) => (
                        <Alert key={index}>
                          <AlertDescription className="text-sm">
                            {warning.description}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => 
              setSchedulingDialog({ isOpen: false, result: null })
            }>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Critical Path Analysis Dialog */}
      <Dialog open={criticalPathDialog.isOpen} onOpenChange={(open) => 
        setCriticalPathDialog({ isOpen: open, analysis: null })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Critical Path Analysis</DialogTitle>
            <DialogDescription>
              Analysis of the critical path and project bottlenecks
            </DialogDescription>
          </DialogHeader>
          
          {criticalPathDialog.analysis && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Critical Path Length</Label>
                  <div className="text-lg font-medium">
                    {criticalPathDialog.analysis.path.length} tasks
                  </div>
                </div>
                
                <div>
                  <Label>Total Duration</Label>
                  <div className="text-lg font-medium">
                    {criticalPathDialog.analysis.totalDuration} hours
                  </div>
                </div>
              </div>
              
              {criticalPathDialog.analysis.bottlenecks.length > 0 && (
                <div>
                  <Label>Bottlenecks</Label>
                  <div className="mt-2 space-y-1">
                    {criticalPathDialog.analysis.bottlenecks.map((bottleneck, index) => (
                      <Badge key={index} variant="destructive">
                        {bottleneck}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {criticalPathDialog.analysis.recommendations.length > 0 && (
                <div>
                  <Label>Recommendations</Label>
                  <ScrollArea className="h-32 mt-2">
                    <div className="space-y-2">
                      {criticalPathDialog.analysis.recommendations.map((rec, index) => (
                        <Alert key={index}>
                          <AlertDescription className="text-sm">
                            <strong>{rec.type}:</strong> {rec.description}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => 
              setCriticalPathDialog({ isOpen: false, analysis: null })
            }>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}