import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Search, 
  Brain, 
  BookOpen, 
  FileText, 
  Lightbulb,
  ExternalLink,
  Copy,
  Download,
  Filter,
  Tag,
  Clock,
  TrendingUp,
  Star,
  MessageSquare,
  Zap,
  Target,
  Code,
  Image,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAIService } from '@/hooks/use-ai-service';
import { useIntelligentHelp } from './intelligent-help-provider';
import { cn } from '@/lib/utils';

interface DocumentationItem {
  id: string;
  title: string;
  content: string;
  category: 'feature' | 'tutorial' | 'api' | 'troubleshooting' | 'best-practices';
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lastUpdated: Date;
  views: number;
  rating: number;
  searchKeywords: string[];
  relatedItems: string[];
  aiGenerated?: boolean;
  mediaType?: 'text' | 'video' | 'interactive' | 'code';
}

interface SearchResult {
  item: DocumentationItem;
  relevanceScore: number;
  matchedKeywords: string[];
  aiExplanation?: string;
}

interface AIIntelligentDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  contextualFeature?: string;
}

export const AIIntelligentDocumentation: React.FC<AIIntelligentDocumentationProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  contextualFeature
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<DocumentationItem | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    category: 'all',
    difficulty: 'all',
    mediaType: 'all'
  });
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { generateResponse, isEnabled: aiEnabled } = useAIService();
  const { trackUserAction } = useIntelligentHelp();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sample documentation data
  const sampleDocumentation: DocumentationItem[] = [
    {
      id: 'devflow-nodes',
      title: 'Working with DevFlow Nodes',
      content: `# DevFlow Nodes

DevFlow nodes are the building blocks of your visual development workflow. Each node represents a specific aspect of your project.

## Node Types

### Task Nodes
Task nodes represent actionable items in your workflow:
- Create todos with priority levels
- Track completion status
- Set time estimates
- Add dependencies

### Code Nodes
Code nodes store code snippets and implementations:
- Syntax highlighting for multiple languages
- Version tracking
- Integration with external editors
- Code review capabilities

### Reference Nodes
Reference nodes link to external resources:
- Documentation links
- API references
- Design mockups
- Research materials

## Best Practices

1. **Keep nodes focused** - Each node should have a single, clear purpose
2. **Use meaningful names** - Node titles should be descriptive and searchable
3. **Connect related nodes** - Use connections to show relationships
4. **Regular updates** - Keep node content current and relevant`,
      category: 'feature',
      tags: ['nodes', 'workflow', 'devflow', 'basics'],
      difficulty: 'beginner',
      lastUpdated: new Date('2024-01-20'),
      views: 1250,
      rating: 4.8,
      searchKeywords: ['node', 'task', 'code', 'reference', 'workflow', 'devflow'],
      relatedItems: ['node-connections', 'workflow-management'],
      mediaType: 'text'
    },
    {
      id: 'regex-patterns',
      title: 'Building Regex Patterns Visually',
      content: `# Visual Regex Building

Regexr++ transforms complex regex creation into an intuitive visual process.

## Getting Started

### Component Palette
The component palette contains pre-built regex components:
- **Character Classes**: Match specific character types
- **Quantifiers**: Control repetition patterns
- **Anchors**: Define position constraints
- **Groups**: Capture and organize matches

### Drag and Drop
1. Select a component from the palette
2. Drag it to the pattern builder
3. Configure component parameters
4. Test in real-time

## Advanced Features

### AI Pattern Generation
Let AI create patterns from natural language descriptions:
- "Match email addresses"
- "Find phone numbers"
- "Extract URLs from text"

### Performance Optimization
- Use atomic groups for better performance
- Avoid nested quantifiers
- Test with large datasets
- Monitor backtracking warnings`,
      category: 'feature',
      tags: ['regex', 'patterns', 'visual', 'regexr'],
      difficulty: 'intermediate',
      lastUpdated: new Date('2024-01-18'),
      views: 890,
      rating: 4.9,
      searchKeywords: ['regex', 'pattern', 'visual', 'component', 'drag', 'drop'],
      relatedItems: ['regex-testing', 'pattern-library'],
      mediaType: 'interactive'
    },
    {
      id: 'ai-integration',
      title: 'AI-Powered Features Guide',
      content: `# AI Integration in DevKit Flow

DevKit Flow leverages Claude MCP for intelligent assistance across all features.

## AI Capabilities

### Code Assistant
- Generate code from natural language descriptions
- Refactor existing code with modern patterns
- Debug errors with intelligent suggestions
- Architecture planning and recommendations

### Regex Helper
- Generate regex patterns from descriptions
- Explain complex patterns in plain English
- Optimize patterns for performance
- Suggest test cases and edge cases

### Documentation Assistant
- Generate documentation from code
- Create tutorials from feature descriptions
- Provide contextual help and explanations
- Suggest related topics and resources

## Configuration

### API Setup
1. Obtain Claude API key from Anthropic
2. Configure in Settings > AI Integration
3. Set rate limiting preferences
4. Enable/disable specific features

### Privacy & Data
- All processing happens via secure API calls
- No data is stored on external servers
- API keys are stored locally
- Full offline mode available`,
      category: 'feature',
      tags: ['ai', 'claude', 'integration', 'setup'],
      difficulty: 'advanced',
      lastUpdated: new Date('2024-01-22'),
      views: 567,
      rating: 4.7,
      searchKeywords: ['ai', 'claude', 'mcp', 'setup', 'configuration', 'api'],
      relatedItems: ['settings-guide', 'troubleshooting-ai'],
      aiGenerated: true,
      mediaType: 'text'
    }
  ];  // AI-po
