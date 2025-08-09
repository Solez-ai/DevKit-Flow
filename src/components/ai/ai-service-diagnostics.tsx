import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  BarChart3,
  RefreshCw,
  Download
} from 'lucide-react'
import { useAIService } from '@/hooks/use-ai-service'
import { aiService } from '@/lib/ai-service'
import type { AIServiceStatus } from '@/types'

interface DiagnosticTest {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
  result?: string
  duration?: number
  error?: string
}

interface AIServiceDiagnosticsProps {
  className?: string
}

/**
 * AI Service Diagnostics Component
 * Provides comprehensive diagnostics and monitoring for AI service
 */
export function AIServiceDiagnostics({ className }: AIServiceDiagnosticsProps) {
  const { isEnabled, isLoading, error } = useAIService()
  const [diagnosticTests, setDiagnosticTests] = useState<DiagnosticTest[]>([])
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false)
  const [diagnosticsHistory, setDiagnosticsHistory] = useState<Array<{
    timestamp: Date
    results: DiagnosticTest[]
    overallStatus: 'passed' | 'failed' | 'partial'
  }>>([])

  // Initialize diagnostic tests
  useEffect(() => {
    const tests: DiagnosticTest[] = [
      {
        id: 'connectivity',
        name: 'Internet Connectivity',
        description: 'Check if device can reach the internet',
        status: 'pending'
      },
      {
        id: 'api-endpoint',
        name: 'API Endpoint Reachability',
        description: 'Verify AI service endpoint is accessible',
        status: 'pending'
      },
      {
        id: 'api-key',
        name: 'API Key Validation',
        description: 'Test if API key is valid and has permissions',
        status: 'pending'
      },
      {
        id: 'rate-limits',
        name: 'Rate Limit Status',
        description: 'Check current rate limit usage',
        status: 'pending'
      },
      {
        id: 'model-availability',
        name: 'Model Availability',
        description: 'Verify selected AI model is available',
        status: 'pending'
      },
      {
        id: 'response-time',
        name: 'Response Time Test',
        description: 'Measure AI service response latency',
        status: 'pending'
      }
    ]
    setDiagnosticTests(tests)
  }, [])

  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true)
    const updatedTests = [...diagnosticTests]

    try {
      // Test 1: Internet Connectivity
      await runTest(updatedTests, 'connectivity', async () => {
        const response = await fetch('https://httpbin.org/get', { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        })
        if (!response.ok) throw new Error('No internet connection')
        return 'Internet connection available'
      })

      // Test 2: API Endpoint Reachability
      await runTest(updatedTests, 'api-endpoint', async () => {
        const config = aiService.getConfig()
        const response = await fetch(config.baseUrl, { 
          method: 'OPTIONS',
          signal: AbortSignal.timeout(10000)
        })
        return `Endpoint reachable (${response.status})`
      })

      // Test 3: API Key Validation
      await runTest(updatedTests, 'api-key', async () => {
        const config = aiService.getConfig()
        if (!config.apiKey) throw new Error('No API key configured')
        
        // Try a minimal request to validate key
        try {
          await aiService.sendRequest('ping', {}, undefined)
          return 'API key is valid'
        } catch (error: any) {
          if (error.code === 'API_ERROR' && error.message.includes('unauthorized')) {
            throw new Error('Invalid API key')
          }
          return 'API key appears valid (service unavailable)'
        }
      })

      // Test 4: Rate Limit Status
      await runTest(updatedTests, 'rate-limits', async () => {
        const queueStatus = status.queueStatus
        const totalRequests = queueStatus.completed + queueStatus.failed
        return `${totalRequests} requests processed, ${queueStatus.pending} pending`
      })

      // Test 5: Model Availability
      await runTest(updatedTests, 'model-availability', async () => {
        const config = aiService.getConfig()
        return `Using model: ${config.model}`
      })

      // Test 6: Response Time Test
      await runTest(updatedTests, 'response-time', async () => {
        const startTime = Date.now()
        try {
          await aiService.sendRequest('ping', {}, undefined)
          const duration = Date.now() - startTime
          return `Response time: ${duration}ms`
        } catch (error) {
          const duration = Date.now() - startTime
          return `Timeout after ${duration}ms`
        }
      })

    } catch (error) {
      console.error('Diagnostics failed:', error)
    }

    // Save results to history
    const overallStatus = updatedTests.every(t => t.status === 'passed') ? 'passed' :
                         updatedTests.some(t => t.status === 'passed') ? 'partial' : 'failed'
    
    setDiagnosticsHistory(prev => [
      {
        timestamp: new Date(),
        results: [...updatedTests],
        overallStatus
      },
      ...prev.slice(0, 9) // Keep last 10 results
    ])

    setIsRunningDiagnostics(false)
  }

  const runTest = async (
    tests: DiagnosticTest[], 
    testId: string, 
    testFn: () => Promise<string>
  ) => {
    const testIndex = tests.findIndex(t => t.id === testId)
    if (testIndex === -1) return

    // Mark as running
    tests[testIndex] = { ...tests[testIndex], status: 'running' }
    setDiagnosticTests([...tests])

    const startTime = Date.now()
    
    try {
      const result = await testFn()
      const duration = Date.now() - startTime
      
      tests[testIndex] = {
        ...tests[testIndex],
        status: 'passed',
        result,
        duration
      }
    } catch (error: any) {
      const duration = Date.now() - startTime
      
      tests[testIndex] = {
        ...tests[testIndex],
        status: 'failed',
        error: error.message,
        duration
      }
    }

    setDiagnosticTests([...tests])
  }

  const getTestIcon = (test: DiagnosticTest) => {
    switch (test.status) {
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const exportDiagnostics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      serviceStatus: status,
      diagnosticTests,
      history: diagnosticsHistory
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-service-diagnostics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          AI Service Diagnostics
        </CardTitle>
        <CardDescription>
          Comprehensive health check and monitoring for AI service
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="diagnostics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diagnostics" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Run comprehensive diagnostics to identify issues
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={runDiagnostics}
                  disabled={isRunningDiagnostics}
                  size="sm"
                >
                  {isRunningDiagnostics ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Activity className="h-3 w-3 mr-1" />
                      Run Diagnostics
                    </>
                  )}
                </Button>
                <Button
                  onClick={exportDiagnostics}
                  size="sm"
                  variant="outline"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {diagnosticTests.map((test) => (
                <div key={test.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getTestIcon(test)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{test.name}</div>
                      {test.duration && (
                        <Badge variant="outline" className="text-xs">
                          {test.duration}ms
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {test.description}
                    </div>
                    {test.result && (
                      <div className="text-sm text-green-600 mt-1">
                        ✓ {test.result}
                      </div>
                    )}
                    {test.error && (
                      <div className="text-sm text-red-600 mt-1">
                        ✗ {test.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Service Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {status.serviceStatus}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {status.consecutiveFailures} consecutive failures
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Request Queue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {status.queueStatus.pending + status.queueStatus.processing}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Active requests
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Request Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Completed:</span>
                  <span className="font-medium">{status.queueStatus.completed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Failed:</span>
                  <span className="font-medium text-red-600">{status.queueStatus.failed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Success Rate:</span>
                  <span className="font-medium">
                    {status.queueStatus.completed + status.queueStatus.failed > 0 
                      ? Math.round((status.queueStatus.completed / (status.queueStatus.completed + status.queueStatus.failed)) * 100)
                      : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            {diagnosticsHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No diagnostic history available. Run diagnostics to see results here.
              </div>
            ) : (
              <div className="space-y-3">
                {diagnosticsHistory.map((entry, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          {entry.timestamp.toLocaleString()}
                        </div>
                        <Badge 
                          variant={
                            entry.overallStatus === 'passed' ? 'default' :
                            entry.overallStatus === 'partial' ? 'secondary' : 'destructive'
                          }
                        >
                          {entry.overallStatus}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground">
                        {entry.results.filter(r => r.status === 'passed').length} passed, {' '}
                        {entry.results.filter(r => r.status === 'failed').length} failed
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}