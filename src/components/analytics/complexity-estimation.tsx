
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { 
  Brain, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Zap,
  Info
} from 'lucide-react'
import type { 
  DevFlowSession, 
  ComplexityAnalysis, 
  ComplexityLevel,
  ComplexityRecommendation 
} from '@/types'
import { useComplexityEstimation, useComplexityAnalysis } from '@/hooks/use-complexity-estimation'

interface ComplexityEstimationProps {
  session: DevFlowSession
  className?: string
}

export function ComplexityEstimation({ session, className }: ComplexityEstimationProps) {
  const { analysis, isAnalyzing } = useComplexityAnalysis(session)
  const { getComplexityColor, getComplexityLabel, formatEstimationTime } = useComplexityEstimation()

  if (isAnalyzing) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Complexity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Analyzing complexity...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Complexity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No analysis available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Complexity Analysis
        </CardTitle>
        <CardDescription>
          Analyze task complexity and estimation accuracy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
            <TabsTrigger value="recommendations">Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ComplexityOverview analysis={analysis} />
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <ComplexityDistribution 
              analysis={analysis} 
              getComplexityColor={getComplexityColor}
              getComplexityLabel={getComplexityLabel}
            />
          </TabsContent>

          <TabsContent value="accuracy" className="space-y-4">
            <EstimationAccuracy 
              analysis={analysis} 
              formatEstimationTime={formatEstimationTime}
            />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <ComplexityRecommendations recommendations={analysis.recommendations} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface ComplexityOverviewProps {
  analysis: ComplexityAnalysis
}

function ComplexityOverview({ analysis }: ComplexityOverviewProps) {
  const totalStoryPoints = Object.entries(analysis.complexityDistribution)
    .reduce((total, [level, count]) => total + (parseInt(level) as ComplexityLevel) * count, 0)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Total Nodes</span>
        </div>
        <div className="text-2xl font-bold">{analysis.totalNodes}</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Avg Complexity</span>
        </div>
        <div className="text-2xl font-bold">{analysis.averageComplexity.toFixed(1)}</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">Story Points</span>
        </div>
        <div className="text-2xl font-bold">{totalStoryPoints}</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium">High Complexity</span>
        </div>
        <div className="text-2xl font-bold">{analysis.highComplexityNodes.length}</div>
      </div>
    </div>
  )
}

interface ComplexityDistributionProps {
  analysis: ComplexityAnalysis
  getComplexityColor: (level: ComplexityLevel) => string
  getComplexityLabel: (level: ComplexityLevel) => string
}

function ComplexityDistribution({ 
  analysis, 
  getComplexityColor, 
  getComplexityLabel 
}: ComplexityDistributionProps) {
  const distributionData = Object.entries(analysis.complexityDistribution)
    .map(([level, count]) => ({
      level: parseInt(level) as ComplexityLevel,
      count,
      label: getComplexityLabel(parseInt(level) as ComplexityLevel),
      color: getComplexityColor(parseInt(level) as ComplexityLevel)
    }))
    .filter(item => item.count > 0)

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distributionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8">
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {distributionData.map((item) => (
          <div key={item.level} className="text-center">
            <Badge 
              variant="outline" 
              style={{ backgroundColor: item.color, color: 'white' }}
            >
              {item.label}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">
              {item.count} nodes
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface EstimationAccuracyProps {
  analysis: ComplexityAnalysis
  formatEstimationTime: (hours: number) => string
}

function EstimationAccuracy({ analysis }: EstimationAccuracyProps) {
  const { estimationAccuracy } = analysis

  if (estimationAccuracy.totalEstimations === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No completed tasks with time tracking yet.
          <br />
          Complete some tasks to see estimation accuracy.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Accuracy</span>
          </div>
          <div className="text-2xl font-bold">
            {estimationAccuracy.accuracyPercentage.toFixed(1)}%
          </div>
          <Progress value={estimationAccuracy.accuracyPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold">{estimationAccuracy.totalEstimations}</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Over</span>
          </div>
          <div className="text-2xl font-bold">{estimationAccuracy.overestimations}</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500 rotate-180" />
            <span className="text-sm font-medium">Under</span>
          </div>
          <div className="text-2xl font-bold">{estimationAccuracy.underestimations}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Average Variance</span>
        </div>
        <div className="text-lg">
          {(estimationAccuracy.averageVariance * 100).toFixed(1)}%
        </div>
        <p className="text-sm text-muted-foreground">
          Your estimates are typically off by this percentage
        </p>
      </div>
    </div>
  )
}

interface ComplexityRecommendationsProps {
  recommendations: ComplexityRecommendation[]
}

function ComplexityRecommendations({ recommendations }: ComplexityRecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-muted-foreground">
          Great job! No complexity issues detected.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation, index) => (
        <RecommendationCard key={index} recommendation={recommendation} />
      ))}
    </div>
  )
}

interface RecommendationCardProps {
  recommendation: ComplexityRecommendation
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const getIcon = () => {
    switch (recommendation.type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'suggestion':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'insight':
        return <Brain className="h-4 w-4 text-purple-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'high':
        return 'border-red-200 bg-red-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      case 'low':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className={`p-4 rounded-lg border ${getPriorityColor()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{recommendation.title}</h4>
            <Badge variant="outline" className="text-xs">
              {recommendation.priority}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {recommendation.description}
          </p>
          {recommendation.actionable && (
            <Button size="sm" variant="outline">
              Take Action
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComplexityEstimation