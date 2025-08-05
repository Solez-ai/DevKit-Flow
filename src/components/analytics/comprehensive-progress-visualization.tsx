import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target,
  Settings,
  Download,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useProgressAnalytics } from '@/hooks/use-progress-analytics'
import { ProgressDashboard } from './progress-dashboard'
import { SessionStatisticsDashboard } from './session-statistics-dashboard'
import { TimeEstimationAnalysis } from './time-estimation-analysis'
import { ExportableProgressReports } from './exportable-progress-reports'
import { ProgressChart } from './progress-chart'
import { VelocityChart } from './velocity-chart'
import { ProductivityInsights } from './productivity-insights'
import { BlockedNodesPanel } from './blocked-nodes-panel'

interface ComprehensiveProgressVisualizationProps {
  sessionId?: string
  sessionName?: string
  className?: string
}

interface VisualizationSettings {
  autoRefresh: boolean
  refreshInterval: number
  showInsights: boolean
  showTrends: boolean
  showTimeAnalysis: boolean
  showExportOptions: boolean
  compactMode: boolean
}

export function ComprehensiveProgressVisualization({ 
  sessionId, 
  sessionName = 'Current Session',
  className = '' 
}: ComprehensiveProgressVisualizationProps) {
  const [settings, setSettings] = useState<VisualizationSettings>({
    autoRefresh: true,
    refreshInterval: 30000,
    showInsights: true,
    showTrends: true,
    showTimeAnalysis: true,
    showExportOptions: true,
    compactMode: false
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { 
    analytics, 
    insights, 
    isLoading, 
    error,
    refresh
  } = useProgressAnalytics({ 
    sessionId, 
    includeInsights: settings.showInsights,
    refreshInterval: settings.autoRefresh ? settings.refreshInterval : 0
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const updateSetting = <K extends keyof VisualizationSettings>(
    key: K, 
    value: VisualizationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading progress visualization...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="text-red-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Failed to load progress data</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No progress data available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start working on tasks to see progress visualization
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Progress Visualization - {sessionName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Settings */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-refresh"
                checked={settings.autoRefresh}
                onCheckedChange={(checked) => updateSetting('autoRefresh', checked)}
              />
              <Label htmlFor="auto-refresh">Auto-refresh</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="compact-mode"
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSetting('compactMode', checked)}
              />
              <Label htmlFor="compact-mode">Compact mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-insights"
                checked={settings.showInsights}
                onCheckedChange={(checked) => updateSetting('showInsights', checked)}
              />
              <Label htmlFor="show-insights">Show insights</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-trends"
                checked={settings.showTrends}
                onCheckedChange={(checked) => updateSetting('showTrends', checked)}
              />
              <Label htmlFor="show-trends">Show trends</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Visualization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Analysis
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProgressDashboard 
            sessionId={sessionId} 
            className={settings.compactMode ? 'space-y-4' : ''}
          />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <SessionStatisticsDashboard analytics={analytics} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {settings.showTrends && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProgressChart analytics={analytics} />
                <VelocityChart analytics={analytics} />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProductivityInsights analytics={analytics} />
                {analytics.blockedNodes > 0 && (
                  <BlockedNodesPanel analytics={analytics} />
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          {settings.showTimeAnalysis && (
            <TimeEstimationAnalysis analytics={analytics} />
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {settings.showExportOptions && (
            <ExportableProgressReports 
              analytics={analytics} 
              sessionName={sessionName}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats Footer */}
      {!settings.compactMode && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalNodes}</p>
                <p className="text-xs text-muted-foreground">Total Nodes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{analytics.completedNodes}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{analytics.completionPercentage.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Progress</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{analytics.completionVelocity.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Velocity/Day</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{analytics.blockedNodes}</p>
                <p className="text-xs text-muted-foreground">Blocked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">
                  {(analytics.estimatedTimeRemaining / (1000 * 60 * 60)).toFixed(0)}h
                </p>
                <p className="text-xs text-muted-foreground">Est. Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Summary */}
      {settings.showInsights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {insights.slice(0, 3).map((insight, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border text-sm ${
                    insight.type === 'success' ? 'bg-green-50 border-green-200' :
                    insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    insight.type === 'error' ? 'bg-red-50 border-red-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <p className="font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                  {insight.recommendation && (
                    <p className="text-xs font-medium mt-2 text-blue-600">
                      💡 {insight.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}