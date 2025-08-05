import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Play,
  RotateCcw,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { 
  AIFallbackNotification,
  AIServiceRecovery,
  AIServiceDiagnostics,
  AIStatusIndicator,
  AIStatusToastManager,
  useAIStatusToasts
} from '@/components/ai'
import { useAIService } from '@/hooks/use-ai-service'

/**
 * AI Fallback and Graceful Degradation Demo Component
 * Demonstrates all the fallback and recovery features
 */
export function AIFallbackDemo() {
  const { 
    isAvailable, 
    isFallbackMode, 
    error, 
    enableFallbackMode, 
    disableFallbackMode,
    generateCode,
    clearError
  } = useAIService()
  
  const toasts = useAIStatusToasts()
  const [demoState, setDemoState] = useState<'idle' | 'running' | 'completed'>('idle')
  const [demoResults, setDemoResults] = useState<string[]>([])

  const simulateNetworkFailure = () => {
    enableFallbackMode()
    toasts.showNetworkErrorToast()
    addDemoResult('❌ Simulated network failure - AI service disabled')
  }

  const simulateRateLimit = () => {
    toasts.showRateLimitToast(30000) // 30 seconds
    addDemoResult('⚠️ Simulated rate limit - requests throttled')
  }

  const simulateApiKeyError = () => {
    toasts.showApiKeyErrorToast()
    addDemoResult('🔑 Simulated API key error - authentication failed')
  }

  const simulateRecovery = async () => {
    try {
      await disableFallbackMode()
      toasts.showRecoverySuccessToast()
      addDemoResult('✅ Service recovery successful - AI features restored')
    } catch (err) {
      addDemoResult('❌ Recovery failed - remaining in offline mode')
    }
  }

  const testAIRequest = async () => {
    try {
      const response = await generateCode('Create a simple hello world function')
      if (response) {
        addDemoResult('✅ AI request successful: ' + response.content.substring(0, 50) + '...')
      }
    } catch (err: any) {
      addDemoResult('❌ AI request failed: ' + err.message)
    }
  }

  const runFullDemo = async () => {
    setDemoState('running')
    setDemoResults([])
    
    addDemoResult('🚀 Starting AI fallback demonstration...')
    await delay(1000)
    
    addDemoResult('📡 Testing normal AI operation...')
    await testAIRequest()
    await delay(1500)
    
    addDemoResult('⚠️ Simulating network issues...')
    simulateNetworkFailure()
    await delay(1500)
    
    addDemoResult('🔄 Attempting AI request in offline mode...')
    await testAIRequest()
    await delay(1500)
    
    addDemoResult('🛠️ Attempting service recovery...')
    await simulateRecovery()
    await delay(1500)
    
    addDemoResult('✅ Testing AI operation after recovery...')
    await testAIRequest()
    await delay(1000)
    
    addDemoResult('🎉 Demo completed successfully!')
    setDemoState('completed')
  }

  const resetDemo = () => {
    setDemoState('idle')
    setDemoResults([])
    clearError()
  }

  const addDemoResult = (result: string) => {
    setDemoResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  return (
    <div className="space-y-6">
      <AIStatusToastManager />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            AI Fallback & Graceful Degradation Demo
          </CardTitle>
          <CardDescription>
            Interactive demonstration of AI service fallback and recovery features
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <AIStatusIndicator showLabel />
            <div className="text-sm text-muted-foreground">
              Current Status: {isAvailable ? 'Available' : 'Unavailable'} 
              {isFallbackMode && ' (Offline Mode)'}
            </div>
          </div>

          <Tabs defaultValue="demo" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="demo">Demo</TabsTrigger>
              <TabsTrigger value="recovery">Recovery</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="demo" className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={runFullDemo}
                  disabled={demoState === 'running'}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Run Full Demo
                </Button>
                
                <Button
                  onClick={resetDemo}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                
                <Button
                  onClick={simulateNetworkFailure}
                  variant="destructive"
                  size="sm"
                >
                  Simulate Failure
                </Button>
                
                <Button
                  onClick={simulateRecovery}
                  variant="default"
                  size="sm"
                >
                  Simulate Recovery
                </Button>
                
                <Button
                  onClick={testAIRequest}
                  variant="outline"
                  size="sm"
                >
                  Test AI Request
                </Button>
              </div>

              {demoState === 'running' && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Demo Running</AlertTitle>
                  <AlertDescription>
                    Watch the status indicator and results below as the demo progresses.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Demo Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {demoResults.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No results yet. Run the demo to see the fallback behavior.
                      </div>
                    ) : (
                      demoResults.map((result, index) => (
                        <div key={index} className="text-sm font-mono">
                          {result}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={simulateRateLimit}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Rate Limit
                </Button>
                
                <Button
                  onClick={simulateApiKeyError}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-3 w-3" />
                  API Key Error
                </Button>
                
                <Button
                  onClick={() => toasts.showAutoRetryToast(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-3 w-3" />
                  Auto Retry
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="recovery" className="space-y-4">
              <AIServiceRecovery />
            </TabsContent>
            
            <TabsContent value="diagnostics" className="space-y-4">
              <AIServiceDiagnostics />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <AIFallbackNotification />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Toast Notifications</CardTitle>
                    <CardDescription>
                      Test different types of AI service notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => toasts.showRetryToast(1)}
                        variant="outline"
                        size="sm"
                      >
                        Retry Toast
                      </Button>
                      
                      <Button
                        onClick={() => toasts.showTimeoutToast()}
                        variant="outline"
                        size="sm"
                      >
                        Timeout Toast
                      </Button>
                      
                      <Button
                        onClick={() => toasts.showRateLimitToast(15000)}
                        variant="outline"
                        size="sm"
                      >
                        Rate Limit Toast
                      </Button>
                      
                      <Button
                        onClick={() => toasts.showNetworkErrorToast()}
                        variant="outline"
                        size="sm"
                      >
                        Network Error Toast
                      </Button>
                      
                      <Button
                        onClick={() => toasts.showFallbackModeToast('Demo activation')}
                        variant="outline"
                        size="sm"
                      >
                        Fallback Toast
                      </Button>
                      
                      <Button
                        onClick={() => toasts.showRecoverySuccessToast()}
                        variant="outline"
                        size="sm"
                      >
                        Recovery Toast
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Feature Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Implemented Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Automatic Detection</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Service health monitoring</li>
                <li>• Consecutive failure tracking</li>
                <li>• Network connectivity checks</li>
                <li>• API endpoint validation</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Graceful Degradation</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Automatic fallback to offline mode</li>
                <li>• Clear user notifications</li>
                <li>• Core functionality preservation</li>
                <li>• Status indicator updates</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recovery Mechanisms</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Exponential backoff retry</li>
                <li>• Manual recovery options</li>
                <li>• Auto-retry with user control</li>
                <li>• Service diagnostics</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">User Feedback</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Toast notifications</li>
                <li>• Status indicators</li>
                <li>• Recovery suggestions</li>
                <li>• Detailed diagnostics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}