wered semantic search
  const performAISearch = useCallback(async (query: string) => {
    if (!aiEnabled || !query.trim()) {
      return sampleDocumentation.map(item => ({
        item,
        relevanceScore: 0.5,
        matchedKeywords: []
      }));
    }

    setIsSearching(true);
    try {
      const prompt = `Analyze this search query for DevKit Flow documentation: "${query}"

Available documentation items:
${sampleDocumentation.map(item => 
  `- ${item.title} (${item.category}, ${item.difficulty}): ${item.tags.join(', ')}`
).join('\n')}

Context: ${contextualFeature ? `User is currently in ${contextualFeature}` : 'General search'}

Provide search results as JSON:
{
  "results": [
    {
      "itemId": "item-id",
      "relevanceScore": 0.95,
      "matchedKeywords": ["keyword1", "keyword2"],
      "aiExplanation": "Why this result is relevant to the query"
    }
  ],
  "suggestions": ["related query 1", "related query 2"]
}

Consider:
- Semantic similarity to query intent
- User's current context
- Difficulty level appropriateness
- Content freshness and popularity`;

      const response = await generateResponse(prompt, 'documentation-search');
      
      try {
        const searchData = JSON.parse(response);
        const results: SearchResult[] = searchData.results
          .map((result: any) => {
            const item = sampleDocumentation.find(doc => doc.id === result.itemId);
            return item ? {
              item,
              relevanceScore: result.relevanceScore,
              matchedKeywords: result.matchedKeywords,
              aiExplanation: result.aiExplanation
            } : null;
          })
          .filter(Boolean)
          .sort((a: SearchResult, b: SearchResult) => b.relevanceScore - a.relevanceScore);

        setAiSuggestions(searchData.suggestions || []);
        return results;
      } catch (parseError) {
        console.warn('Failed to parse AI search results:', parseError);
        return performBasicSearch(query);
      }
    } catch (error) {
      console.error('AI search failed:', error);
      return performBasicSearch(query);
    } finally {
      setIsSearching(false);
    }
  }, [aiEnabled, contextualFeature, generateResponse]);

  // Basic keyword search fallback
  const performBasicSearch = useCallback((query: string) => {
    const queryLower = query.toLowerCase();
    const results = sampleDocumentation
      .map(item => {
        const titleMatch = item.title.toLowerCase().includes(queryLower);
        const contentMatch = item.content.toLowerCase().includes(queryLower);
        const keywordMatch = item.searchKeywords.some(keyword => 
          keyword.toLowerCase().includes(queryLower)
        );
        const tagMatch = item.tags.some(tag => 
          tag.toLowerCase().includes(queryLower)
        );

        let relevanceScore = 0;
        const matchedKeywords: string[] = [];

        if (titleMatch) {
          relevanceScore += 0.4;
          matchedKeywords.push('title');
        }
        if (contentMatch) {
          relevanceScore += 0.2;
          matchedKeywords.push('content');
        }
        if (keywordMatch) {
          relevanceScore += 0.3;
          matchedKeywords.push(...item.searchKeywords.filter(k => 
            k.toLowerCase().includes(queryLower)
          ));
        }
        if (tagMatch) {
          relevanceScore += 0.1;
          matchedKeywords.push(...item.tags.filter(t => 
            t.toLowerCase().includes(queryLower)
          ));
        }

        return { item, relevanceScore, matchedKeywords };
      })
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results;
  }, []);

  // Debounced search
  const handleSearch = useCallback(async (query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (query.trim()) {
        const results = await performAISearch(query);
        setSearchResults(results);
        
        // Add to recent searches
        setRecentSearches(prev => {
          const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
          return updated;
        });
        
        trackUserAction(`documentation-search-${query}`, {
          feature: 'intelligent-documentation',
          component: 'search',
          userAction: 'search-performed'
        });
      } else {
        setSearchResults([]);
      }
    }, 300);
  }, [performAISearch, trackUserAction]);

  // Generate AI content for missing documentation
  const generateAIContent = useCallback(async (topic: string, category: string) => {
    if (!aiEnabled) return;

    setIsGeneratingContent(true);
    try {
      const prompt = `Generate comprehensive documentation for DevKit Flow on the topic: "${topic}"

Category: ${category}
Context: ${contextualFeature || 'General documentation'}

Create detailed documentation in Markdown format including:
- Clear introduction and overview
- Step-by-step instructions where applicable
- Code examples and best practices
- Common pitfalls and troubleshooting
- Related topics and next steps

Make it practical, actionable, and appropriate for developers using DevKit Flow.
Focus on real-world usage scenarios and provide specific examples.`;

      const response = await generateResponse(prompt, 'documentation-generation');
      
      const newDoc: DocumentationItem = {
        id: `ai-generated-${Date.now()}`,
        title: topic,
        content: response,
        category: category as DocumentationItem['category'],
        tags: topic.toLowerCase().split(' '),
        difficulty: 'intermediate',
        lastUpdated: new Date(),
        views: 0,
        rating: 0,
        searchKeywords: topic.toLowerCase().split(' '),
        relatedItems: [],
        aiGenerated: true,
        mediaType: 'text'
      };

      setSelectedItem(newDoc);
      
      trackUserAction(`ai-documentation-generated-${topic}`, {
        feature: 'intelligent-documentation',
        component: 'ai-generator',
        userAction: 'content-generated'
      });
    } catch (error) {
      console.error('Failed to generate AI content:', error);
    } finally {
      setIsGeneratingContent(false);
    }
  }, [aiEnabled, contextualFeature, generateResponse, trackUserAction]);

  // Initialize search
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  // Filter results
  const filteredResults = searchResults.filter(result => {
    const categoryMatch = searchFilters.category === 'all' || 
                         result.item.category === searchFilters.category;
    const difficultyMatch = searchFilters.difficulty === 'all' || 
                           result.item.difficulty === searchFilters.difficulty;
    const mediaMatch = searchFilters.mediaType === 'all' || 
                      result.item.mediaType === searchFilters.mediaType;
    
    return categoryMatch && difficultyMatch && mediaMatch;
  });

  const getMediaIcon = (mediaType: DocumentationItem['mediaType']) => {
    switch (mediaType) {
      case 'video': return <Video className="h-4 w-4 text-red-500" />;
      case 'interactive': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'code': return <Code className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: DocumentationItem['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;  retu
rn (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-7xl h-[90vh] bg-background rounded-lg shadow-xl flex flex-col m-4">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              <h1 className="text-xl font-semibold">Intelligent Documentation</h1>
              {aiEnabled && (
                <Badge variant="secondary">
                  <Brain className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              )}
            </div>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Search Sidebar */}
          <div className="w-1/3 border-r flex flex-col">
            {/* Search Input */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="pl-10"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-blue-500" />
                  </div>
                )}
              </div>

              {/* Filters */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <Select value={searchFilters.category} onValueChange={(value) => 
                  setSearchFilters(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="feature">Features</SelectItem>
                    <SelectItem value="tutorial">Tutorials</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={searchFilters.difficulty} onValueChange={(value) => 
                  setSearchFilters(prev => ({ ...prev, difficulty: value }))
                }>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={searchFilters.mediaType} onValueChange={(value) => 
                  setSearchFilters(prev => ({ ...prev, mediaType: value }))
                }>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* AI Suggestions */}
            {aiEnabled && aiSuggestions.length > 0 && (
              <div className="p-4 border-b bg-blue-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">AI Suggestions</span>
                </div>
                <div className="space-y-1">
                  {aiSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="text-xs text-blue-700 hover:text-blue-900 block w-full text-left"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        handleSearch(suggestion);
                      }}
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Recent Searches</span>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      className="text-xs text-muted-foreground hover:text-foreground block w-full text-left"
                      onClick={() => {
                        setSearchQuery(search);
                        handleSearch(search);
                      }}
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {filteredResults.length > 0 ? (
                  filteredResults.map((result) => (
                    <Card
                      key={result.item.id}
                      className={`cursor-pointer transition-colors ${
                        selectedItem?.id === result.item.id ? 'ring-2 ring-blue-500' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedItem(result.item)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getMediaIcon(result.item.mediaType)}
                            <h3 className="font-medium text-sm">{result.item.title}</h3>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge className={`text-xs ${getDifficultyColor(result.item.difficulty)}`}>
                              {result.item.difficulty}
                            </Badge>
                            {result.item.aiGenerated && (
                              <Badge variant="secondary" className="text-xs">
                                <Brain className="h-2 w-2 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {result.item.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {result.item.rating.toFixed(1)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {result.item.lastUpdated.toLocaleDateString()}
                          </div>
                        </div>

                        {result.matchedKeywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {result.matchedKeywords.slice(0, 3).map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {result.aiExplanation && (
                          <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                            <Lightbulb className="h-3 w-3 inline mr-1" />
                            {result.aiExplanation}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Relevance: {Math.round(result.relevanceScore * 100)}%
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : searchQuery ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No results found</p>
                    {aiEnabled && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => generateAIContent(searchQuery, 'feature')}
                        disabled={isGeneratingContent}
                      >
                        {isGeneratingContent ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Brain className="h-3 w-3 mr-2" />
                            Generate with AI
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Search for documentation</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div> 
         {/* Content Area */}
          <div className="flex-1 flex flex-col">
            {selectedItem ? (
              <>
                {/* Content Header */}
                <div className="px-6 py-4 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getMediaIcon(selectedItem.mediaType)}
                        <h2 className="text-xl font-semibold">{selectedItem.title}</h2>
                        {selectedItem.aiGenerated && (
                          <Badge variant="secondary">
                            <Brain className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge className={getDifficultyColor(selectedItem.difficulty)}>
                          {selectedItem.difficulty}
                        </Badge>
                        <span className="capitalize">{selectedItem.category}</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {selectedItem.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {selectedItem.rating.toFixed(1)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Updated {selectedItem.lastUpdated.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Copy className="h-3 w-3 mr-2" />
                        Copy Link
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedItem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedItem.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content Body */}
                <ScrollArea className="flex-1 px-6 py-4">
                  <div className="prose prose-sm max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: selectedItem.content.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, '<h3>').replace(/<h3>/g, '</p><h3>').replace(/^/, '<p>') + '</p>'
                      }} 
                    />
                  </div>
                </ScrollArea>

                {/* Related Items */}
                {selectedItem.relatedItems.length > 0 && (
                  <div className="px-6 py-4 border-t">
                    <h3 className="font-medium mb-3">Related Documentation</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.relatedItems.map((relatedId, index) => {
                        const relatedItem = sampleDocumentation.find(doc => doc.id === relatedId);
                        return relatedItem ? (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(relatedItem)}
                          >
                            <ExternalLink className="h-3 w-3 mr-2" />
                            {relatedItem.title}
                          </Button>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Welcome to Intelligent Documentation</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Search for documentation using natural language queries. 
                    AI will help you find the most relevant information.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Try searching for:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['How to create nodes', 'Regex patterns', 'AI features', 'Troubleshooting'].map((example, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchQuery(example);
                            handleSearch(example);
                          }}
                        >
                          "{example}"
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIIntelligentDocumentation;