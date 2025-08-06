import React, { useState } from 'react'
import { Bot, Key, Zap, BarChart3, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react'
import { useSettingsStore } from '../../../store/settings-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Label } from '../../ui/label'
import { Switch } from '../../ui/switch'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Separator } from '../../ui/separator'
import { Slider } from '../../ui/slider'
import { Progress } from '../../ui/progress'
import { Alert, AlertDescription } from '../../ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible'
import { AIModel } from '../../../types/settings'

const availableModels: AIModel[] = [
  {
    id: 'kimi-k2-free',
    name: 'Kimi K2 (Free)',
    provider: 'Moonshot AI',
    description: 'Free tier with basic AI assistance',
    isAvailable: true,
    requiresApiKey: false,
    features: ['Code assistance', 'Regex generation', 'Basic debugging'],
    pricing: 'free'
  },
  {
    id: 'kimi-k2-premium',
    name: 'Kimi K2 (Premium)',
    provider: 'Moonshot AI',
    description: 'Premium tier with advanced features',
    isAvailable: true,
    requiresApiKey: true,
    features: ['Advanced code assistance', 'Architecture planning', 'Code refactoring'],
    pricing: 'premium'
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    description: 'Latest GPT model with enhanced capabilities',
    isAvailable: true,
    requiresApiKey: true,
    features: ['Advanced reasoning', 'Code generation', 'Complex problem solving'],
    pricing: 'usage-based'
  },
  {
    id: 'qwen3-30b',
    name: 'Qwen3 30B',
    provider: 'Alibaba',
    description: 'Large language model optimized for coding',
    isAvailable: true,
    requiresApiKey: true,
    features: ['Code completion', 'Documentation', 'Code review'],
    pricing: 'usage-based'
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    description: 'Advanced AI with strong reasoning capabilities',
    isAvailable: true,
    requiresApiKey: true,
    features: ['Complex analysis', 'Code architecture', 'Advanced debugging'],
    pricing: 'usage-based'
  },
  {
    id: 'grok-4',
    name: 'Grok 4',
    provider: 'xAI',
    description: 'Real-time AI with web access',
    isAvailable: true,
    requiresApiKey: true,
    features: ['Real-time data', 'Web search', 'Current information'],
    pricing: 'premium'
  }
]

export const AIModelSettings: React.FC = () => {
  const { settings, aiConfig, updateSetting, updateAIConfig } = useSettingsStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(aiConfig.customApiKey || '')

  const selectedModel = availableModels.find(m => m.id === aiConfig.selectedModel)
  const usagePercentage = Math.min((aiConfig.usageStats.totalRequests / 1000) * 100, 100)

  const handleModelSelect = (modelId: string) => {
    updateAIConfig({ selectedModel: modelId })
  }

  const handleApiKeySave = () => {
    updateAIConfig({ customApiKey: apiKeyInput })
  }

  const handleRateLimitChange = (field: string, value: any) => {
    updateAIConfig({
      rateLimiting: {
        ...aiConfig.rateLimiting,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* AI Features Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <CardDescription>
            Configure AI-powered features and model selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable AI Features</Label>
              <div className="text-sm text-muted-foreground">
                Turn on AI-powered assistance across the application
              </div>
            </div>
            <Switch
              checked={settings.aiEnabled}
              onCheckedChange={(checked) => updateSetting('aiEnabled', checked)}
            />
          </div>
          
          {settings.aiEnabled && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enhanced Features</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable advanced AI features like architecture planning
                  </div>
                </div>
                <Switch
                  checked={settings.enhancedFeatures}
                  onCheckedChange={(checked) => updateSetting('enhancedFeatures', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {settings.aiEnabled && (
        <>
          {/* Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Model Selection</CardTitle>
              <CardDescription>
                Choose your preferred AI model for assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {availableModels.map((model) => (
                  <div
                    key={model.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      aiConfig.selectedModel === model.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleModelSelect(model.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{model.name}</h4>
                          <Badge 
                            variant={model.pricing === 'free' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {model.pricing}
                          </Badge>
                          {model.requiresApiKey && (
                            <Badge variant="outline" className="text-xs">
                              <Key className="h-3 w-3 mr-1" />
                              API Key
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {model.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {model.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {aiConfig.selectedModel === model.id && (
                        <div className="h-4 w-4 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Key Configuration */}
          {selectedModel?.requiresApiKey && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Key Configuration
                </CardTitle>
                <CardDescription>
                  Configure your API key for {selectedModel.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your API key is stored locally and never sent to our servers. 
                    It's only used to communicate directly with the AI provider.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Enter your API key..."
                      className="flex-1"
                    />
                    <Button onClick={handleApiKeySave}>
                      Save
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Get your API key from the {selectedModel.provider} dashboard
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Settings */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Advanced Settings
                    </span>
                    {showAdvanced ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Configure rate limiting and advanced AI behavior
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {/* Rate Limiting */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Rate Limiting</Label>
                        <div className="text-sm text-muted-foreground">
                          Control AI request frequency to manage costs
                        </div>
                      </div>
                      <Switch
                        checked={aiConfig.rateLimiting.enabled}
                        onCheckedChange={(checked) => handleRateLimitChange('enabled', checked)}
                      />
                    </div>
                    
                    {aiConfig.rateLimiting.enabled && (
                      <div className="space-y-4 pl-4 border-l-2 border-muted">
                        <div className="space-y-2">
                          <Label>Requests per minute: {aiConfig.rateLimiting.requestsPerMinute}</Label>
                          <Slider
                            value={[aiConfig.rateLimiting.requestsPerMinute]}
                            onValueChange={([value]) => handleRateLimitChange('requestsPerMinute', value)}
                            min={1}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>1</span>
                            <span>100</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Burst allowance: {aiConfig.rateLimiting.burstAllowance}</Label>
                          <Slider
                            value={[aiConfig.rateLimiting.burstAllowance]}
                            onValueChange={([value]) => handleRateLimitChange('burstAllowance', value)}
                            min={1}
                            max={20}
                            step={1}
                            className="w-full"
                          />
                          <div className="text-sm text-muted-foreground">
                            Allow short bursts of requests above the rate limit
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Priority Queue</Label>
                            <div className="text-sm text-muted-foreground">
                              Prioritize important requests when rate limited
                            </div>
                          </div>
                          <Switch
                            checked={aiConfig.rateLimiting.priorityQueue}
                            onCheckedChange={(checked) => handleRateLimitChange('priorityQueue', checked)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Usage Statistics
              </CardTitle>
              <CardDescription>
                Monitor your AI usage and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {aiConfig.usageStats.totalRequests}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Requests
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    {aiConfig.usageStats.successfulRequests}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Successful
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-red-600">
                    {aiConfig.usageStats.failedRequests}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Failed
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {aiConfig.usageStats.averageResponseTime}ms
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Response
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Usage</span>
                  <span>{Math.round(usagePercentage)}% of limit</span>
                </div>
                <Progress value={usagePercentage} className="w-full" />
                <div className="text-xs text-muted-foreground">
                  Based on estimated monthly limits for your selected model
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}