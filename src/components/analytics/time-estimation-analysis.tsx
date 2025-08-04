
import { 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ProgressAnalytics } from '@/lib/progress-analytics'

interface TimeEstimationAnalysisProps {
  analytics: ProgressAnalytics
  className?: string
}

interface EstimationAccuracy {
  nodeId: string
  nodeTitle: string
  estimatedTime: number
  actualTime: number
  accuracy: number
  variance: number
  status: 'under' | 'over' | 'accurate'
}

export function TimeEstimationAnalysis({ analytics, className = '' }: TimeEstimationAnalysisProps) {
  const formatDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  // Mock estimation data - in real implementation, this would come from node metadata
  const generateEstimationData = (): EstimationAccuracy[] => {
    const mockData: EstimationAccuracy[] = []
    const completedNodeCount = Math.min(analytics.completedNodes, 10) // Limit for demo
    
    for (let i = 0; i < completedNodeCount; i++) {
      const estimatedTime = (Math.random() * 4 + 1) * 60 * 60 * 1000 // 1-5 hours
      const actualTime = estimatedTime * (0.5 + Math.random() * 1.5) // 50%-200% of estimate
      const variance = ((actualTime - estimatedTime) / estimatedTime) * 100
      
      mockData.push({
        nodeId: `node-${i}`,
        nodeTitle: `Task ${i + 1}`,
        estimatedTime,
        actualTime,
        accuracy: Math.abs(variance) <= 20 ? 100 - Math.abs(variance) : Math.max(0, 80 - Math.abs(variance)),
        variance,
        status: Math.abs(variance) <= 20 ? 'accurate' : variance > 0 ? 'over' : 'under'
      })
    }
    
    return mockData.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
  }

  const estimationData = generateEstimationData()
  
  // Calculate overall estimation metrics
  const overallAccuracy = estimationData.length > 0 
    ? estimationData.reduce((sum, item) => sum + item.accuracy, 0) / estimationData.length 
    : 0
  
  const averageVariance = estimationData.length > 0
    ? estimationData.reduce((sum, item) => sum + Math.abs(item.variance), 0) / estimationData.length
    : 0

  const underEstimated = estimationData.filter(item => item.status === 'over').length
  const overEstimated = estimationData.filter(item => item.status === 'under').length
  const accurate = estimationData.filter(item => item.status === 'accurate').length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accurate':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'over':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'under':
        return <TrendingDown className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accurate':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'over':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'under':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getVarianceColor = (variance: number): string => {
    if (Math.abs(variance) <= 20) return 'text-green-600'
    if (Math.abs(variance) <= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Time Estimation vs Actual Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {estimationData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No completed tasks with time estimates available</p>
            <p className="text-sm mt-2">Complete some tasks with time tracking to see estimation analysis</p>
          </div>
        ) : (
          <>
            {/* Overall Estimation Accuracy */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{overallAccuracy.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Overall Accuracy</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <BarChart3 className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{averageVariance.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Avg Variance</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{underEstimated}</p>
                <p className="text-sm text-muted-foreground">Under-estimated</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <TrendingDown className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{overEstimated}</p>
                <p className="text-sm text-muted-foreground">Over-estimated</p>
              </div>
            </div>

            {/* Accuracy Distribution */}
            <div>
              <h4 className="text-sm font-medium mb-3">Estimation Accuracy Distribution</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm">Accurate (±20%)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${(accurate / estimationData.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{accurate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm">Under-estimated</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-red-500"
                          style={{ width: `${(underEstimated / estimationData.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{underEstimated}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-4 w-4 text-blue-500" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm">Over-estimated</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(overEstimated / estimationData.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{overEstimated}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Task Analysis */}
            <div>
              <h4 className="text-sm font-medium mb-3">Individual Task Analysis</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {estimationData.slice(0, 8).map((item) => (
                  <div key={item.nodeId} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className="font-medium text-sm">{item.nodeTitle}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(item.status)}`}
                      >
                        {item.status === 'accurate' ? 'Accurate' : 
                         item.status === 'over' ? 'Over-ran' : 'Under-ran'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Estimated</p>
                        <p className="font-medium">{formatDuration(item.estimatedTime)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Actual</p>
                        <p className="font-medium">{formatDuration(item.actualTime)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Accuracy</span>
                          <span className="font-medium">{item.accuracy.toFixed(0)}%</span>
                        </div>
                        <Progress value={item.accuracy} className="h-1" />
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-xs text-muted-foreground">Variance</p>
                        <p className={`text-xs font-medium ${getVarianceColor(item.variance)}`}>
                          {item.variance > 0 ? '+' : ''}{item.variance.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights and Recommendations */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Estimation Insights</h4>
              
              {overallAccuracy >= 80 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">Excellent Estimation Skills!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your time estimates are highly accurate with {overallAccuracy.toFixed(0)}% accuracy.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {underEstimated > estimationData.length * 0.6 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">Consistent Under-estimation Pattern</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You tend to under-estimate task duration. Consider adding buffer time or breaking down complex tasks.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {overEstimated > estimationData.length * 0.6 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">Consistent Over-estimation Pattern</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You tend to over-estimate task duration. You might be more efficient than you think!
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {averageVariance > 50 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">High Estimation Variance</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your estimates vary significantly from actual time. Consider tracking time more closely to improve accuracy.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Improvement Recommendations */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Recommendations for Better Estimation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Break down large tasks into smaller, more predictable chunks</li>
                <li>• Track actual time spent to build historical data</li>
                <li>• Add buffer time for unexpected complications</li>
                <li>• Review past similar tasks for reference</li>
                <li>• Consider your energy levels and focus time when estimating</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}