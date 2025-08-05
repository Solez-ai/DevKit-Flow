
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Brain, 
  Clock, 
  Eye, 
  RotateCcw,
  Info
} from 'lucide-react'
import type { ComplexitySettings, ComplexityFactor } from '@/types'
import { useComplexityEstimation } from '@/hooks/use-complexity-estimation'
import { DEFAULT_COMPLEXITY_SETTINGS } from '@/lib/complexity-estimation'

interface ComplexitySettingsProps {
  className?: string
}

export function ComplexitySettingsComponent({ className }: ComplexitySettingsProps) {
  const { settings, updateSettings } = useComplexityEstimation()

  const handleSettingChange = (key: keyof ComplexitySettings, value: any) => {
    updateSettings({ [key]: value })
  }

  const handleFactorWeightChange = (factorId: string, weight: number) => {
    const updatedFactors = settings.complexityFactors.map(factor =>
      factor.id === factorId ? { ...factor, weight } : factor
    )
    updateSettings({ complexityFactors: updatedFactors })
  }

  const resetToDefaults = () => {
    updateSettings(DEFAULT_COMPLEXITY_SETTINGS)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Complexity Settings
        </CardTitle>
        <CardDescription>
          Configure complexity estimation and analysis preferences
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* General Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">General</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Estimation</Label>
              <div className="text-sm text-muted-foreground">
                Automatically estimate complexity for new nodes
              </div>
            </div>
            <Switch
              checked={settings.enableAutoEstimation}
              onCheckedChange={(checked) => handleSettingChange('enableAutoEstimation', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Default Estimation Method</Label>
            <Select
              value={settings.defaultEstimationMethod}
              onValueChange={(value) => handleSettingChange('defaultEstimationMethod', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="story-points">Story Points</SelectItem>
                <SelectItem value="time-based">Time Based</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Story Point to Hours Ratio</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.storyPointToHoursRatio]}
                onValueChange={([value]) => handleSettingChange('storyPointToHoursRatio', value)}
                min={1}
                max={8}
                step={0.5}
                className="flex-1"
              />
              <Badge variant="outline" className="min-w-[60px] justify-center">
                {settings.storyPointToHoursRatio}h
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              How many hours each story point represents
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Track Estimation Accuracy</Label>
              <div className="text-sm text-muted-foreground">
                Compare estimates with actual time spent
              </div>
            </div>
            <Switch
              checked={settings.trackEstimationAccuracy}
              onCheckedChange={(checked) => handleSettingChange('trackEstimationAccuracy', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* AI Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Assistance
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable AI Assistance</Label>
              <div className="text-sm text-muted-foreground">
                Use AI to improve complexity estimation accuracy
              </div>
            </div>
            <Switch
              checked={settings.enableAIAssistance}
              onCheckedChange={(checked) => handleSettingChange('enableAIAssistance', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Visualization Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visualization
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Complexity Heatmap</Label>
              <div className="text-sm text-muted-foreground">
                Display complexity overlay on canvas
              </div>
            </div>
            <Switch
              checked={settings.showHeatmap}
              onCheckedChange={(checked) => handleSettingChange('showHeatmap', checked)}
            />
          </div>

          {settings.showHeatmap && (
            <div className="space-y-2">
              <Label>Heatmap Opacity</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[settings.heatmapOpacity]}
                  onValueChange={([value]) => handleSettingChange('heatmapOpacity', value)}
                  min={0.1}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
                <Badge variant="outline" className="min-w-[50px] justify-center">
                  {Math.round(settings.heatmapOpacity * 100)}%
                </Badge>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Complexity Factors */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Complexity Factors</h3>
          <div className="text-sm text-muted-foreground">
            Adjust the weight of different factors in complexity calculation
          </div>
          
          <div className="space-y-3">
            {settings.complexityFactors.map((factor) => (
              <ComplexityFactorSetting
                key={factor.id}
                factor={factor}
                onWeightChange={(weight) => handleFactorWeightChange(factor.id, weight)}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Reset Settings */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Reset to Defaults</Label>
            <div className="text-sm text-muted-foreground">
              Restore all settings to their default values
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface ComplexityFactorSettingProps {
  factor: ComplexityFactor
  onWeightChange: (weight: number) => void
}

function ComplexityFactorSetting({ factor, onWeightChange }: ComplexityFactorSettingProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return <Brain className="h-3 w-3" />
      case 'scope':
        return <Clock className="h-3 w-3" />
      default:
        return <Info className="h-3 w-3" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'text-blue-600'
      case 'scope':
        return 'text-green-600'
      case 'dependencies':
        return 'text-orange-600'
      case 'uncertainty':
        return 'text-purple-600'
      case 'integration':
        return 'text-red-600'
      case 'testing':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={getCategoryColor(factor.category)}>
            {getCategoryIcon(factor.category)}
          </div>
          <div>
            <div className="text-sm font-medium">{factor.name}</div>
            <div className="text-xs text-muted-foreground">{factor.description}</div>
          </div>
        </div>
        <Badge variant="outline" className="min-w-[50px] justify-center">
          {Math.round(factor.weight * 100)}%
        </Badge>
      </div>
      
      <Slider
        value={[factor.weight]}
        onValueChange={([value]) => onWeightChange(value)}
        min={0}
        max={1}
        step={0.05}
        className="w-full"
      />
    </div>
  )
}

export default ComplexitySettingsComponent