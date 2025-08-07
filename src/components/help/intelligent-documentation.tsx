import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Book, 
  Search, 
  Keyboard, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Sparkles,
  ExternalLink,
  Copy,
  RefreshCw,
  Filter,
  Tag,
  Clock,
  TrendingUp,
  MessageSquare,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAIService } from '@/hooks/use-ai-service';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DocumentationItem {
  id: string;
  title: string;
  description: string;
  category: 'feature' | 'shortcut' | 'troubleshooting' | 'api' | 'tutorial';
  content: string;
  tags: string[];
  lastUpdated: Date;
  popularity: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relatedItems: string[];
  codeExamples?: CodeExample[];
  troubleshootingSteps?: TroubleshootingStep[];
  keyboardShortcuts?: KeyboardShortcut[];
}

interface CodeExample {
  language: string;
  code: string;
  description: string;
  runnable?: boolean;
}

interface TroubleshootingStep {
  step: number;
  description: string;
  solution: string;
  commonCause?: string;
}

interface KeyboardShortcut {
  keys: string;
  description: string;
  context: string;
  platform?: 'windows' | 'mac' | 'linux' | 'all';
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
  aiGenerated?: boolean;
}

interface IntelligentDocumentationProps {
  searchQuery?: string;
  category?: string;
  onClose?: () => void;
}

const documentationData: DocumentationItem[] = [
  {
    id: 'node-creation',
    title: 'Creating and Managing Nodes',
    description: 'Complete guide to working with nodes in DevFlow Studio',
    category: 'feature',
    content: `Nodes are the fundamental building blocks of your development workflow in DevFlow Studio. They represent tasks, code snippets, references, and other elements of your project planning process.

## Types of Nodes

### Task Nodes
Task nodes represent actionable items in your workflow. They can contain:
- Todo lists with priority levels
- Progress tracking
- Time estimates
- Dependencies

### Code Nodes
Code nodes store code snippets and technical documentation:
- Syntax highlighting for multiple languages
- Version history
- Integration with AI code generation
- Export to various formats

### Reference Nodes
Reference nodes link to external resources:
- URLs and documentation links
- File references
- API documentation
- Design mockups

## Creating Nodes

You can create nodes in several ways:
1. Click the "Add Node" button in the toolbar
2. Use the keyboard shortcut Ctrl+N (Cmd+N on Mac)
3. Double-click on empty canvas space
4. Drag from the node palette

## Node Properties

Each node has customizable properties:
- Title and description
- Status (idle, active, completed, blocked)
- Priority level
- Tags and categories
- Custom colors and icons`,
    tags: ['nodes', 'creation', 'management', 'devflow-studio'],
    lastUpdated: new Date('2024-01-15'),
    popularity: 95,
    difficulty: 'beginner',
    relatedItems: ['connections', 'canvas-navigation', 'node-types'],
    codeExamples: [
      {
        language: 'typescript',
        code: `// Creating a node programmatically
const newNode = createNode({
  type: 'task',
  title: 'Implement user authentication',
  description: 'Add login/logout functionality',
  status: 'idle',
  priority: 'high'
});

// Add to canvas
addNodeToCanvas(newNode);`,
        description: 'Programmatic node creation example'
      }
    ],
    keyboardShortcuts: [
      {
        keys: 'Ctrl+N',
        description: 'Create new node',
        context: 'Canvas',
        platform: 'all'
      },
      {
        keys: 'Delete',
        description: 'Delete selected node',
        context: 'Node selected',
        platform: 'all'
      }
    ]
  },
  {
    id: 'regex-troubleshooting',
    title: 'Regex Pattern Troubleshooting',
    description: 'Common regex issues and how to solve them',
    category: 'troubleshooting',
    content: `Regular expressions can be tricky. Here are the most common issues and their solutions.`,
    tags: ['regex', 'troubleshooting', 'patterns', 'regexr'],
    lastUpdated: new Date('2024-01-10'),
    popularity: 87,
    difficulty: 'intermediate',
    relatedItems: ['regex-components', 'pattern-testing'],
    troubleshootingSteps: [
      {
        step: 1,
        description: 'Pattern not matching expected text',
        solution: 'Check for case sensitivity and ensure all special characters are properly escaped',
        commonCause: 'Forgetting to escape special regex characters like . + * ? ^ $ { } ( ) | [ ]'
      },
      {
        step: 2,
        description: 'Pattern matching too much text',
        solution: 'Use more specific character classes and add anchors (^ for start, $ for end)',
        commonCause: 'Using greedy quantifiers without proper boundaries'
      },
      {
        step: 3,
        description: 'Performance issues with complex patterns',
        solution: 'Avoid nested quantifiers and use atomic groups or possessive quantifiers',
        commonCause: 'Catastrophic backtracking due to nested quantifiers'
      }
    ]
  }
];

