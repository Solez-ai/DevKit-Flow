import React, { useState } from 'react'
import { HelpCircle, Book, Code, Lightbulb, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { Alert, AlertDescription } from '../ui/alert'
import type { RegexComponent } from '../../types'
import { getComponentDocumentation } from '../../lib/regex-component-docs'
import { getComponentCompatibility } from '../../lib/regex-component-docs'

interface ComponentHelpPanelProps {
  component: RegexComponent | null
  onClose: () => void
  className?: string
}

export function ComponentHelpPanel({
  component,
  onClose,
  className = ''
}: ComponentHelpPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')
  
  const documentation = component ? getComponentDocumentation(component.id) : null
  const compatibility = component ? getComponentCompatibility(component.id) : null

  if (!component) {
    return (
      <div className={`w-96 border-l bg-background flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select a component to view help</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-96 border-l bg-background flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Component Help</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div 
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-mono"
            style={{ backgroundColor: component.visualRepresentation.color }}
          >
            {component.visualRepresentation.icon}
          </div>
          <div>
            <p className="font-medium">{component.name}</p>
            <p className="text-sm text-muted-foreground">{component.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="compatibility">Support</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Basic Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Book className="h-3 w-3 mr-1" />
                    Pattern Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold">Regex Pattern</Label>
                    <code className="text-sm bg-muted px-2 py-1 rounded block mt-1 font-mono">
                      {component.regexPattern}
                    </code>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-semibold">Category</Label>
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {component.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {documentation && (
                    <div>
                      <Label className="text-xs font-semibold">Detailed Description</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {documentation.detailedDescription}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Common Uses */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Common Uses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {component.commonUses.map((use, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {use}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Parameters */}
              {component.parameters && component.parameters.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {component.parameters.map((param, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">{param.name}</Label>
                          <Badge variant="outline" className="text-xs">
                            {param.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {param.description}
                        </p>
                        {param.default !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            Default: <code className="bg-muted px-1 rounded">{String(param.default)}</code>
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Common Mistakes */}
              {documentation?.commonMistakes && documentation.commonMistakes.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Common Mistakes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {documentation.commonMistakes.map((mistake, index) => (
                      <Alert key={index}>
                        <AlertDescription className="text-xs">
                          <div className="space-y-1">
                            <p><strong>Mistake:</strong> {mistake.mistake}</p>
                            <p><strong>Correction:</strong> {mistake.correction}</p>
                            <p className="text-muted-foreground">{mistake.explanation}</p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="examples" className="space-y-4 mt-4">
              {/* Basic Examples */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Code className="h-3 w-3 mr-1" />
                    Basic Examples
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {component.examples.map((example, index) => (
                    <div key={index} className="p-2 bg-muted/50 rounded">
                      <code className="text-xs font-mono">{example}</code>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Use Cases */}
              {documentation?.useCases && documentation.useCases.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Detailed Use Cases</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {documentation.useCases.map((useCase, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="text-sm font-semibold">{useCase.title}</h4>
                        <p className="text-xs text-muted-foreground">{useCase.description}</p>
                        <div className="p-2 bg-muted/50 rounded">
                          <code className="text-xs font-mono">{useCase.example}</code>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                          {useCase.explanation}
                        </p>
                        {index < documentation.useCases.length - 1 && <Separator />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Performance Notes */}
              {documentation?.performanceNotes && documentation.performanceNotes.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Performance Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {documentation.performanceNotes.map((note, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start">
                          <span className="mr-2">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="compatibility" className="space-y-4 mt-4">
              {/* Browser/Language Support */}
              {compatibility && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Language Support</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(compatibility).map(([lang, supported]) => {
                        if (lang === 'notes') return null
                        return (
                          <div key={lang} className="flex items-center justify-between">
                            <span className="text-xs capitalize">{lang}</span>
                            {supported ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <X className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    {compatibility.notes && compatibility.notes.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <Label className="text-xs font-semibold">Notes</Label>
                        <ul className="mt-1 space-y-1">
                          {compatibility.notes.map((note, index) => (
                            <li key={index} className="text-xs text-muted-foreground flex items-start">
                              <span className="mr-2">•</span>
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Browser Support */}
              {documentation?.browserSupport && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Browser Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(documentation.browserSupport).map(([browser, supported]) => {
                        if (browser === 'notes') return null
                        return (
                          <div key={browser} className="flex items-center justify-between">
                            <span className="text-xs capitalize">{browser}</span>
                            {supported ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <X className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    {documentation.browserSupport.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          {documentation.browserSupport.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Related Components */}
              {documentation?.relatedComponents && documentation.relatedComponents.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Related Components</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {documentation.relatedComponents.map((relatedComponent, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                          <div 
                            className="w-4 h-4 rounded flex items-center justify-center text-white text-xs font-mono"
                            style={{ backgroundColor: relatedComponent.visualRepresentation.color }}
                          >
                            {relatedComponent.visualRepresentation.icon}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{relatedComponent.name}</p>
                            <p className="text-xs text-muted-foreground">{relatedComponent.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium ${className}`}>{children}</label>
}