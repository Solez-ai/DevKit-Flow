import React, { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  AlertTriangle,
  Edit2,
  Save,
  X
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface TestCase {
  id: string
  name: string
  input: string
  expectedMatch: boolean
  description?: string
  tags?: string[]
}

interface TestResult {
  testCaseId: string
  passed: boolean
  actualMatch: boolean
  matches: Array<{
    text: string
    startIndex: number
    endIndex: number
  }>
  executionTime: number
  error?: string
}

interface BatchTestResult {
  totalTests: number
  passedTests: number
  failedTests: number
  executionTime: number
  results: TestResult[]
}

interface TestCaseManagerProps {
  pattern: string
  flags: string[]
  onTestCasesChange?: (testCases: TestCase[]) => void
  className?: string
}

export function TestCaseManager({
  pattern,
  flags = ['g'],
  onTestCasesChange,
  className
}: TestCaseManagerProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: '1',
      name: 'Valid Email',
      input: 'user@example.com',
      expectedMatch: true,
      description: 'Should match valid email format',
      tags: ['email', 'valid']
    },
    {
      id: '2',
      name: 'Invalid Email',
      input: 'invalid-email',
      expectedMatch: false,
      description: 'Should not match invalid email format',
      tags: ['email', 'invalid']
    }
  ])

  const [batchResults, setBatchResults] = useState<BatchTestResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [editingCase, setEditingCase] = useState<string | null>(null)
  const [newCase, setNewCase] = useState<Partial<TestCase>>({
    name: '',
    input: '',
    expectedMatch: true,
    description: '',
    tags: []
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add new test case
  const addTestCase = useCallback(() => {
    if (!newCase.name || !newCase.input) return

    const testCase: TestCase = {
      id: Date.now().toString(),
      name: newCase.name,
      input: newCase.input,
      expectedMatch: newCase.expectedMatch ?? true,
      description: newCase.description,
      tags: newCase.tags || []
    }

    const updatedCases = [...testCases, testCase]
    setTestCases(updatedCases)
    onTestCasesChange?.(updatedCases)

    // Reset form
    setNewCase({
      name: '',
      input: '',
      expectedMatch: true,
      description: '',
      tags: []
    })
    setShowAddForm(false)
  }, [newCase, testCases, onTestCasesChange])

  // Update test case
  const updateTestCase = useCallback((id: string, updates: Partial<TestCase>) => {
    const updatedCases = testCases.map(tc => 
      tc.id === id ? { ...tc, ...updates } : tc
    )
    setTestCases(updatedCases)
    onTestCasesChange?.(updatedCases)
    setEditingCase(null)
  }, [testCases, onTestCasesChange])

  // Delete test case
  const deleteTestCase = useCallback((id: string) => {
    const updatedCases = testCases.filter(tc => tc.id !== id)
    setTestCases(updatedCases)
    onTestCasesChange?.(updatedCases)
  }, [testCases, onTestCasesChange])

  // Run batch tests
  const runBatchTests = useCallback(async () => {
    if (!pattern || testCases.length === 0) return

    setIsRunning(true)
    const startTime = performance.now()

    try {
      const regex = new RegExp(pattern, flags.join(''))
      const results: TestResult[] = []

      for (const testCase of testCases) {
        const testStartTime = performance.now()
        
        try {
          const matches = Array.from(testCase.input.matchAll(regex))
          const actualMatch = matches.length > 0
          const passed = actualMatch === testCase.expectedMatch

          results.push({
            testCaseId: testCase.id,
            passed,
            actualMatch,
            matches: matches.map(match => ({
              text: match[0],
              startIndex: match.index!,
              endIndex: match.index! + match[0].length
            })),
            executionTime: performance.now() - testStartTime
          })
        } catch (error) {
          results.push({
            testCaseId: testCase.id,
            passed: false,
            actualMatch: false,
            matches: [],
            executionTime: performance.now() - testStartTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      const totalTime = performance.now() - startTime
      const passedTests = results.filter(r => r.passed).length
      const failedTests = results.length - passedTests

      setBatchResults({
        totalTests: results.length,
        passedTests,
        failedTests,
        executionTime: totalTime,
        results
      })

    } catch (error) {
      console.error('Error running batch tests:', error)
    } finally {
      setIsRunning(false)
    }
  }, [pattern, flags, testCases])

  // Import test cases from CSV/JSON
  const importTestCases = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let importedCases: TestCase[] = []

        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content)
          importedCases = Array.isArray(data) ? data : [data]
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n').filter(line => line.trim())
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
          
          importedCases = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
            const nameIndex = headers.indexOf('name')
            const inputIndex = headers.indexOf('input')
            const expectedIndex = headers.indexOf('expected') || headers.indexOf('expectedmatch')
            const descIndex = headers.indexOf('description')

            return {
              id: `imported-${Date.now()}-${index}`,
              name: values[nameIndex] || `Test ${index + 1}`,
              input: values[inputIndex] || '',
              expectedMatch: values[expectedIndex]?.toLowerCase() === 'true',
              description: values[descIndex] || '',
              tags: ['imported']
            }
          })
        }

        // Validate and add imported cases
        const validCases = importedCases.filter(tc => tc.name && tc.input)
        if (validCases.length > 0) {
          const updatedCases = [...testCases, ...validCases]
          setTestCases(updatedCases)
          onTestCasesChange?.(updatedCases)
        }

      } catch (error) {
        console.error('Error importing test cases:', error)
      }
    }
    reader.readAsText(file)
  }, [testCases, onTestCasesChange])

  // Export test cases
  const exportTestCases = useCallback((format: 'json' | 'csv') => {
    let content = ''
    let filename = `test-cases.${format}`

    if (format === 'json') {
      content = JSON.stringify(testCases, null, 2)
    } else {
      content = 'Name,Input,Expected,Description,Tags\n'
      content += testCases.map(tc => 
        `"${tc.name}","${tc.input}",${tc.expectedMatch},"${tc.description || ''}","${tc.tags?.join(';') || ''}"`
      ).join('\n')
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [testCases])

  // Export test results
  const exportResults = useCallback(() => {
    if (!batchResults) return

    const content = JSON.stringify({
      pattern,
      flags,
      summary: {
        totalTests: batchResults.totalTests,
        passedTests: batchResults.passedTests,
        failedTests: batchResults.failedTests,
        executionTime: batchResults.executionTime,
        successRate: (batchResults.passedTests / batchResults.totalTests * 100).toFixed(2) + '%'
      },
      results: batchResults.results.map(result => {
        const testCase = testCases.find(tc => tc.id === result.testCaseId)
        return {
          testCase: testCase ? {
            name: testCase.name,
            input: testCase.input,
            expectedMatch: testCase.expectedMatch,
            description: testCase.description
          } : null,
          result: {
            passed: result.passed,
            actualMatch: result.actualMatch,
            matches: result.matches,
            executionTime: result.executionTime,
            error: result.error
          }
        }
      })
    }, null, 2)

    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'test-results.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [batchResults, pattern, flags, testCases])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Test Cases Management */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Test Cases</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowAddForm(true)}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Test
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={importTestCases}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>

              <Button
                onClick={() => exportTestCases('json')}
                size="sm"
                variant="outline"
                disabled={testCases.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Test Case Form */}
          {showAddForm && (
            <Card className="border-dashed">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-name">Test Name</Label>
                    <Input
                      id="test-name"
                      value={newCase.name || ''}
                      onChange={(e) => setNewCase(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter test name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected-match">Expected Result</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="expected-match"
                        checked={newCase.expectedMatch ?? true}
                        onCheckedChange={(checked) => setNewCase(prev => ({ ...prev, expectedMatch: checked }))}
                      />
                      <Label htmlFor="expected-match">
                        {newCase.expectedMatch ? 'Should Match' : 'Should Not Match'}
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-input">Test Input</Label>
                  <Textarea
                    id="test-input"
                    value={newCase.input || ''}
                    onChange={(e) => setNewCase(prev => ({ ...prev, input: e.target.value }))}
                    placeholder="Enter test input text"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-description">Description (Optional)</Label>
                  <Input
                    id="test-description"
                    value={newCase.description || ''}
                    onChange={(e) => setNewCase(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this test validates"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={addTestCase}
                    disabled={!newCase.name || !newCase.input}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Add Test Case
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Cases List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {testCases.map((testCase) => {
                const result = batchResults?.results.find(r => r.testCaseId === testCase.id)
                const isEditing = editingCase === testCase.id

                return (
                  <Card key={testCase.id} className={cn(
                    "transition-colors",
                    result?.passed === true && "border-green-200 bg-green-50/50",
                    result?.passed === false && "border-red-200 bg-red-50/50"
                  )}>
                    <CardContent className="pt-4">
                      {isEditing ? (
                        <div className="space-y-3">
                          <Input
                            value={testCase.name}
                            onChange={(e) => updateTestCase(testCase.id, { name: e.target.value })}
                            className="font-medium"
                          />
                          <Textarea
                            value={testCase.input}
                            onChange={(e) => updateTestCase(testCase.id, { input: e.target.value })}
                            className="font-mono text-sm"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={testCase.expectedMatch}
                                onCheckedChange={(checked) => updateTestCase(testCase.id, { expectedMatch: checked })}
                              />
                              <Label>{testCase.expectedMatch ? 'Should Match' : 'Should Not Match'}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => setEditingCase(null)}
                                size="sm"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => setEditingCase(null)}
                                size="sm"
                                variant="outline"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{testCase.name}</h4>
                              {result && (
                                <Badge variant={result.passed ? "default" : "destructive"}>
                                  {result.passed ? (
                                    <>
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Pass
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Fail
                                    </>
                                  )}
                                </Badge>
                              )}
                              <Badge variant="outline">
                                {testCase.expectedMatch ? 'Should Match' : 'Should Not Match'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                onClick={() => setEditingCase(testCase.id)}
                                size="sm"
                                variant="ghost"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => deleteTestCase(testCase.id)}
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="font-mono text-sm bg-muted p-2 rounded">
                            "{testCase.input}"
                          </div>

                          {testCase.description && (
                            <p className="text-sm text-muted-foreground">{testCase.description}</p>
                          )}

                          {result && (
                            <div className="text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Expected: {testCase.expectedMatch ? 'Match' : 'No Match'}
                                </span>
                                <span className="text-muted-foreground">
                                  Actual: {result.actualMatch ? 'Match' : 'No Match'}
                                </span>
                              </div>
                              {result.matches.length > 0 && (
                                <div className="text-muted-foreground">
                                  Matches: {result.matches.map(m => `"${m.text}"`).join(', ')}
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {result.executionTime.toFixed(2)}ms
                              </div>
                              {result.error && (
                                <div className="flex items-center gap-2 text-destructive">
                                  <AlertTriangle className="w-3 h-3" />
                                  {result.error}
                                </div>
                              )}
                            </div>
                          )}

                          {testCase.tags && testCase.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              {testCase.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}

              {testCases.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No test cases yet</p>
                  <p className="text-sm">Add test cases to validate your regex pattern</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Batch Testing Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Batch Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={runBatchTests}
                disabled={isRunning || !pattern || testCases.length === 0}
              >
                {isRunning ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>

              {batchResults && (
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="default">
                    {batchResults.passedTests}/{batchResults.totalTests} Passed
                  </Badge>
                  <span className="text-muted-foreground">
                    {batchResults.executionTime.toFixed(2)}ms total
                  </span>
                </div>
              )}
            </div>

            {batchResults && (
              <Button
                onClick={exportResults}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            )}
          </div>

          {batchResults && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Success Rate</span>
                <span className="font-medium">
                  {((batchResults.passedTests / batchResults.totalTests) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(batchResults.passedTests / batchResults.totalTests) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}