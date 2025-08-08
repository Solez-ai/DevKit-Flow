import React, { useState, useCallback, useEffect } from 'react';
import { 
  Keyboard, 
  Brain, 
  Search, 
  Filter,
  Star,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Settings,
  Copy,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIService } from '@/hooks/use-ai-service';
import { useIntelligentHelp } from './intelligent-help-provider';
import { cn } from '@/lib/utils';

interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  category: 'navigation' | 'editing' | 'workflow' | 'ai' | 'general';
  context: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  usage: number;
  lastUsed?: Date;
  customizable: boolean;
  aiRecommended?: boolean;
}

interface ShortcutRecommendation {
  shortcut: KeyboardShortcut;
  reason: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
}

interface AIKeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
  userContext?: string;
  onShortcutSelect?: (shortcut: KeyboardShortcut) => void;
}

export const AIKeyboardShortcuts: React.FC<AIKeyboardShortcutsProps> = ({
  isOpen,
  onClose,
  userContext,
  onShortcutSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [recommendations, setRecommendations] = useState<ShortcutRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [userShortcutStats, setUserShortcutStats] = useState({
    totalUsage: 0,
    favoriteCategory: 'workflow',
    efficiencyScore: 75,
    unusedShortcuts: 0
  });

  const { generateResponse, isEnabled: aiEnabled } = useAIService();
  const { trackUserAction } = useIntelligentHelp();

  // Sample shortcuts data
  const sampleShortcuts: KeyboardShortcut[] = [
    {
      id: 'create-node',
      keys: ['Ctrl', 'N'],
      description: 'Create a new node in the current workspace',
      category: 'workflow',
      context: ['devflow-studio'],
      difficulty: 'basic',
      usage: 245,
      lastUsed: new Date('2024-01-20'),
      customizable: true
    },
    {
      id: 'save-session',
      keys: ['Ctrl', 'S'],
      description: 'Save the current session',
      category: 'general',
      context: ['devflow-studio', 'regexr'],
      difficulty: 'basic',
      usage: 189,
      lastUsed: new Date('2024-01-22'),
      customizable: false
    },
    {
      id: 'ai-assistant',
      keys: ['Ctrl', 'Shift', 'A'],
      description: 'Open AI assistant for contextual help',
      category: 'ai',
      context: ['devflow-studio', 'regexr'],
      difficulty: 'intermediate',
      usage: 67,
      lastUsed: new Date('2024-01-19'),
      customizable: true,
      aiRecommended: true
    },
    {
      id: 'quick-search',
      keys: ['Ctrl', 'K'],
      description: 'Open quick search and command palette',
      category: 'navigation',
      context: ['global'],
      difficulty: 'basic',
      usage: 156,
      lastUsed: new Date('2024-01-21'),
      customizable: true
    },
    {
      id: 'regex-test',
      keys: ['Ctrl', 'T'],
      description: 'Test current regex pattern',
      category: 'workflow',
      context: ['regexr'],
      difficulty: 'intermediate',
      usage: 89,
      lastUsed: new Date('2024-01-18'),
      customizable: true
    },
    {
      id: 'node-connect',
      keys: ['Ctrl', 'L'],
      description: 'Connect selected nodes',
      category: 'editing',
      context: ['devflow-studio'],
      difficulty: 'intermediate',
      usage: 34,
      customizable: true
    },
    {
      id: 'zen-mode',
      keys: ['F11'],
      description: 'Toggle fullscreen zen mode',
      category: 'navigation',
      context: ['global'],
      difficulty: 'advanced',
      usage: 12,
      customizable: false
    },
    {
      id: 'ai-explain',
      keys: ['Ctrl', 'E'],
      description: 'Get AI explanation of selected content',
      category: 'ai',
      context: ['regexr', 'devflow-studio'],
      difficulty: 'intermediate',
      usage: 23,
      customizable: true,
      aiRecommended: true
    }
  ];

  // Initialize shortcuts
  useEffect(() => {
    setShortcuts(sampleShortcuts);
    
    // Calculate user stats
    const totalUsage = sampleShortcuts.reduce((sum, s) => sum + s.usage, 0);
    const categoryUsage = sampleShortcuts.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + s.usage;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteCategory = Object.entries(categoryUsage)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'workflow';
    
    const unusedShortcuts = sampleShortcuts.filter(s => s.usage === 0).length;
    
    setUserShortcutStats({
      totalUsage,
      favoriteCategory,
      efficiencyScore: Math.min(100, Math.round((totalUsage / sampleShortcuts.length) * 2)),
      unusedShortcuts
    });
  }, []);

  // Generate AI recommendations
  const generateAIRecommendations = useCallback(async () => {
    if (!aiEnabled) return;

    setIsLoadingRecommendations(true);
    try {
      const prompt = `Analyze user's keyboard shortcut usage and recommend improvements:

User Context: ${userContext || 'General usage'}
Current Stats:
- Total shortcut usage: ${userShortcutStats.totalUsage}
- Favorite category: ${userShortcutStats.favoriteCategory}
- Efficiency score: ${userShortcutStats.efficiencyScore}%
- Unused shortcuts: ${userShortcutStats.unusedShortcuts}

Available shortcuts:
${shortcuts.map(s => 
  `- ${s.keys.join('+')} (${s.category}): ${s.description} - Used ${s.usage} times`
).join('\n')}

Provide recommendations as JSON:
{
  "recommendations": [
    {
      "shortcutId": "shortcut-id",
      "reason": "Why this shortcut would be helpful",
      "confidence": 0.85,
      "priority": "high|medium|low"
    }
  ]
}

Focus on:
- Underused shortcuts that could improve productivity
- Shortcuts relevant to user's current context
- Shortcuts that complement frequently used ones
- Advanced shortcuts for power users

Limit to 5 recommendations.`;

      const response = await generateResponse(prompt, 'shortcut-recommendations');
      
      try {
        const data = JSON.parse(response);
        const recs: ShortcutRecommendation[] = data.recommendations
          .map((rec: any) => {
            const shortcut = shortcuts.find(s => s.id === rec.shortcutId);
            return shortcut ? {
              shortcut,
              reason: rec.reason,
              confidence: rec.confidence,
              priority: rec.priority
            } : null;
          })
          .filter(Boolean)
          .sort((a: ShortcutRecommendation, b: ShortcutRecommendation) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          });

        setRecommendations(recs);
      } catch (parseError) {
        console.warn('Failed to parse AI recommendations:', parseError);
      }
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [aiEnabled, userContext, userShortcutStats, shortcuts, generateResponse]);

  // Load recommendations on mount
  useEffect(() => {
    if (aiEnabled && shortcuts.length > 0) {
      generateAIRecommendations();
    }
  }, [aiEnabled, shortcuts.length, generateAIRecommendations]);

  // Filter shortcuts
  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = searchQuery === '' || 
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatKeys = (keys: string[]) => {
    return keys.map((key, index) => (
      <span key={index} className="inline-flex items-center">
        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
          {key}
        </kbd>
        {index < keys.length - 1 && <span className="mx-1 text-muted-foreground">+</span>}
      </span>
    ));
  };

  const getCategoryIcon = (category: KeyboardShortcut['category']) => {
    switch (category) {
      case 'navigation': return <Target className="h-4 w-4 text-blue-500" />;
      case 'editing': return <Settings className="h-4 w-4 text-green-500" />;
      case 'workflow': return <Zap className="h-4 w-4 text-purple-500" />;
      case 'ai': return <Brain className="h-4 w-4 text-orange-500" />;
      case 'general': return <Keyboard className="h-4 w-4 text-gray-500" />;
      default: return <Keyboard className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: KeyboardShortcut['difficulty']) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;  r
eturn (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-6xl h-[90vh] bg-background rounded-lg shadow-xl flex flex-col m-4">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="h-6 w-6 text-blue-500" />
              <h1 className="text-xl font-semibold">AI-Powered Keyboard Shortcuts</h1>
              {aiEnabled && (
                <Badge variant="secondary">
                  <Brain className="h-3 w-3 mr-1" />
                  Smart Recommendations
                </Badge>
              )}
            </div>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="shortcuts" className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="shortcuts">All Shortcuts</TabsTrigger>
              <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
              <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
            </TabsList>

            {/* All Shortcuts */}
            <TabsContent value="shortcuts" className="flex-1 overflow-hidden m-0">
              <div className="h-full flex flex-col">
                {/* Search and Filters */}
                <div className="px-6 py-4 border-b">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search shortcuts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="navigation">Navigation</SelectItem>
                        <SelectItem value="editing">Editing</SelectItem>
                        <SelectItem value="workflow">Workflow</SelectItem>
                        <SelectItem value="ai">AI Features</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Shortcuts List */}
                <ScrollArea className="flex-1 px-6">
                  <div className="py-4 space-y-3">
                    {filteredShortcuts.map((shortcut) => (
                      <Card
                        key={shortcut.id}
                        className={`cursor-pointer hover:shadow-md transition-shadow ${
                          shortcut.aiRecommended ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
                        }`}
                        onClick={() => {
                          onShortcutSelect?.(shortcut);
                          trackUserAction(`shortcut-selected-${shortcut.id}`, {
                            feature: 'keyboard-shortcuts',
                            component: 'shortcut-list',
                            userAction: 'shortcut-selected'
                          });
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getCategoryIcon(shortcut.category)}
                                <div className="flex items-center gap-2">
                                  {formatKeys(shortcut.keys)}
                                </div>
                                {shortcut.aiRecommended && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Brain className="h-2 w-2 mr-1" />
                                    AI Recommended
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm font-medium mb-1">{shortcut.description}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <Badge className={`text-xs ${getDifficultyColor(shortcut.difficulty)}`}>
                                  {shortcut.difficulty}
                                </Badge>
                                <span className="capitalize">{shortcut.category}</span>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {shortcut.usage} uses
                                </div>
                                {shortcut.lastUsed && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {shortcut.lastUsed.toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              
                              {shortcut.context.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {shortcut.context.map((ctx, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {ctx}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {shortcut.customizable && (
                                <Button size="sm" variant="outline">
                                  <Settings className="h-3 w-3 mr-2" />
                                  Customize
                                </Button>
                              )}
                              <Button size="sm" variant="ghost">
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            {/* AI Recommendations */}
            <TabsContent value="recommendations" className="flex-1 p-6 overflow-auto">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Personalized Recommendations</h2>
                  <p className="text-muted-foreground">
                    AI-powered suggestions to improve your productivity with keyboard shortcuts
                  </p>
                </div>

                {isLoadingRecommendations ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing your usage patterns...</p>
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <Card key={index} className="border-blue-200 bg-blue-50/30">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getCategoryIcon(rec.shortcut.category)}
                              <div className="flex items-center gap-2">
                                {formatKeys(rec.shortcut.keys)}
                              </div>
                              <Badge 
                                variant={rec.priority === 'high' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {rec.priority} priority
                              </Badge>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(rec.confidence * 100)}% confident
                            </Badge>
                          </div>
                          
                          <h3 className="font-medium mb-2">{rec.shortcut.description}</h3>
                          
                          <div className="bg-blue-100 p-3 rounded mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Brain className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Why this helps</span>
                            </div>
                            <p className="text-sm text-blue-700">{rec.reason}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="capitalize">{rec.shortcut.category}</span>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {rec.shortcut.usage} current uses
                              </div>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => {
                                onShortcutSelect?.(rec.shortcut);
                                trackUserAction(`ai-recommendation-selected-${rec.shortcut.id}`, {
                                  feature: 'keyboard-shortcuts',
                                  component: 'ai-recommendations',
                                  userAction: 'recommendation-selected'
                                });
                              }}
                            >
                              Try This Shortcut
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      Use more shortcuts to get personalized recommendations
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Usage Analytics */}
            <TabsContent value="analytics" className="flex-1 p-6 overflow-auto">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Usage Analytics</h2>
                  <p className="text-muted-foreground">
                    Track your keyboard shortcut usage and productivity improvements
                  </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {userShortcutStats.totalUsage}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Uses</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 capitalize">
                        {userShortcutStats.favoriteCategory}
                      </div>
                      <div className="text-sm text-muted-foreground">Favorite Category</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {userShortcutStats.efficiencyScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Efficiency Score</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {userShortcutStats.unusedShortcuts}
                      </div>
                      <div className="text-sm text-muted-foreground">Unused Shortcuts</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Most Used Shortcuts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Most Used Shortcuts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {shortcuts
                        .sort((a, b) => b.usage - a.usage)
                        .slice(0, 5)
                        .map((shortcut, index) => (
                          <div key={shortcut.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                                {index + 1}
                              </div>
                              <div className="flex items-center gap-2">
                                {formatKeys(shortcut.keys)}
                              </div>
                              <span className="font-medium">{shortcut.description}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{shortcut.usage} uses</Badge>
                              {getCategoryIcon(shortcut.category)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Usage by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(
                        shortcuts.reduce((acc, s) => {
                          acc[s.category] = (acc[s.category] || 0) + s.usage;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                        .sort(([,a], [,b]) => b - a)
                        .map(([category, usage]) => (
                          <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(category as KeyboardShortcut['category'])}
                              <span className="capitalize font-medium">{category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ 
                                    width: `${(usage / userShortcutStats.totalUsage) * 100}%` 
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-12 text-right">
                                {usage}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AIKeyboardShortcuts;