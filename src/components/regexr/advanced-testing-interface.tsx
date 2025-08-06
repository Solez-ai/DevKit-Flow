import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { Progress } from '../ui/progress'
import { 
  Play, 
  Download, 
  Copy, 
  BarChart3, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Zap
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface MatchResult {
  text: string
  startIndex: number
  endIndex: number
  groups: string[]
  namedGroups?: Record<string, string>
}

interface MatchStatistics {
  totalMatches: number
  uniqueMatches: number
  coveragePercentage: number
  executionTime: number
  averageMatchLength: number
  longestMatch: string
  shortestMatch: string
  groupCounts: Record<string, number>
}

interface TestCase {
  id: string
  name: string
  input: string
  expectedMatch: boolean
  description?: string
}

interface AdvancedTestingInterfaceProps {
  pattern: string
  flags: string[]
  onPatternChange?: (pattern: string) => void
  className?: string
}

export function AdvancedTestingInterface({
  pattern,
  flags = ['g'],
  onPatternChange,
  className
}: AdvancedTestingInterfaceProps) {
  const [testInput, setTestInput] = useState(`Sample text for testing regex patterns.
Email: user@example.com
Phone: (555) 123-4567
Date: 2024-01-15
URL: https://www.example.com/path?param=value
Numbers: 123, 456.78, -9.99
Mixed content with special chars: @#$%^&*()`)

  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: '1',
      name: 'Basic Test',
      input: 'test@example.com',
      expectedMatch: true,
      description: 'Should match email format'
    }
  ])

  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [executionTime, setExecutionTime] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Generate matches and statistics
  const { matches, statistics, isValid, error } = useMemo(() => {
    if (!pattern || !testInput) {
      return { 
        matches: [], 
        statistics: null, 
        isValid: false, 
        error: null 
      }
    }

    try {
      const startTime = performance.now()
      const regex = new RegExp(pattern, flags.join(''))
      const matches: MatchResult[] = []
      let match

      while ((match = regex.exec(testInput)) !== null) {
        matches.push({
          text: match[0],
          startIndex: match.index!,
          endIndex: match.index! + match[0].length,
          groups: match.slice(1),
          namedGroups: match.groups
        })

        // Prevent infinite loop for non-global patterns
        if (!flags.includes('g')) break
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Calculate statistics
      const uniqueMatches = new Set(matches.map(m => m.text)).size
      const totalLength = testInput.length
      const matchedLength = matches.reduce((sum, m) => sum + m.text.length, 0)
      const coveragePercentage = totalLength > 0 ? (matchedLength / totalLength) * 100 : 0

      const matchLengths = matches.map(m => m.text.length)
      const averageMatchLength = matchLengths.length > 0 
        ? matchLengths.reduce((sum, len) => sum + len, 0) / matchLengths.length 
        : 0

      const longestMatch = matches.reduce((longest, match) => 
        match.text.length > longest.length ? match.text : longest, '')
      const shortestMatch = matches.reduce((shortest, match) => 
        match.text.length < shortest.length ? match.text : shortest, matches[0]?.text || '')

      // Count groups
      const groupCounts: Record<string, number> = {}
      matches.forEach(match => {
        match.groups.forEach((group, index) => {
          if (group !== undefined) {
            const key = `Group ${index + 1}`
            groupCounts[key] = (groupCounts[key] || 0) + 1
          }
        })
        if (match.namedGroups) {
          Object.keys(match.namedGroups).forEach(name => {
            groupCounts[name] = (groupCounts[name] || 0) + 1
          })
        }
      })

      const statistics: MatchStatistics = {
        totalMatches: matches.length,
        uniqueMatches,
        coveragePercentage,
        executionTime,
        averageMatchLength,
        longestMatch,
        shortestMatch,
        groupCounts
      }

      return { matches, statistics, isValid: true, error: null }
    } catch (err) {
      return { 
        matches: [], 
        statistics: null, 
        isValid: false, 
        error: err instanceof Error ? err.message : 'Invalid pattern' 
      }
    }
  }, [pattern, flags, testInput])

  // Highlight matches in textarea
  const highlightedText = useMemo(() => {
    if (!matches.length || !testInput) return testInput

    let result = ''
    let lastIndex = 0

    matches.forEach((match, index) => {
      // Add text before match
      result += testInput.slice(lastIndex, match.startIndex)
      
      // Add highlighted match
      result += `<mark class="match-highlight ${selectedMatch === match ? 'selected' : ''}" data-match="${index}">${match.text}</mark>`
      
      lastIndex = match.endIndex
    })

    // Add remaining text
    result += testInput.slice(lastIndex)
    
    return result
  }, [matches, testInput, selectedMatch])

  // Run test cases
  const runTestCases = useCallback(async () => {
    if (!pattern) return

    setIsRunning(true)
    const startTime = performance.now()

    try {
      const regex = new RegExp(pattern, flags.join(''))
      
      // Simulate processing time for large test suites
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Test each case
      testCases.forEach(testCase => {
        const matches = testCase.input.match(regex)
        const hasMatch = matches !== null && matches.length > 0
        
        // Update test case result (in real implementation, you'd update state)
        console.log(`Test "${testCase.name}": ${hasMatch === testCase.expectedMatch ? 'PASS' : 'FAIL'}`)
      })

    } catch (error) {
      console.error('Error running test cases:', error)
    } finally {
      const endTime = performance.now()
      setExecutionTime(endTime - startTime)
      setIsRunning(false)
    }
  }, [pattern, flags, testCases])

  // Export matches
  const exportMatches = useCallback((format: 'json' | 'csv' | 'txt') => {
    if (!matches.length) return

    let content = ''
    let filename = `regex-matches.${format}`

    switch (format) {
      case 'json':
        content = JSON.stringify({
          pattern,
          flags,
          statistics,
          matches: matches.map(match => ({
            text: match.text,
            startIndex: match.startIndex,
            endIndex: match.endIndex,
            groups: match.groups,
            namedGroups: match.namedGroups
          }))
        }, null, 2)
        break

      case 'csv':
        content = 'Text,Start,End,Groups\n'
        content += matches.map(match => 
          `"${match.text.replace(/"/g, '""')}",${match.startIndex},${match.endIndex},"${match.groups.join(';')}"`
        ).join('\n')
        break

      case 'txt':
        content = `Pattern: ${pattern}\nFlags: ${flags.join('')}\n\n`
        content += `Statistics:\n`
        content += `- Total matches: ${statistics?.totalMatches || 0}\n`
        content += `- Unique matches: ${statistics?.uniqueMatches || 0}\n`
        content += `- Coverage: ${statistics?.coveragePercentage.toFixed(2) || 0}%\n\n`
        content += `Matches:\n`
        content += matches.map((match, index) => 
          `${index + 1}. "${match.text}" (${match.startIndex}-${match.endIndex})`
        ).join('\n')
        break
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [matches, pattern, flags, statistics])

  // Copy matches to clipboard
  const copyMatches = useCallback(() => {
    if (!matches.length) return

    const text = matches.map(match => match.text).join('\n')
    navigator.clipboard.writeText(text)
  }, [matches])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Test Input Area */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Test Input</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isValid ? "default" : "destructive"}>
                {isValid ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Valid
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Invalid
                  </>
                )}
              </Badge>
              {statistics && (
                <Badge variant="secondary">
                  <Target className="w-3 h-3 mr-1" />
                  {statistics.totalMatches} matches
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter your test text here..."
              className="min-h-[200px] font-mono text-sm"
            />
            {error && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Error
                </Badge>
              </div>
            )}
          </div>

          {/* Match highlighting overlay */}
          {matches.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <div 
                className="font-mono whitespace-pre-wrap p-3 bg-muted/50 rounded border min-h-[200px] relative"
                dangerouslySetInnerHTML={{ __html: highlightedText }}
                onClick={(e) => {
                  const target = e.target as HTMLElement
                  if (target.classList.contains('match-highlight')) {
                    const matchIndex = parseInt(target.dataset.match || '0')
                    setSelectedMatch(matches[matchIndex])
                  }
                }}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              onClick={runTestCases}
              disabled={isRunning || !pattern}
              size="sm"
            >
              {isRunning ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Tests
                </>
              )}
            </Button>
            
            <Button
              onClick={copyMatches}
              disabled={!matches.length}
              variant="outline"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Matches
            </Button>

            <div className="flex items-center gap-1">
              <Button
                onClick={() => exportMatches('json')}
                disabled={!matches.length}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button
                onClick={() => exportMatches('csv')}
                disabled={!matches.length}
                variant="outline"
                size="sm"
              >
                CSV
              </Button>
              <Button
                onClick={() => exportMatches('txt')}
                disabled={!matches.length}
                variant="outline"
                size="sm"
              >
                TXT
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics and Match Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Statistics Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Match Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statistics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Total Matches</div>
                    <div className="text-2xl font-bold">{statistics.totalMatches}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Unique Matches</div>
                    <div className="text-2xl font-bold">{statistics.uniqueMatches}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-medium">{statistics.coveragePercentage.toFixed(2)}%</span>
                  </div>
                  <Progress value={statistics.coveragePercentage} className="h-2" />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Execution Time</span>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {statistics.executionTime.toFixed(2)}ms
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Match Length</span>
                    <span className="text-sm font-medium">{statistics.averageMatchLength.toFixed(1)} chars</span>
                  </div>

                  {statistics.longestMatch && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Longest Match</div>
                      <div className="text-xs font-mono bg-muted p-2 rounded truncate">
                        "{statistics.longestMatch}"
                      </div>
                    </div>
                  )}

                  {statistics.shortestMatch && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Shortest Match</div>
                      <div className="text-xs font-mono bg-muted p-2 rounded truncate">
                        "{statistics.shortestMatch}"
                      </div>
                    </div>
                  )}
                </div>

                {Object.keys(statistics.groupCounts).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Capture Groups</div>
                      <div className="space-y-1">
                        {Object.entries(statistics.groupCounts).map(([group, count]) => (
                          <div key={group} className="flex items-center justify-between text-sm">
                            <span className="font-mono">{group}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No statistics available</p>
                <p className="text-sm">Enter a valid pattern and test input</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Details Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Match Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matches.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {matches.map((match, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded border cursor-pointer transition-colors",
                        selectedMatch === match 
                          ? "bg-primary/10 border-primary" 
                          : "bg-muted/50 hover:bg-muted"
                      )}
                      onClick={() => setSelectedMatch(match)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">Match {index + 1}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {match.startIndex}-{match.endIndex}
                        </span>
                      </div>
                      
                      <div className="font-mono text-sm bg-background p-2 rounded border">
                        "{match.text}"
                      </div>

                      {match.groups.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-muted-foreground">Capture Groups:</div>
                          {match.groups.map((group, groupIndex) => (
                            group !== undefined && (
                              <div key={groupIndex} className="text-xs font-mono">
                                <span className="text-muted-foreground">Group {groupIndex + 1}:</span> "{group}"
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {match.namedGroups && Object.keys(match.namedGroups).length > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-muted-foreground">Named Groups:</div>
                          {Object.entries(match.namedGroups).map(([name, value]) => (
                            <div key={name} className="text-xs font-mono">
                              <span className="text-muted-foreground">{name}:</span> "{value}"
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No matches found</p>
                <p className="text-sm">Try adjusting your pattern or test input</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}