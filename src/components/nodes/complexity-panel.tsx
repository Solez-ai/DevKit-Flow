import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  Clock, 
  RefreshCw, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import type { 
  DevFlowNode, 
  DevFlowSession, 
  ComplexityEstimate, 
  ComplexityLevel,
  ComplexityFactor 
} from '@/types'
import { useComplexityEstimation } from '@/hooks/use-complexity-estimation'

interface ComplexityPanelProps {
  node: DevFlowNode
  session: DevFlowSession
  onUpdate: (node: DevFlowNode, complexity: ComplexityEstimate) => void
  className?: string
}

export function ComplexityPanel({ node, session, onUpdate, className }: ComplexityPanelProps) {
  const { 
    estimateNodeComplexity, 
    updateNodeComplexity, 
    getComplexityColor, 
    getComplexityLabel,
    formatEstimationTime,
    isEstimating
  } = useComplexityEstimation()

  const [isEditing, setIsEditing] = useState(false)
  const [editedComplexity, setEditedComplexity] = useState<ComplexityEstimate | null>(null)

  const currentComplexity = node.complexity || estimateNodeComplexity(node, session)

  const handleAutoEstimate = () => {
    const newComplexity = estimateNodeComplexity(node, session)
    onUpdate(node, newComplexity)
  }

  const handleManualUpdate = (storyPoints: ComplexityLevel) => {
    const updates = { storyPoints, estimatedBy: 'user' as const }
    const newComplexity = updateNodeComplexity(node, updates)
    setEditedComplexity(newComplexity)
  }

  const handleSaveChanges = () => {
    if (editedComplexity) {
      onUpdate(node, editedComplexity)
      setIsEditing(false)
      setEditedComplexity(null)
    }
  }

  const handleCancelChanges = () => {
    setIsEditing(false)
    setEditedComplexity(null)
  }

  const displayComplexity = editedComplexity || currentComplexity

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Complexity
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAutoEstimate}
              disabled={isEstimating}
            >
              {isEstimating ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Re-estimate
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Complexity estimation and time tracking
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Complexity Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: getComplexityColor(displayComplexity.storyPoints) }}
            >
              {displayComplexity.storyPoints}
            </div>
            <div>
              <div className="font-medium">
                {getComplexityLabel(displayComplexity.storyPoints)}
              </div>
              <div className="text-sm text-muted-foreground">
                {displayComplexity.estimatedHours && formatEstimationTime(displayComplexity.estimatedHours)}
              </div>
            </div>
          </div>
          <Badge variant="outline">
            {Math.round(displayComplexity.confidence * 100)}% confidence
          </Badge>
        </div>

        {/* Manual Adjustment */}
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Story Points</Label>
              <Input
                type="range"
                value={editedComplexity?.storyPoints || displayComplexity.storyPoints}
                onChange={(e) => handleManualUpdate(Number(e.target.value) as ComplexityLevel)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Simple</span>
                <span>Very Complex</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add notes about this complexity estimation..."
                value={editedComplexity?.notes || ''}
                onChange={(e) => setEditedComplexity(prev => prev ? { ...prev, notes: e.target.value } : null)}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveChanges}>
                Save Changes
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelChanges}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsEditing(true)}
            className="w-full"
          >
            Adjust Manually
          </Button>
        )}

        <Separator />

        {/* Complexity Factors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Complexity Factors
          </h4>
          <div className="space-y-2">
            {displayComplexity.factors.map((factor) => (
              <ComplexityFactorItem key={factor.id} factor={factor} />
            ))}
          </div>
        </div>

        {/* Time Tracking */}
        {node.timeEstimate && (
          <>
            <Separator />
            <TimeTrackingSection 
              timeEstimate={node.timeEstimate}
              complexity={displayComplexity}
            />
          </>
        )}

        {/* Estimation Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Info className="h-3 w-3" />
            <span>
              Estimated by {displayComplexity.estimatedBy} on{' '}
              {displayComplexity.estimatedAt.toLocaleDateString()}
            </span>
          </div>
          {displayComplexity.notes && (
            <div className="pl-5">
              {displayComplexity.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ComplexityFactorItemProps {
  factor: ComplexityFactor
}

function ComplexityFactorItem({ factor }: ComplexityFactorItemProps) {
  const getFactorColor = (value: number) => {
    if (value <= 0.3) return 'text-green-600'
    if (value <= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getFactorIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return <Brain className="h-3 w-3" />
      case 'scope':
        return <TrendingUp className="h-3 w-3" />
      case 'dependencies':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Info className="h-3 w-3" />
    }
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {getFactorIcon(factor.category)}
        <span>{factor.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`font-medium ${getFactorColor(factor.value)}`}>
          {Math.round(factor.value * 100)}%
        </div>
        <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-current transition-all duration-300"
            style={{ 
              width: `${factor.value * 100}%`,
              backgroundColor: factor.value <= 0.3 ? '#22c55e' : factor.value <= 0.6 ? '#eab308' : '#ef4444'
            }}
          />
        </div>
      </div>
    </div>
  )
}

interface TimeTrackingSectionProps {
  timeEstimate: any
  complexity: ComplexityEstimate
}

function TimeTrackingSection({ timeEstimate, complexity }: TimeTrackingSectionProps) {
  const isCompleted = timeEstimate.actual !== undefined
  const variance = isCompleted 
    ? ((timeEstimate.actual - timeEstimate.estimated) / timeEstimate.estimated) * 100
    : 0

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Time Tracking
      </h4>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Estimated</div>
          <div className="font-medium">
            {complexity.estimatedHours ? `${complexity.estimatedHours}h` : 'N/A'}
          </div>
        </div>
        
        {isCompleted && (
          <div>
            <div className="text-muted-foreground">Actual</div>
            <div className="font-medium">
              {timeEstimate.actual}h
            </div>
          </div>
        )}
      </div>

      {isCompleted && (
        <div className="flex items-center gap-2">
          {Math.abs(variance) <= 20 ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
          <span className="text-sm">
            {variance > 0 ? '+' : ''}{variance.toFixed(1)}% variance
          </span>
        </div>
      )}
    </div>
  )
}

export default ComplexityPanel