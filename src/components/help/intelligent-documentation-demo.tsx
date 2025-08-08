import React, { useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  Search, 
  Keyboard,
  FileText,
  Lightbulb,
  Target,
  Zap,
  TrendingUp,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIIntelligentDocumentation } from './ai-intelligent-documentation';
import { AIKeyboardShortcuts } from './ai-keyboard-shortcuts';
import { IntelligentHelpProvider } from './intelligent-help-provider';

export const IntelligentDocumentationDemo: React.FC = () => {
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDocumentationSearch = (query: string) => {
    setSearchQuery(query);
    setShowDocumentation(true);
  };

  return (
    <IntelligentHelpProvider>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              Intelligent Documentation System Demo
            </CardTitle>
            <CardDescription>
              Experience AI-powered documentation with smart search, dynamic content generation, and intelligent recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">AI-Powered Search</Badge>
              <Badge variant="outline">Natural Language Queries</Badge>
              <Badge variant="outline">Smart Recommendations</Badge>
              <Badge variant="outline">Dynamic Content</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              This demo showcases the intelligent documentation system that uses AI to provide contextual, 
              relevant information and generates content dynamically based on user needs.
            </p>
          </CardContent>
        </Card>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-6 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">AI-Powered Search</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Natural language search that understands intent and context
              </p>
              <ul className="text-xs text-left space-y-1">
                <li>• Semantic search understanding</li>
                <li>• Context-aware results</li>
                <li>• Smart query suggestions</li>
                <li>• Relevance scoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">Dynamic Generation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI creates comprehensive documentation when content is missing
              </p>
              <ul className="text-xs text-left space-y-1">
                <li>• On-demand content creation</li>
                <li>• Topic-specific documentation</li>
                <li>• Code examples and best practices</li>
                <li>• Troubleshooting guides</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Intelligent suggestions based on usage patterns and context
              </p>
              <ul className="text-xs text-left space-y-1">
                <li>• Personalized content suggestions</li>
                <li>• Related topic discovery</li>
                <li>• Usage-based recommendations</li>
                <li>• Learning path guidance</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Demo Tabs */}
        <Tabs defaultValue="documentation" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documentation">Documentation Search</TabsTrigger>
            <TabsTrigger value="shortcuts">Keyboard Shortcuts</TabsTrigger>
          </TabsList>

          {/* Documentation Search Demo */}
          <TabsContent value="documentation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI-Powered Documentation Search</CardTitle>
                <CardDescription>
                  Search using natural language and get intelligent, contextual results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Search Examples */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-3">Try These Searches:</h3>
                      <div className="space-y-2">
                        {[
                          'How to create nodes',
                          'Regex pattern building',
                          'AI features setup',
                          'Troubleshooting connections'
                        ].map((query, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => handleDocumentationSearch(query)}
                          >
                            <Search className="h-3 w-3 mr-2" />
                            "{query}"
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-3">AI Features:</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Semantic Understanding</p>
                            <p className="text-xs text-muted-foreground">
                              Understands intent behind queries
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Smart Suggestions</p>
                            <p className="text-xs text-muted-foreground">
                              Provides related search ideas
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Dynamic Content</p>
                            <p className="text-xs text-muted-foreground">
                              Generates missing documentation
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button 
                  onClick={() => setShowDocumentation(true)}
                  className="w-full"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Open Documentation Search
                </Button>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">AI Search Features</span>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Natural language queries: "How do I connect two nodes?"</li>
                    <li>• Context-aware results based on your current workspace</li>
                    <li>• Automatic content generation for missing documentation</li>
                    <li>• Smart filtering by difficulty, category, and content type</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keyboard Shortcuts Demo */}
          <TabsContent value="shortcuts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI-Enhanced Keyboard Shortcuts</CardTitle>
                <CardDescription>
                  Discover and master keyboard shortcuts with intelligent recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <Keyboard className="h-8 w-8 mx-auto mb-3 text-gray-500" />
                      <h3 className="font-medium mb-2 text-center">Smart Shortcuts</h3>
                      <p className="text-sm text-muted-foreground mb-4 text-center">
                        AI analyzes your usage patterns to recommend shortcuts
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span>Create Node</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+N</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>AI Assistant</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+Shift+A</kbd>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Quick Search</span>
                          <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+K</kbd>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <TrendingUp className="h-8 w-8 mx-auto mb-3 text-green-500" />
                      <h3 className="font-medium mb-2 text-center">Usage Analytics</h3>
                      <p className="text-sm text-muted-foreground mb-4 text-center">
                        Track your shortcut usage and productivity improvements
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Efficiency Score</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Most Used</span>
                          <span className="font-medium">Workflow</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Uses</span>
                          <span className="font-medium">1,247</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button 
                  onClick={() => setShowShortcuts(true)}
                  className="w-full"
                >
                  <Keyboard className="h-4 w-4 mr-2" />
                  Open Keyboard Shortcuts
                </Button>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Smart Features</span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• AI recommendations based on your workflow patterns</li>
                    <li>• Usage analytics to track productivity improvements</li>
                    <li>• Contextual shortcuts that adapt to your current workspace</li>
                    <li>• Customizable shortcuts with conflict detection</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Implementation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Implementation Status</CardTitle>
            <CardDescription>
              Current status of intelligent documentation system components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI-Powered Search Engine</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Natural Language Processing</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dynamic Content Generation</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Smart Recommendations</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Keyboard Shortcut System</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Usage Analytics</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Context-Aware Filtering</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Multi-Format Export</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentation Modal */}
      <AIIntelligentDocumentation
        isOpen={showDocumentation}
        onClose={() => setShowDocumentation(false)}
        initialQuery={searchQuery}
        contextualFeature="demo"
      />

      {/* Shortcuts Modal */}
      <AIKeyboardShortcuts
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        userContext="demo"
      />
    </IntelligentHelpProvider>
  );
};

export default IntelligentDocumentationDemo;