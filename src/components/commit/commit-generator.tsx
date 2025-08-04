import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSessions } from '@/hooks/use-app-store'
import { useToast } from '@/hooks/use-toast'
import { commitAnalysisEngine } from '@/lib/commit-analysis'
import { commitMessageGenerator, type CommitGenerationRules } from '@/lib/commit-generator'
import { CommitPreview } from './commit-preview'
import { CommitSettings } from './commit-settings'
import { 
  GitCommit, 
  AlertCircle, 
  Clock,
  TrendingUp,
  CheckCircle2
} from 'lucide-react'
import type { CommitSuggestion, CommitAnalysis } from '@/types'

interface CommitGeneratorProps {
  className?: string
}

export const CommitGenerator: React.FC<CommitGeneratorProps> = ({
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<CommitSuggestion[]>([])
  const [analysis, setAnalysis] = useState<CommitAnalysis | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [generationRules, setGenerationRules] = useState<CommitGenerationRules>(
    commitMessageGenerator.getRules()
  )
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)
  
  const { sessions, currentSessionId } = useSessions()
  const { toast } = useToast()

  // Get current session
  const currentSession = sessions.find(s => s.id === currentSessionId)

  // Generate commit suggestions
  const generateSuggestions = useCallback(async () => {
    if (!currentSession) {
      toast({
        title: 'No session selected',
        description: 'Please select a session to generate commit messages.',
        variant: 'destructive'
      })
      return
    }

    setIsGenerating(true)
    
    try {
      // Analyze the current session
      const sessionAnalysis = commitAnalysisEngine.analyzeSession(currentSession)
      setAnalysis(sessionAnalysis)

      // Check if there's anything to analyze
      if (sessionAnalysis.completedTodos.length === 0 && 
          sessionAnalysis.modifiedNodes.length === 0 && 
          sessionAnalysis.codeSnippets.length === 0) {
        setSuggestions([])
        toast({
          title: 'No changes detected',
          description: 'Complete some todos or modify nodes to generate commit suggestions.',
        })
        return
      }

      // Generate suggestions
      const newSuggestions = commitAnalysisEngine.generateCommitSuggestions(sessionAnalysis)
      setSuggestions(newSuggestions)
      setLastGenerated(new Date())

      if (newSuggestions.length === 0) {
        toast({
          title: 'No suggestions generated',
          description: 'Unable to generate meaningful commit suggestions from current changes.',
        })
      } else {
        toast({
          title: 'Suggestions generated',
          description: `Generated ${newSuggestions.length} commit suggestion${newSuggestions.length > 1 ? 's' : ''}.`,
        })
      }
    } catch (error) {
      console.error('Failed to generate commit suggestions:', error)
      toast({
        title: 'Generation failed',
        description: 'Failed to generate commit suggestions. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }, [currentSession, toast])

  // Handle settings changes
  const handleRulesChange = useCallback((newRules: CommitGenerationRules) => {
    setGenerationRules(newRules)
    commitMessageGenerator.updateRules(newRules)
    
    // Regenerate suggestions with new rules if we have analysis data
    if (analysis && suggestions.length > 0) {
      const newSuggestions = commitAnalysisEngine.generateCommitSuggestions(analysis)
      setSuggestions(newSuggestions)
    }
  }, [analysis, suggestions.length])

  // Auto-generate on session change if enabled
  useEffect(() => {
    if (generationRules.autoGenerate && currentSession && !isGenerating) {
      generateSuggestions()
    }
  }, [currentSession, generationRules.autoGenerate, generateSuggestions, isGenerating])

  // Render analysis summary
  const renderAnalysisSummary = () => {
    if (!analysis) return null

    const { completedTodos, modifiedNodes, codeSnippets, timeRange } = analysis
    const totalChanges = completedTodos.length + modifiedNodes.length + codeSnippets.length

    if (totalChanges === 0) return null

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{completedTodos.length} todos completed</span>
            </div>
            <div className="flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-blue-500" />
              <span>{modifiedNodes.length} nodes modified</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span>{codeSnippets.length} code snippets</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {Math.round((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60))}h ago
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render main content
  const renderMainContent = () => {
    if (showSettings) {
      return (
        <CommitSettings
          rules={generationRules}
          onRulesChange={handleRulesChange}
          onClose={() => setShowSettings(false)}
        />
      )
    }

    return (
      <>
        {renderAnalysisSummary()}
        
        <CommitPreview
          suggestions={suggestions}
          onRegenerateClick={generateSuggestions}
          onSettingsClick={() => setShowSettings(true)}
          isLoading={isGenerating}
        />
        
        {lastGenerated && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Last generated: {lastGenerated.toLocaleString()}
          </div>
        )}
      </>
    )
  }

  // Show error if no session is selected
  if (!currentSession) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No session selected. Please select or create a session to use the commit generator.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {renderMainContent()}
    </div>
  )
}

export default CommitGenerator