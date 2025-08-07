/**
 * Pattern Documentation Panel Component
 * Task 12.3: Professional pattern documentation interface
 */

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { ScrollArea } from '../ui/scroll-area'
import { 
  Download, 
  FileText, 
  Globe, 
  Code, 
  Shield, 
  Zap, 
  HelpCircle,
  BookOpen,
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { 
  patternDocumentationSystem,
  type PatternDocumentation,
  type DocumentationGenerationOptions,
  type ExportOptions
} from '../../lib/pattern-documentation-system-simple'
import type { RegexPattern } from '../../types'

interface PatternDocumentationPanelProps {
  pattern: RegexPattern
  isVisible: boolean
  onClose: () => void
}

export function PatternDocumentationPanel({ 
  pattern, 
  isVisible, 
  onClose 
}: PatternDocumentationPanelProps) {
  const [documentation, setDocumentation] = useState<PatternDocumentation | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationOptions, setGenerationOptions] = useState<DocumentationGenerationOptions>({
    includeExamples: true,
    includeTestCases: true,
    includePerformance: true
  })
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (isVisible && pattern) {
      generateDocumentation()
    }
  }, [isVisible, pattern])

  const generateDocumentation = async () => {
    if (!pattern) return

    setIsGenerating(true)
    try {
      const doc = await patternDocumentationSystem.generateDocumentation(
        pattern,
        generationOptions
      )
      setDocumentation(doc)
    } catch (error) {
      console.error('Failed to generate documentation:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const exportDocumentation = async (format: 'markdown' | 'html' | 'json' | 'pdf') => {
    if (!documentation) return

    const exportOptions: ExportOptions = {
      includeExamples: true,
      includeTestCases: true,
      includePerformance: true,
      includeSecurity: true,
      includeAIContent: false,
      format: format
    }

    try {
      const exportData = await patternDocumentationSystem.exportDocumentation(
        documentation,
        format
      )

      // Create download link
      const blob = new Blob([exportData], { 
        type: format === 'html' ? 'text/html' : 
              format === 'json' ? 'application/json' : 
              'text/plain' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${pattern.name || 'pattern'}-documentation.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export documentation:', error)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Pattern Documentation
              </CardTitle>
              <CardDescription>
                Comprehensive documentation for: <code className="bg-muted px-1 rounded">{pattern.regex}</code>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateDocumentation}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Regenerate'}
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Generating comprehensive documentation...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This may take a few moments for complex patterns
                </p>
              </div>
            </div>
          ) : documentation ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-8 flex-shrink-0">
                <TabsTrigger value="overview" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="syntax" className="flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  Syntax
                </TabsTrigger>
                <TabsTrigger value="examples" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Examples
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="compatibility" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Compatibility
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  Export
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <TabsContent value="overview" className="mt-4 space-y-4">
                    <OverviewTab documentation={documentation} />
                  </TabsContent>

                  <TabsContent value="syntax" className="mt-4 space-y-4">
                    <SyntaxTab documentation={documentation} />
                  </TabsContent>

                  <TabsContent value="examples" className="mt-4 space-y-4">
                    <ExamplesTab documentation={documentation} />
                  </TabsContent>

                  <TabsContent value="performance" className="mt-4 space-y-4">
                    <PerformanceTab documentation={documentation} />
                  </TabsContent>

                  <TabsContent value="security" className="mt-4 space-y-4">
                    <SecurityTab documentation={documentation} />
                  </TabsContent>

                  <TabsContent value="compatibility" className="mt-4 space-y-4">
                    <CompatibilityTab documentation={documentation} />
                  </TabsContent>

                  <TabsContent value="ai" className="mt-4 space-y-4">
                    <AIInsightsTab documentation={documentation} />
                  </TabsContent>

                  <TabsContent value="export" className="mt-4 space-y-4">
                    <ExportTab onExport={exportDocumentation} />
                  </TabsContent>
                </ScrollArea>
              </div>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p>No documentation available</p>
                <Button onClick={generateDocumentation} className="mt-4">
                  Generate Documentation
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ documentation }: { documentation: PatternDocumentation }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pattern Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{documentation.overview.summary}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <h4 className="font-semibold mb-2">Purpose</h4>
              <p className="text-sm text-muted-foreground">{documentation.overview.purpose}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Complexity</h4>
              <Badge variant={
                documentation.overview.complexity === 'beginner' ? 'default' :
                documentation.overview.complexity === 'intermediate' ? 'secondary' : 'destructive'
              }>
                {documentation.overview.complexity}
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {documentation.overview.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {documentation.overview.prerequisites.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Prerequisites</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {documentation.overview.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-lg">
            {documentation.pattern.regex}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Syntax Tab Component
function SyntaxTab({ documentation }: { documentation: PatternDocumentation }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Syntax Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{documentation.syntax.explanation}</p>
        </CardContent>
      </Card>

      {documentation.syntax.breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pattern Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Part</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {documentation.syntax.breakdown.map((part, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-mono bg-muted">{part.part}</td>
                      <td className="p-2">
                        <Badge variant="outline">{part.type}</Badge>
                      </td>
                      <td className="p-2 text-sm">{part.explanation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Examples Tab Component
function ExamplesTab({ documentation }: { documentation: PatternDocumentation }) {
  return (
    <div className="space-y-4">
      {documentation.examples.map((example, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">{example.title}</CardTitle>
            <CardDescription>{example.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h5 className="font-semibold mb-1">Pattern:</h5>
                <code className="bg-muted px-2 py-1 rounded">{example.pattern}</code>
              </div>
              <div>
                <h5 className="font-semibold mb-1">Test String:</h5>
                <code className="bg-muted px-2 py-1 rounded">{example.testString}</code>
              </div>
              <div>
                <h5 className="font-semibold mb-1">Explanation:</h5>
                <p className="text-sm text-muted-foreground">{example.explanation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Performance Tab Component
function PerformanceTab({ documentation }: { documentation: PatternDocumentation }) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Time Complexity</h4>
              <code className="text-lg">{documentation.performance.timeComplexity}</code>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Space Complexity</h4>
              <code className="text-lg">{documentation.performance.spaceComplexity}</code>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Backtracking Risk</h4>
              <span className={`text-lg font-semibold ${getRiskColor(documentation.performance.backtrackingRisk)}`}>
                {documentation.performance.backtrackingRisk}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {documentation.performance.optimizationTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {documentation.performance.optimizationTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {documentation.performance.benchmarks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Benchmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Input Size</th>
                    <th className="text-left p-2">Execution Time (ms)</th>
                    <th className="text-left p-2">Memory Usage (bytes)</th>
                  </tr>
                </thead>
                <tbody>
                  {documentation.performance.benchmarks.map((benchmark, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{benchmark.inputSize}</td>
                      <td className="p-2">{benchmark.executionTime}</td>
                      <td className="p-2">{benchmark.memoryUsage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Security Tab Component
function SecurityTab({ documentation }: { documentation: PatternDocumentation }) {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      case 'critical': return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskLevelColor(documentation.security.riskLevel)}`}>
              Risk Level: {documentation.security.riskLevel.toUpperCase()}
            </span>
          </div>
        </CardContent>
      </Card>

      {documentation.security.vulnerabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Vulnerabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentation.security.vulnerabilities.map((vuln, index) => (
                <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-semibold text-red-800 mb-2">{vuln.type.toUpperCase()}</h4>
                  <p className="text-sm mb-2">{vuln.description}</p>
                  <div className="text-xs text-red-600">
                    <strong>Impact:</strong> {vuln.impact}
                  </div>
                  <div className="text-xs text-red-600">
                    <strong>Likelihood:</strong> {vuln.likelihood}
                  </div>
                  {vuln.example && (
                    <div className="mt-2">
                      <strong className="text-xs">Example:</strong>
                      <code className="block bg-red-100 p-2 rounded text-xs mt-1">{vuln.example}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {documentation.security.mitigations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Mitigations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documentation.security.mitigations.map((mitigation, index) => (
                <div key={index} className="border border-green-200 rounded-lg p-3 bg-green-50">
                  <h5 className="font-semibold text-green-800 mb-1">{mitigation.vulnerability}</h5>
                  <p className="text-sm mb-2">{mitigation.solution}</p>
                  <div className="text-xs text-green-600">
                    <strong>Implementation:</strong> {mitigation.implementation}
                  </div>
                  <div className="text-xs text-green-600">
                    <strong>Effectiveness:</strong> {mitigation.effectiveness}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {documentation.security.bestPractices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Security Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {documentation.security.bestPractices.map((practice, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{practice}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Compatibility Tab Component
function CompatibilityTab({ documentation }: { documentation: PatternDocumentation }) {
  return (
    <div className="space-y-6">
      {documentation.compatibility.languages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Language Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentation.compatibility.languages.map((lang, index) => (
                <div key={index} className={`p-3 border rounded-lg ${lang.supported ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{lang.language}</h4>
                    {lang.supported ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {lang.version && (
                    <div className="text-xs text-muted-foreground mb-1">
                      Version: {lang.version}
                    </div>
                  )}
                  {lang.notes && (
                    <div className="text-xs text-muted-foreground">
                      {lang.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {documentation.compatibility.browsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Browser Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {documentation.compatibility.browsers.map((browser, index) => (
                <div key={index} className={`p-3 border rounded-lg text-center ${browser.supported ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-center mb-2">
                    <h4 className="font-semibold mr-2">{browser.browser}</h4>
                    {browser.supported ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {browser.version && (
                    <div className="text-xs text-muted-foreground">
                      {browser.version}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {documentation.compatibility.notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Compatibility Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {documentation.compatibility.notes.map((note, index) => (
                <li key={index} className="flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// AI Insights Tab Component
function AIInsightsTab({ documentation }: { documentation: PatternDocumentation }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4">
            <p className="text-lg">{documentation.aiExplanation?.plainEnglish}</p>
            <div className="text-xs text-muted-foreground mt-2">
              Confidence: {Math.round((documentation.aiExplanation?.confidence || 0) * 100)}%
            </div>
          </div>

          {(documentation.aiExplanation?.stepByStep?.length || 0) > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Step-by-Step Breakdown</h4>
              <ol className="list-decimal list-inside space-y-1">
                {documentation.aiExplanation?.stepByStep?.map((step, index) => (
                  <li key={index} className="text-sm">{step}</li>
                ))}
              </ol>
            </div>
          )}

          {(documentation.aiExplanation?.analogies?.length || 0) > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Analogies</h4>
              <ul className="list-disc list-inside space-y-1">
                {documentation.aiExplanation?.analogies?.map((analogy, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{analogy}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {(documentation.aiOptimizations?.length || 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Optimization Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentation.aiOptimizations?.map((opt, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{opt.type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Confidence: {Math.round(opt.confidence * 100)}%
                    </span>
                  </div>
                  <h5 className="font-semibold mb-2">{opt.suggestion}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                      <h6 className="text-sm font-semibold mb-1">Original:</h6>
                      <code className="bg-muted px-2 py-1 rounded text-xs">{opt.originalPattern}</code>
                    </div>
                    <div>
                      <h6 className="text-sm font-semibold mb-1">Optimized:</h6>
                      <code className="bg-green-100 px-2 py-1 rounded text-xs">{opt.optimizedPattern}</code>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{opt.explanation}</p>
                  <div className="text-xs text-green-600 mt-1">
                    <strong>Impact:</strong> {opt.impact}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(documentation.aiAlternatives?.length || 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alternative Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentation.aiAlternatives?.map((alt, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="bg-muted px-2 py-1 rounded">{alt.pattern}</code>
                    <Badge variant={
                      alt.complexity === 'simpler' ? 'default' :
                      alt.complexity === 'similar' ? 'secondary' : 'destructive'
                    }>
                      {alt.complexity}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{alt.description}</p>
                  <div className="text-xs text-muted-foreground mb-2">
                    <strong>Use Case:</strong> {alt.useCase}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-xs font-semibold text-green-600 mb-1">Advantages:</h6>
                      <ul className="text-xs space-y-1">
                        {alt.advantages.map((adv, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {adv}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h6 className="text-xs font-semibold text-red-600 mb-1">Disadvantages:</h6>
                      <ul className="text-xs space-y-1">
                        {alt.disadvantages.map((dis, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                            {dis}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Export Tab Component
function ExportTab({ onExport }: { onExport: (format: 'markdown' | 'html' | 'json' | 'pdf') => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Documentation</CardTitle>
          <CardDescription>
            Export the generated documentation in various formats for sharing and archiving.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => onExport('markdown')}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Markdown</div>
                <div className="text-xs text-muted-foreground">
                  Perfect for documentation sites and README files
                </div>
              </div>
            </Button>

            <Button
              onClick={() => onExport('html')}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <Globe className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">HTML</div>
                <div className="text-xs text-muted-foreground">
                  Interactive web page with styling and navigation
                </div>
              </div>
            </Button>

            <Button
              onClick={() => onExport('json')}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <Code className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">JSON</div>
                <div className="text-xs text-muted-foreground">
                  Structured data for programmatic processing
                </div>
              </div>
            </Button>

            <Button
              onClick={() => onExport('pdf')}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <Download className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">PDF</div>
                <div className="text-xs text-muted-foreground">
                  Professional document for printing and sharing
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              All exports include:
            </div>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Complete pattern analysis and breakdown</li>
              <li>• Examples and use cases</li>
              <li>• Performance and security analysis</li>
              <li>• Compatibility information</li>
              <li>• AI-generated insights and explanations</li>
              <li>• Troubleshooting guides and best practices</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}