const faqData: FAQItem[] = [
  {
    id: 'ai-setup',
    question: 'How do I set up AI features?',
    answer: 'To enable AI features, go to Settings → AI Assistant and enter your OpenRouter API key. The AI features will then be available throughout the application.',
    category: 'ai-features',
    helpful: 45,
    notHelpful: 2,
    aiGenerated: false
  },
  {
    id: 'offline-mode',
    question: 'Can I use DevKit Flow without internet?',
    answer: 'Yes! DevKit Flow is designed to work completely offline. All core features are available without an internet connection. AI features require internet but are optional.',
    category: 'general',
    helpful: 38,
    notHelpful: 1,
    aiGenerated: false
  }
];

export const IntelligentDocumentation: React.FC<IntelligentDocumentationProps> = ({
  searchQuery: initialQuery = '',
  category: initialCategory,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedItem, setSelectedItem] = useState<DocumentationItem | null>(null);
  const [aiGeneratedFAQ, setAiGeneratedFAQ] = useState<FAQItem[]>([]);
  const [isGeneratingFAQ, setIsGeneratingFAQ] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const { generateResponse, isEnabled: aiEnabled } = useAIService();
  const { toast } = useToast();

  // Filter documentation based on search and category
  const filteredDocs = useMemo(() => {
    return documentationData.filter(item => {
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Generate AI-powered FAQ based on user queries and common issues
  const generateAIFAQ = useCallback(async () => {
    if (!aiEnabled) return;

    setIsGeneratingFAQ(true);
    try {
      const prompt = `Generate helpful FAQ items for DevKit Flow based on common user questions and issues.

      DevKit Flow features:
      - DevFlow Studio: Visual project planning with nodes and connections
      - Regexr++: Visual regex builder with testing
      - AI Integration: Claude MCP for code assistance
      - Offline-first: Works without internet
      - Export/Import: Multiple format support

      Please generate 5-7 FAQ items covering:
      1. Getting started questions
      2. Common troubleshooting issues
      3. Feature usage questions
      4. AI integration questions
      5. Performance and optimization

      Format as JSON array:
      [
        {
          "question": "Clear, specific question",
          "answer": "Detailed, helpful answer with steps if needed",
          "category": "general|features|troubleshooting|ai|performance"
        }
      ]

      Make answers practical and actionable.`;

      const response = await generateResponse(prompt, 'faq-generation');
      
      try {
        const faqItems = JSON.parse(response);
        if (Array.isArray(faqItems)) {
          const generatedFAQ = faqItems.map((item: any, index: number) => ({
            id: `ai-faq-${index}`,
            question: item.question,
            answer: item.answer,
            category: item.category,
            helpful: 0,
            notHelpful: 0,
            aiGenerated: true
          }));
          
          setAiGeneratedFAQ(generatedFAQ);
        }
      } catch (parseError) {
        console.warn('Failed to parse AI FAQ:', parseError);
        toast({
          title: "FAQ Generation Failed",
          description: "Unable to generate AI-powered FAQ. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to generate AI FAQ:', error);
      toast({
        title: "AI Service Error",
        description: "Failed to connect to AI service for FAQ generation.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingFAQ(false);
    }
  }, [aiEnabled, generateResponse, toast]);

  // Run AI-powered diagnostics to identify common issues
  const runIntelligentDiagnostics = useCallback(async () => {
    if (!aiEnabled) return;

    setIsRunningDiagnostics(true);
    try {
      const prompt = `Analyze potential issues and provide diagnostic recommendations for DevKit Flow users.

      Common user scenarios:
      - New users setting up the application
      - Users experiencing performance issues
      - Users having trouble with AI features
      - Users with import/export problems
      - Users with canvas navigation issues

      Please provide diagnostic checks and solutions in JSON format:
      [
        {
          "category": "performance|setup|features|troubleshooting",
          "issue": "Brief description of potential issue",
          "diagnostic": "How to check for this issue",
          "solution": "Step-by-step solution",
          "severity": "low|medium|high",
          "commonCause": "Most common cause of this issue"
        }
      ]

      Focus on actionable diagnostics that users can perform themselves.`;

      const response = await generateResponse(prompt, 'diagnostics');
      
      try {
        const diagnostics = JSON.parse(response);
        if (Array.isArray(diagnostics)) {
          setDiagnosticResults(diagnostics);
        }
      } catch (parseError) {
        console.warn('Failed to parse diagnostics:', parseError);
      }
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
    } finally {
      setIsRunningDiagnostics(false);
    }
  }, [aiEnabled, generateResponse]);

  // Copy code example to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Code example has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please select and copy manually.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Get keyboard shortcuts for current platform
  const getShortcutsForPlatform = useCallback((shortcuts: KeyboardShortcut[]) => {
    const platform = navigator.platform.toLowerCase();
    const isMac = platform.includes('mac');
    
    return shortcuts.filter(shortcut => 
      shortcut.platform === 'all' || 
      (isMac && shortcut.platform === 'mac') ||
      (!isMac && shortcut.platform !== 'mac')
    );
  }, []);

  // Load AI-generated content on mount
  useEffect(() => {
    if (aiEnabled) {
      generateAIFAQ();
      runIntelligentDiagnostics();
    }
  }, [aiEnabled, generateAIFAQ, runIntelligentDiagnostics]);

  const allFAQ = [...faqData, ...aiGeneratedFAQ];
  const categories = ['all', ...new Set(documentationData.map(item => item.category))];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Book className="h-6 w-6" />
              Documentation
              {aiEnabled && (
                <Badge variant="secondary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Comprehensive guides, troubleshooting, and AI-powered assistance
            </p>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation, shortcuts, and troubleshooting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="documentation" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="flex-1 overflow-hidden">
            <div className="h-full flex gap-6 p-6">
              {/* Documentation List */}
              <div className="w-1/3 overflow-y-auto">
                <div className="space-y-3">
                  {filteredDocs.map((item) => (
                    <Card
                      key={item.id}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/50",
                        selectedItem?.id === item.id && "bg-muted border-primary"
                      )}
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {item.description}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="text-xs ml-2">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs",
                              item.difficulty === 'beginner' && "bg-green-100 text-green-800",
                              item.difficulty === 'intermediate' && "bg-blue-100 text-blue-800",
                              item.difficulty === 'advanced' && "bg-purple-100 text-purple-800"
                            )}
                          >
                            {item.difficulty}
                          </Badge>
                          {item.popularity > 90 && (
                            <Badge variant="secondary" className="text-xs">
                              <TrendingUp className="h-2 w-2 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Documentation Content */}
              <div className="flex-1 overflow-y-auto">
                {selectedItem ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
                      <p className="text-muted-foreground mt-1">{selectedItem.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">{selectedItem.category}</Badge>
                        <Badge variant="secondary">{selectedItem.difficulty}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Updated {selectedItem.lastUpdated.toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Main Content */}
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap">{selectedItem.content}</div>
                    </div>

                    {/* Code Examples */}
                    {selectedItem.codeExamples && selectedItem.codeExamples.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Code Examples</h3>
                        <div className="space-y-4">
                          {selectedItem.codeExamples.map((example, index) => (
                            <Card key={index}>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-sm">{example.description}</CardTitle>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {example.language}
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(example.code)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                                  <code>{example.code}</code>
                                </pre>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Troubleshooting Steps */}
                    {selectedItem.troubleshootingSteps && selectedItem.troubleshootingSteps.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Troubleshooting Steps</h3>
                        <div className="space-y-4">
                          {selectedItem.troubleshootingSteps.map((step, index) => (
                            <Card key={index}>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                                    {step.step}
                                  </div>
                                  {step.description}
                                </CardTitle>
                                {step.commonCause && (
                                  <CardDescription className="text-xs">
                                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                                    Common cause: {step.commonCause}
                                  </CardDescription>
                                )}
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm">{step.solution}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keyboard Shortcuts */}
                    {selectedItem.keyboardShortcuts && selectedItem.keyboardShortcuts.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Keyboard Shortcuts</h3>
                        <div className="grid gap-3">
                          {getShortcutsForPlatform(selectedItem.keyboardShortcuts).map((shortcut, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{shortcut.description}</p>
                                <p className="text-xs text-muted-foreground">{shortcut.context}</p>
                              </div>
                              <Badge variant="outline" className="font-mono">
                                {shortcut.keys}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Items */}
                    {selectedItem.relatedItems.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Related Documentation</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.relatedItems.map((relatedId) => {
                            const relatedItem = documentationData.find(item => item.id === relatedId);
                            return relatedItem ? (
                              <Button
                                key={relatedId}
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedItem(relatedItem)}
                                className="text-xs"
                              >
                                {relatedItem.title}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">Select Documentation</h3>
                      <p className="text-muted-foreground">
                        Choose a topic from the list to view detailed documentation
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Shortcuts Tab */}
          <TabsContent value="shortcuts" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Keyboard Shortcuts</h2>
                <p className="text-muted-foreground">
                  Master these shortcuts to work more efficiently in DevKit Flow
                </p>
              </div>

              <div className="grid gap-6">
                {/* Extract all shortcuts from documentation */}
                {documentationData
                  .filter(item => item.keyboardShortcuts && item.keyboardShortcuts.length > 0)
                  .map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Keyboard className="h-4 w-4" />
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {getShortcutsForPlatform(item.keyboardShortcuts!).map((shortcut, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{shortcut.description}</p>
                                <p className="text-xs text-muted-foreground">{shortcut.context}</p>
                              </div>
                              <Badge variant="outline" className="font-mono">
                                {shortcut.keys}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                  <p className="text-muted-foreground">
                    Common questions and answers about DevKit Flow
                  </p>
                </div>
                {aiEnabled && (
                  <Button
                    variant="outline"
                    onClick={generateAIFAQ}
                    disabled={isGeneratingFAQ}
                  >
                    {isGeneratingFAQ ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate AI FAQ
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {allFAQ.map((faq) => (
                  <Card key={faq.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {faq.question}
                        {faq.aiGenerated && (
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="h-2 w-2 mr-1" />
                            AI
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{faq.answer}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {faq.category}
                        </Badge>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {faq.helpful} helpful
                          </span>
                          {faq.notHelpful > 0 && (
                            <span>{faq.notHelpful} not helpful</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Diagnostics Tab */}
          <TabsContent value="diagnostics" className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Intelligent Diagnostics</h2>
                  <p className="text-muted-foreground">
                    AI-powered troubleshooting and system health checks
                  </p>
                </div>
                {aiEnabled && (
                  <Button
                    variant="outline"
                    onClick={runIntelligentDiagnostics}
                    disabled={isRunningDiagnostics}
                  >
                    {isRunningDiagnostics ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Run Diagnostics
                  </Button>
                )}
              </div>

              {diagnosticResults.length > 0 ? (
                <div className="space-y-4">
                  {diagnosticResults.map((diagnostic, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle 
                            className={cn(
                              "h-4 w-4",
                              diagnostic.severity === 'high' && "text-red-500",
                              diagnostic.severity === 'medium' && "text-yellow-500",
                              diagnostic.severity === 'low' && "text-blue-500"
                            )} 
                          />
                          {diagnostic.issue}
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              diagnostic.severity === 'high' && "border-red-200 text-red-800",
                              diagnostic.severity === 'medium' && "border-yellow-200 text-yellow-800",
                              diagnostic.severity === 'low' && "border-blue-200 text-blue-800"
                            )}
                          >
                            {diagnostic.severity}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-1">Diagnostic Check:</h4>
                          <p className="text-sm text-muted-foreground">{diagnostic.diagnostic}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Solution:</h4>
                          <p className="text-sm">{diagnostic.solution}</p>
                        </div>
                        {diagnostic.commonCause && (
                          <div>
                            <h4 className="font-medium text-sm mb-1">Common Cause:</h4>
                            <p className="text-sm text-muted-foreground">{diagnostic.commonCause}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : aiEnabled ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Run Diagnostics</h3>
                    <p className="text-muted-foreground mb-4">
                      Click the button above to run AI-powered diagnostics and get personalized troubleshooting recommendations.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">AI Features Required</h3>
                    <p className="text-muted-foreground">
                      Enable AI features in settings to access intelligent diagnostics.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IntelligentDocumentation;