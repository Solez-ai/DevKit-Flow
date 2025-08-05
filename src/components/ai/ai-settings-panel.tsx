import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Bot, Key, Settings, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAIConfig } from '@/hooks/use-app-store'
import { useAIService } from '@/hooks/use-ai-service'
import { AIStatusBadge } from './ai-status-indicator'

/**
 * AI Settings Panel Component
 * Allows users to configure Claude MCP integration
 */
export function AISettingsPanel() {
  const { aiConfig, updateAIConfig } = useAIConfig()
  const { isAvailable, isFallbackMode, error, clearError, disableFallbackMode } = useAIService()
  
  const [apiKey, setApiKey] = useState(aiConfig.apiKey || '')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionTestResult, setConnectionTestResult] = useState<'success' | 'error' | null>(null)

  const handleToggleAI = (enabled: boolean) => {
    updateAIConfig({ isEnabled: enabled })
    if (!enabled) {
      clearError()
      setConnectionTestResult(null)
    }
  }

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    setConnectionTestResult(null)
  }

  const handleSaveApiKey = () => {
    updateAIConfig({ apiKey: apiKey.trim() })
    setConnectionTestResult(null)
  }

  const handleModelChange = (model: string) => {
    updateAIConfig({ model })
  }

  const handleRateLimitChange = (field: string, value: number) => {
    updateAIConfig({
      rateLimiting: {
        ...aiConfig.rateLimiting,
        [field]: value
      }
    })
  }

  const testConnection = async () => {
    if (!apiKey.trim()) {
      setConnectionTestResult('error')
      return
    }

    setIsTestingConnection(true)
    setConnectionTestResult(null)
    clearError()

    try {
      // Save API key first
      updateAIConfig({ apiKey: apiKey.trim(), isEnabled: true })
      
      // Try to disable fallback mode (this will test the connection)
      await disableFallbackMode()
      setConnectionTestResult('success')
    } catch (err) {
      setConnectionTestResult('error')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const availableModels = [
    { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku (Fast & Affordable)' },
    { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet (Balanced)' },
    { value: 'anthropic/claude-3-opus', label: 'Claude 3 Opus (Most Capable)' },
    { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Latest)' }
  ]

  return (
    <div className="space-y-6">
      {/* AI Service Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <CardTitle>AI Service Status</CardTitle>
            </div>
            <AIStatusBadge />
          </div>
          <CardDescription>
            Current status of Claude MCP integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error.message}
                {error.retryAfter && (
                  <span className="block text-sm mt-1">
                    Retry after {Math.ceil(error.retryAfter / 1000)} seconds
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {isFallbackMode && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Currently in offline mode. AI features are disabled.
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-2"
                  onClick={disableFallbackMode}
                >
                  Try reconnecting
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>AI Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure Claude MCP integration for AI-powered assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable/Disable AI */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable AI Features</Label>
              <p className="text-sm text-muted-foreground">
                Turn on AI-powered code assistance, regex generation, and debugging help
              </p>
            </div>
            <Switch
              checked={aiConfig.isEnabled}
              onCheckedChange={handleToggleAI}
            />
          </div>

          <Separator />

          {/* API Key Configuration */}
          <div className="space-y-2">
            <Label htmlFor="api-key" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>OpenRouter API Key</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                id="api-key"
                type="password"
                placeholder="sk-or-..."
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                disabled={!aiConfig.isEnabled}
              />
              <Button 
                onClick={handleSaveApiKey}
                disabled={!aiConfig.isEnabled || !apiKey.trim()}
                variant="outline"
              >
                Save
              </Button>
              <Button
                onClick={testConnection}
                disabled={!aiConfig.isEnabled || !apiKey.trim() || isTestingConnection}
                variant="outline"
              >
                {isTestingConnection ? 'Testing...' : 'Test'}
              </Button>
            </div>
            
            {connectionTestResult && (
              <div className="flex items-center space-x-2 text-sm">
                {connectionTestResult === 'success' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Connection successful!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">Connection failed. Check your API key.</span>
                  </>
                )}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                OpenRouter
              </a>
              . Your key is stored locally and never shared.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label>AI Model</Label>
            <Select
              value={aiConfig.model}
              onValueChange={handleModelChange}
              disabled={!aiConfig.isEnabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the AI model that best fits your needs and budget
            </p>
          </div>

          <Separator />

          {/* Rate Limiting */}
          <div className="space-y-4">
            <Label>Rate Limiting</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requests-per-minute" className="text-sm">
                  Requests per minute
                </Label>
                <Input
                  id="requests-per-minute"
                  type="number"
                  min="1"
                  max="100"
                  value={aiConfig.rateLimiting.requestsPerMinute}
                  onChange={(e) => handleRateLimitChange('requestsPerMinute', parseInt(e.target.value) || 20)}
                  disabled={!aiConfig.isEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cooldown-period" className="text-sm">
                  Cooldown (seconds)
                </Label>
                <Input
                  id="cooldown-period"
                  type="number"
                  min="1"
                  max="300"
                  value={aiConfig.rateLimiting.cooldownPeriod}
                  onChange={(e) => handleRateLimitChange('cooldownPeriod', parseInt(e.target.value) || 60)}
                  disabled={!aiConfig.isEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-concurrent" className="text-sm">
                  Max concurrent
                </Label>
                <Input
                  id="max-concurrent"
                  type="number"
                  min="1"
                  max="10"
                  value={aiConfig.rateLimiting.maxConcurrentRequests}
                  onChange={(e) => handleRateLimitChange('maxConcurrentRequests', parseInt(e.target.value) || 3)}
                  disabled={!aiConfig.isEnabled}
                />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Configure rate limits to stay within your API quota and avoid service interruptions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Your API key is stored locally in your browser and never transmitted to our servers</p>
            <p>• AI requests are sent directly to OpenRouter/Claude with your API key</p>
            <p>• No conversation data is stored or logged by DevKit Flow</p>
            <p>• You can disable AI features at any time to work completely offline</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}