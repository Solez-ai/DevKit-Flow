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
import type { AIModel } from '../../../types/settings'

const availableModels: AIModel[] = [
  {
    id: 'kimi-k2-free',
    name: 'Kimi K2 (Free)',
    provider: 'Moonshot AI',
    description: 'Free tier with basic AI assistance',
    logo: '🌙',
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
    logo: '🌙',
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
    logo: '🤖',
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
    logo: '🔷',
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
    logo: '🎭',
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
    logo: '⚡',
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

  // Check model availability based on API key presence
  const getModelAvailability = (model: AIModel) => {
    if (!model.requiresApiKey) return true
    return Boolean(aiConfig.customApiKey)
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
                {availableModels.map((model) => {
                  const isAvailable = getModelAvailability(model)
                  return (
                    <div
                      key={model.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        isAvailable 
                          ? `cursor-pointer ${
                              aiConfig.selectedModel === model.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`
                          : 'cursor-not-allowed opacity-60 border-muted'
                      }`}
                      onClick={() => isAvailable && handleModelSelect(model.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {model.logo && (
                              <span className="text-lg">{model.logo}</span>
                            )}
                            <h4 className="font-medium">{model.name}</h4>
                            <Badge 
                              variant={model.pricing === 'free' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {model.pricing}
                            </Badge>
                            {model.requiresApiKey && (
                              <Badge 
                                variant={isAvailable ? "outline" : "destructive"} 
                                className="text-xs"
                              >
                                <Key className="h-3 w-3 mr-1" />
                                {isAvailable ? "API Key" : "API Key Required"}
                              </Badge>
                            )}
                            {!isAvailable && (
                              <Badge variant="secondary" className="text-xs">
                                Unavailable
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
                        <div className="flex flex-col items-end gap-2">
                          {aiConfig.selectedModel === model.id && isAvailable && (
                            <div className="h-4 w-4 rounded-full bg-primary" />
                          )}
                          {model.provider && (
                            <div className="text-xs text-muted-foreground">
                              {model.provider}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
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
                    <strong>Secure Storage:</strong> Your API key is encrypted and stored locally in your browser. 
                    It's never transmitted to our servers and is only used for direct communication with {selectedModel.provider}.
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
            <Card className="border-2 border-dashed border-muted-foreground/20">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      Advanced Settings
                      <Badge variant="outline" className="text-xs">
                        {showAdvanced ? 'Expanded' : 'Collapsed'}
                      </Badge>
                    </span>
                    {showAdvanced ? (
                      <ChevronDown className="h-4 w-4 text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Configure rate limiting, API behavior, and advanced AI settings
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
                Usage Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Real-time monitoring of AI usage, performance, and rate limiting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {aiConfig.usageStats.totalRequests}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Requests
                  </div>
                  <Progress 
                    value={(aiConfig.usageStats.totalRequests / 1000) * 100} 
                    className="h-2" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {aiConfig.usageStats.successfulRequests}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Successful
                  </div>
                  <Progress 
                    value={aiConfig.usageStats.totalRequests > 0 
                      ? (aiConfig.usageStats.successfulRequests / aiConfig.usageStats.totalRequests) * 100 
                      : 0
                    } 
                    className="h-2" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-red-600">
                    {aiConfig.usageStats.failedRequests}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Failed
                  </div>
                  <Progress 
                    value={aiConfig.usageStats.totalRequests > 0 
                      ? (aiConfig.usageStats.failedRequests / aiConfig.usageStats.totalRequests) * 100 
                      : 0
                    } 
                    className="h-2" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {aiConfig.usageStats.averageResponseTime}ms
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Response
                  </div>
                  <Progress 
                    value={Math.min((aiConfig.usageStats.averageResponseTime / 5000) * 100, 100)} 
                    className="h-2" 
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Rate Limiting Status */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Rate Limiting Status
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Rate Limit</span>
                      <span>{aiConfig.rateLimiting.requestsPerMinute}/min</span>
                    </div>
                    <Progress 
                      value={(aiConfig.rateLimiting.requestsPerMinute / 100) * 100} 
                      className="w-full" 
                    />
                    <div className="text-xs text-muted-foreground">
                      {aiConfig.rateLimiting.enabled ? 'Rate limiting enabled' : 'Rate limiting disabled'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Burst Allowance</span>
                      <span>{aiConfig.rateLimiting.burstAllowance} requests</span>
                    </div>
                    <Progress 
                      value={(aiConfig.rateLimiting.burstAllowance / 20) * 100} 
                      className="w-full" 
                    />
                    <div className="text-xs text-muted-foreground">
                      {aiConfig.rateLimiting.priorityQueue ? 'Priority queue enabled' : 'Priority queue disabled'}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Success Rate and Performance */}
              <div className="space-y-4">
                <h4 className="font-medium">Performance Metrics</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>
                        {aiConfig.usageStats.totalRequests > 0 
                          ? Math.round((aiConfig.usageStats.successfulRequests / aiConfig.usageStats.totalRequests) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                    <Progress 
                      value={aiConfig.usageStats.totalRequests > 0 
                        ? (aiConfig.usageStats.successfulRequests / aiConfig.usageStats.totalRequests) * 100 
                        : 0
                      } 
                      className="w-full" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span>{aiConfig.usageStats.averageResponseTime}ms</span>
                    </div>
                    <Progress 
                      value={100 - Math.min((aiConfig.usageStats.averageResponseTime / 5000) * 100, 100)} 
                      className="w-full" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Usage</span>
                      <span>{Math.round(usagePercentage)}%</span>
                    </div>
                    <Progress value={usagePercentage} className="w-full" />
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(aiConfig.usageStats.lastUsed).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}