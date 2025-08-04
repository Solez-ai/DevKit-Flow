import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useToast } from '@/hooks/use-toast'
import { 
  Copy, 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Info,
  History,
  Edit3,
  Sparkles
} from 'lucide-react'
import type { CommitSuggestion } from '@/types'
import type { ValidationResult } from '@/lib/commit-generator'

interface CommitPreviewProps {
  suggestions: CommitSuggestion[]
  onRegenerateClick: () => void
  onSettingsClick: () => void
  isLoading?: boolean
  className?: string
}

interface CommitHistoryItem {
  id: string
  message: string
  timestamp: Date
  confidence: number
  used: boolean
}

export const CommitPreview: React.FC<CommitPreviewProps> = ({
  suggestions,
  onRegenerateClick,
  onSettingsClick,
  isLoading = false,
  className = ''
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<CommitSuggestion | null>(null)
  const [editedMessage, setEditedMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [history, setHistory] = useState<CommitHistoryItem[]>([])
  const { toast } = useToast()

  // Set initial selection when suggestions change
  useEffect(() => {
    if (suggestions.length > 0 && !selectedSuggestion) {
      setSelectedSuggestion(suggestions[0])
    }
  }, [suggestions, selectedSuggestion])

  // Update edited message when selection changes
  useEffect(() => {
    if (selectedSuggestion && !isEditing) {
      const message = generateFormattedMessage(selectedSuggestion)
      setEditedMessage(message)
      validateMessage(message)
    }
  }, [selectedSuggestion, isEditing])

  // Generate formatted commit message
  const generateFormattedMessage = useCallback((suggestion: CommitSuggestion): string => {
    const { type, scope, description, body } = suggestion
    const scopeText = scope ? `(${scope})` : ''
    const subjectLine = `${type}${scopeText}: ${description}`
    
    if (body) {
      return `${subjectLine}\n\n${body}`
    }
    
    return subjectLine
  }, [])

  // Validate commit message
  const validateMessage = useCallback((message: string) => {
    // Simple validation - in real implementation, use commitMessageGenerator.validateMessage
    const lines = message.split('\n')
    const subjectLine = lines[0]
    const errors: string[] = []
    const warnings: string[] = []

    if (subjectLine.length > 50) {
      errors.push(`Subject line too long (${subjectLine.length}/50)`)
    }

    if (!subjectLine.match(/^(\w+)(\(.+\))?: .+/)) {
      errors.push('Subject line does not follow conventional commit format')
    }

    setValidation({
      isValid: errors.length === 0,
      errors,
      warnings
    })
  }, [])

  // Handle message editing
  const handleEditMessage = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleSaveEdit = useCallback(() => {
    setIsEditing(false)
    validateMessage(editedMessage)
  }, [editedMessage, validateMessage])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    if (selectedSuggestion) {
      setEditedMessage(generateFormattedMessage(selectedSuggestion))
    }
  }, [selectedSuggestion, generateFormattedMessage])

  // Handle copy to clipboard
  const handleCopyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editedMessage)
      toast({
        title: 'Copied to clipboard',
        description: 'Commit message has been copied to your clipboard.',
      })
      
      // Add to history
      if (selectedSuggestion) {
        const historyItem: CommitHistoryItem = {
          id: Date.now().toString(),
          message: editedMessage,
          timestamp: new Date(),
          confidence: selectedSuggestion.confidence,
          used: true
        }
        setHistory(prev => [historyItem, ...prev.slice(0, 9)]) // Keep last 10
      }
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy commit message to clipboard.',
        variant: 'destructive'
      })
    }
  }, [editedMessage, selectedSuggestion, toast])

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: CommitSuggestion) => {
    setSelectedSuggestion(suggestion)
    setIsEditing(false)
  }, [])

  // Handle history item selection
  const handleHistorySelect = useCallback((item: CommitHistoryItem) => {
    setEditedMessage(item.message)
    setIsEditing(false)
    validateMessage(item.message)
  }, [validateMessage])

  // Render confidence badge
  const renderConfidenceBadge = (confidence: number) => {
    const percentage = Math.round(confidence * 100)
    const variant = confidence >= 0.8 ? 'default' : confidence >= 0.5 ? 'secondary' : 'outline'
    
    return (
      <Badge variant={variant} className="ml-2">
        {percentage}% confidence
      </Badge>
    )
  }

  // Render validation status
  const renderValidationStatus = () => {
    if (!validation) return null

    if (validation.isValid) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Valid commit message</span>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {validation.errors.map((error, index) => (
          <div key={index} className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        ))}
        {validation.warnings.map((warning, index) => (
          <div key={index} className="flex items-center gap-2 text-yellow-600">
            <Info className="h-4 w-4" />
            <span className="text-sm">{warning}</span>
          </div>
        ))}
      </div>
    )
  }

  if (suggestions.length === 0 && !isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No commit suggestions available. Complete some todos or modify nodes to generate suggestions.
          </p>
          <Button 
            onClick={onRegenerateClick} 
            variant="outline" 
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Commit Message Generator
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={onRegenerateClick}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
            <Button
              onClick={onSettingsClick}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="space-y-4">
            {/* Message Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Commit Message</label>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      onClick={handleEditMessage}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleSaveEdit}
                        variant="ghost"
                        size="sm"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="ghost"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {isEditing ? (
                <Textarea
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  placeholder="Enter your commit message..."
                  className="min-h-[120px] font-mono text-sm"
                />
              ) : (
                <div className="border rounded-md p-3 bg-muted/50 font-mono text-sm whitespace-pre-wrap min-h-[120px]">
                  {editedMessage || 'No message generated'}
                </div>
              )}
            </div>

            {/* Validation Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Validation</label>
              {renderValidationStatus()}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleCopyToClipboard}
                disabled={!editedMessage || !validation?.isValid}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="suggestions" className="space-y-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-colors ${
                      selectedSuggestion === suggestion 
                        ? 'ring-2 ring-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{suggestion.type}</Badge>
                          {suggestion.scope && (
                            <Badge variant="secondary">{suggestion.scope}</Badge>
                          )}
                        </div>
                        {renderConfidenceBadge(suggestion.confidence)}
                      </div>
                      
                      <div className="font-mono text-sm text-muted-foreground">
                        {generateFormattedMessage(suggestion)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <ScrollArea className="h-[300px]">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <History className="h-8 w-8 mb-2" />
                  <p>No commit history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <Card 
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleHistorySelect(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-2">
                            {renderConfidenceBadge(item.confidence)}
                            {item.used && (
                              <Badge variant="outline" className="text-xs">
                                Used
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="font-mono text-sm">
                          {item.message.split('\n')[0]}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default CommitPreview