import React, { useState } from 'react';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  Zap, 
  HelpCircle,
  Settings,
  Code,
  FileText,
  Layers,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntelligentHelpProvider } from './intelligent-help-provider';
import { WithSmartTooltip } from './smart-tooltip-system';
import { IntelligentProgressiveDisclosure } from './intelligent-progressive-disclosure';

export const AIHelpSystemDemo: React.FC = () => {
  const [demoStep, setDemoStep] = useState(1);

  // Sample progressive disclosure levels
  const disclosureLevels = [
    {
      id: 'basic-concepts',
      title: 'Basic Concepts',
      description: 'Understanding the fundamentals of AI-powered help',
      complexity: 'beginner' as const,
      estimatedReadTime: 3,
      content: (
        <div className="space-y-3">
          <p className="text-sm">
            The AI-powered contextual help system provides intelligent assistance based on your current context and actions.
          </p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Context-aware suggestions</li>
            <li>Smart tooltips with AI insights</li>
            <li>Progressive information disclosure</li>
            <li>Personalized learning paths</li>
          </ul>
        </div>
      )
    },
    {
      id: 'smart-tooltips',
      title: 'Smart Tooltips',
      description: 'Interactive tooltips that adapt to your workflow',
      complexity: 'intermediate' as const,
      estimatedReadTime: 5,
      prerequisites: ['basic-concepts'],
      content: (
        <div className="space-y-3">
          <p className="text-sm">
            Smart tooltips analyze your current context and provide relevant insights, tips, and shortcuts.
          </p>
          <div className="bg-blue-50/50 p-3 rounded border border-blue-200">
            <h4 className="text-sm font-medium mb-2">Key Features:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>AI-generated contextual insights</li>
              <li>Confidence scoring for suggestions</li>
              <li>Quick actions and shortcuts</li>
              <li>Related feature recommendations</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'contextual-panels',
      title: 'Contextual Help Panels',
      description: 'Floating panels with comprehensive assistance',
      complexity: 'advanced' as const,
      estimatedReadTime: 7,
      prerequisites: ['smart-tooltips'],
      content: (
        <div className="space-y-3">
          <p className="text-sm">
            Contextual help panels provide detailed assistance that adapts to your current workspace and actions.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50/50 p-3 rounded border border-green-200">
              <h5 className="text-sm font-medium text-green-800">Productivity Tips</h5>
              <p className="text-xs text-green-700 mt-1">
                AI-powered suggestions to improve your workflow efficiency
              </p>
            </div>
            <div className="bg-purple-50/50 p-3 rounded border border-purple-200">
              <h5 className="text-sm font-medium text-purple-800">Learning Insights</h5>
              <p className="text-xs text-purple-700 mt-1">
                Personalized learning recommendations based on your progress
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'advanced-features',
      title: 'Advanced AI Features',
      description: 'Expert-level AI assistance and automation',
      complexity: 'expert' as const,
      estimatedReadTime: 10,
      prerequisites: ['contextual-panels'],
      content: (
        <div className="space-y-3">
          <p className="text-sm">
            Advanced AI features provide expert-level assistance with complex workflows and optimization.
          </p>
          <div className="space-y-2">
            <div className="bg-orange-50/50 p-3 rounded border border-orange-200">
              <h5 className="text-sm font-medium text-orange-800">Workflow Optimization</h5>
              <p className="text-xs text-orange-700 mt-1">
                AI analyzes your patterns and suggests workflow improvements
              </p>
            </div>
            <div className="bg-red-50/50 p-3 rounded border border-red-200">
              <h5 className="text-sm font-medium text-red-800">Predictive Assistance</h5>
              <p className="text-xs text-red-700 mt-1">
                Anticipates your needs and provides proactive suggestions
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <IntelligentHelpProvider>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-500" />
              AI-Enhanced Help System Demo
            </CardTitle>
            <CardDescription>
              Experience intelligent, context-aware assistance powered by AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">AI-Powered</Badge>
              <Badge variant="outline">Context-Aware</Badge>
              <Badge variant="outline">Progressive</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              This demo showcases the new AI-powered contextual help system that provides intelligent assistance 
              based on your current context, skill level, and workflow patterns.
            </p>
          </CardContent>
        </Card>

        {/* Demo Tabs */}
        <Tabs defaultValue="tooltips" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tooltips">Smart Tooltips</TabsTrigger>
            <TabsTrigger value="disclosure">Progressive Disclosure</TabsTrigger>
            <TabsTrigger value="panels">Help Panels</TabsTrigger>
          </TabsList>

          {/* Smart Tooltips Demo */}
          <TabsContent value="tooltips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Smart Tooltip Examples</CardTitle>
                <CardDescription>
                  Hover over or focus on elements to see AI-powered contextual help
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <WithSmartTooltip
                    feature="devflow-studio"
                    component="node-creation"
                    title="Create Node"
                    description="Add a new node to your development workflow"
                    quickTips={[
                      "Use Ctrl+N for quick node creation",
                      "Drag from palette for specific node types",
                      "Double-click canvas for context menu"
                    ]}
                    keyboardShortcut="Ctrl+N"
                    contextualActions={[
                      {
                        label: "Create Task Node",
                        action: () => console.log("Creating task node"),
                        icon: <Target className="h-3 w-3" />
                      },
                      {
                        label: "Create Code Node", 
                        action: () => console.log("Creating code node"),
                        icon: <Code className="h-3 w-3" />
                      }
                    ]}
                  >
                    <Button className="w-full">
                      <Target className="h-4 w-4 mr-2" />
                      Create Node
                    </Button>
                  </WithSmartTooltip>

                  <WithSmartTooltip
                    feature="regexr-plus"
                    component="pattern-builder"
                    title="Pattern Builder"
                    description="Build regex patterns visually with drag-and-drop components"
                    quickTips={[
                      "Start with character classes for basic patterns",
                      "Use quantifiers to specify repetition",
                      "Test patterns in real-time"
                    ]}
                    keyboardShortcut="Ctrl+B"
                  >
                    <Button variant="outline" className="w-full">
                      <Layers className="h-4 w-4 mr-2" />
                      Build Pattern
                    </Button>
                  </WithSmartTooltip>

                  <WithSmartTooltip
                    feature="export-system"
                    component="pdf-export"
                    title="Export to PDF"
                    description="Generate professional PDF documentation from your work"
                    quickTips={[
                      "Choose layout options for best presentation",
                      "Include analytics for comprehensive reports",
                      "Use custom styling for branding"
                    ]}
                    contextualActions={[
                      {
                        label: "Quick Export",
                        action: () => console.log("Quick export"),
                        icon: <Zap className="h-3 w-3" />
                      }
                    ]}
                  >
                    <Button variant="secondary" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </WithSmartTooltip>

                  <WithSmartTooltip
                    feature="ai-assistant"
                    component="code-generation"
                    title="AI Code Assistant"
                    description="Get AI-powered code suggestions and refactoring help"
                    quickTips={[
                      "Describe what you want to build",
                      "Ask for code reviews and improvements",
                      "Get architecture suggestions"
                    ]}
                    keyboardShortcut="Ctrl+Shift+A"
                  >
                    <Button variant="default" className="w-full">
                      <Brain className="h-4 w-4 mr-2" />
                      AI Assistant
                    </Button>
                  </WithSmartTooltip>
                </div>

                <div className="mt-6 p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Try It Out</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Hover over the buttons above to see smart tooltips in action. Each tooltip provides 
                    contextual information, AI-generated insights, and quick actions relevant to the feature.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progressive Disclosure Demo */}
          <TabsContent value="disclosure" className="space-y-4">
            <IntelligentProgressiveDisclosure
              title="AI Help System Guide"
              description="Learn about the AI-powered help system with adaptive content disclosure"
              levels={disclosureLevels}
              feature="help-system"
              component="progressive-disclosure"
              adaptToUserLevel={true}
              showProgress={true}
              maxInitialLevels={2}
            />
          </TabsContent>

          {/* Help Panels Demo */}
          <TabsContent value="panels" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contextual Help Panels</CardTitle>
                <CardDescription>
                  Floating panels that provide comprehensive, context-aware assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <h3 className="font-medium mb-2">AI Insights Panel</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Get intelligent suggestions based on your current context and workflow
                      </p>
                      <Button size="sm" onClick={() => setDemoStep(1)}>
                        <Play className="h-3 w-3 mr-2" />
                        Show Demo
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <h3 className="font-medium mb-2">Context-Aware Help</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Receive help that adapts to your current feature and user actions
                      </p>
                      <Button size="sm" variant="outline" onClick={() => setDemoStep(2)}>
                        <Play className="h-3 w-3 mr-2" />
                        Show Demo
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Panel Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-green-50/50 border border-green-200 rounded">
                      <h5 className="text-sm font-medium text-green-800 mb-1">Smart Positioning</h5>
                      <p className="text-xs text-green-700">
                        Panels automatically position themselves to avoid blocking important content
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50/50 border border-blue-200 rounded">
                      <h5 className="text-sm font-medium text-blue-800 mb-1">AI-Powered Content</h5>
                      <p className="text-xs text-blue-700">
                        Content is generated based on your current context and skill level
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50/50 border border-purple-200 rounded">
                      <h5 className="text-sm font-medium text-purple-800 mb-1">Adaptive Learning</h5>
                      <p className="text-xs text-purple-700">
                        System learns from your interactions to provide better suggestions
                      </p>
                    </div>
                  </div>
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
              Current status of AI-enhanced help system components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Contextual Help Panel</span>
                <Badge variant="default">✅ Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Intelligent Help Provider</span>
                <Badge variant="default">✅ Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Smart Tooltip System</span>
                <Badge variant="default">✅ Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Progressive Disclosure</span>
                <Badge variant="default">✅ Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Context Tracking</span>
                <Badge variant="default">✅ Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Integration</span>
                <Badge variant="default">✅ Complete</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </IntelligentHelpProvider>
  );
};

export default AIHelpSystemDemo;