import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search, Sparkles, Clock, TrendingUp, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAIService } from '@/hooks/use-ai-service';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  relevanceScore: number;
  type: 'help-topic' | 'feature' | 'shortcut' | 'tutorial';
  keywords: string[];
  lastAccessed?: Date;
  popularity?: number;
}

interface SearchFilter {
  categories: string[];
  types: string[];
  dateRange?: 'recent' | 'week' | 'month' | 'all';
}

interface IntelligentSearchProps {
  onResultSelect: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

// Mock search data - in a real app, this would come from a search index
const searchData: SearchResult[] = [
  {
    id: 'node-creation',
    title: 'Creating Nodes in DevFlow Studio',
    description: 'Learn how to create and configure different types of nodes',
    category: 'devflow-studio',
    content: 'Nodes are the building blocks of your development workflow...',
    relevanceScore: 0,
    type: 'help-topic',
    keywords: ['nodes', 'create', 'add', 'studio', 'workflow'],
    popularity: 95
  },
  {
    id: 'regex-components',
    title: 'Using Regex Components',
    description: 'Build regex patterns with drag-and-drop components',
    category: 'regexr',
    content: 'Regexr++ provides visual components for building regex patterns...',
    relevanceScore: 0,
    type: 'help-topic',
    keywords: ['regex', 'components', 'pattern', 'drag', 'drop'],
    popularity: 87
  },
  {
    id: 'ai-assistance',
    title: 'AI-Powered Code Generation',
    description: 'Use Claude MCP for intelligent code assistance',
    category: 'ai-features',
    content: 'DevKit Flow integrates with Claude MCP to provide smart code generation...',
    relevanceScore: 0,
    type: 'feature',
    keywords: ['ai', 'claude', 'code', 'generation', 'assistance'],
    popularity: 92
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Essential Keyboard Shortcuts',
    description: 'Speed up your workflow with keyboard shortcuts',
    category: 'shortcuts',
    content: 'Master these keyboard shortcuts for efficient development...',
    relevanceScore: 0,
    type: 'shortcut',
    keywords: ['keyboard', 'shortcuts', 'hotkeys', 'efficiency'],
    popularity: 78
  }
];

export const IntelligentSearch: React.FC<IntelligentSearchProps> = ({
  onResultSelect,
  placeholder = "Search help topics, features, and shortcuts...",
  className,
  autoFocus = false
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiEnhancedResults, setAiEnhancedResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<SearchFilter>({
    categories: [],
    types: [],
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const { generateResponse, isEnabled: aiEnabled } = useAIService();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Basic text search with relevance scoring
  const performBasicSearch = useCallback((searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return [];

    const queryWords = searchQuery.toLowerCase().split(/\s+/);
    
    return searchData
      .map(item => {
        let score = 0;
        
        // Title match (highest weight)
        const titleMatches = queryWords.filter(word => 
          item.title.toLowerCase().includes(word)
        ).length;
        score += titleMatches * 10;
        
        // Description match
        const descMatches = queryWords.filter(word => 
          item.description.toLowerCase().includes(word)
        ).length;
        score += descMatches * 5;
        
        // Keywords match
        const keywordMatches = queryWords.filter(word => 
          item.keywords.some(keyword => keyword.toLowerCase().includes(word))
        ).length;
        score += keywordMatches * 7;
        
        // Content match (lower weight)
        const contentMatches = queryWords.filter(word => 
          item.content.toLowerCase().includes(word)
        ).length;
        score += contentMatches * 2;
        
        // Popularity boost
        score += (item.popularity || 0) * 0.1;
        
        return { ...item, relevanceScore: score };
      })
      .filter(item => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, []);

  // AI-enhanced search for better understanding of user intent
  const performAIEnhancedSearch = useCallback(async (searchQuery: string) => {
    if (!aiEnabled || !searchQuery.trim()) return [];

    try {
      const prompt = `Analyze this search query for DevKit Flow help system: "${searchQuery}"

      Available help topics:
      ${searchData.map(item => `- ${item.title}: ${item.description} (${item.keywords.join(', ')})`).join('\n')}

      Please provide:
      1. The user's likely intent
      2. The most relevant help topics (by ID)
      3. Suggested related searches
      4. Any clarifying questions if the query is ambiguous

      Respond in JSON format:
      {
        "intent": "brief description of what user is looking for",
        "relevantTopics": ["id1", "id2", "id3"],
        "relatedSearches": ["search1", "search2"],
        "clarification": "optional clarifying question"
      }`;

      const response = await generateResponse(prompt, 'search-enhancement');
      
      try {
        const analysis = JSON.parse(response);
        
        // Enhance results based on AI analysis
        const enhancedResults = analysis.relevantTopics
          .map((id: string) => searchData.find(item => item.id === id))
          .filter(Boolean)
          .map((item: SearchResult, index: number) => ({
            ...item,
            relevanceScore: 100 - (index * 10) // AI-ranked results get high scores
          }));

        return enhancedResults;
      } catch (parseError) {
        console.warn('Failed to parse AI search analysis:', parseError);
        return [];
      }
    } catch (error) {
      console.error('AI-enhanced search failed:', error);
      return [];
    }
  }, [aiEnabled, generateResponse]);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setAiEnhancedResults([]);
      return;
    }

    setIsSearching(true);

    // Perform basic search immediately
    const basicResults = performBasicSearch(searchQuery);
    setResults(basicResults);

    // Perform AI-enhanced search if available
    if (aiEnabled) {
      const aiResults = await performAIEnhancedSearch(searchQuery);
      setAiEnhancedResults(aiResults);
    }

    setIsSearching(false);
  }, [performBasicSearch, performAIEnhancedSearch, aiEnabled]);

  // Handle search input with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  }, [performSearch]);

  // Apply filters to results
  const filteredResults = useMemo(() => {
    const allResults = aiEnhancedResults.length > 0 ? aiEnhancedResults : results;
    
    return allResults.filter(result => {
      if (filters.categories.length > 0 && !filters.categories.includes(result.category)) {
        return false;
      }
      
      if (filters.types.length > 0 && !filters.types.includes(result.type)) {
        return false;
      }
      
      return true;
    });
  }, [results, aiEnhancedResults, filters]);

  // Handle result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
      return updated;
    });
    
    onResultSelect(result);
  }, [query, onResultSelect]);

  // Get available filter options
  const availableCategories = useMemo(() => {
    return [...new Set(searchData.map(item => item.category))];
  }, []);

  const availableTypes = useMemo(() => {
    return [...new Set(searchData.map(item => item.type))];
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {aiEnabled && (
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-2 w-2 mr-1" />
              AI
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-6 w-6 p-0"
          >
            <Filter className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(category => (
                  <Badge
                    key={category}
                    variant={filters.categories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        categories: prev.categories.includes(category)
                          ? prev.categories.filter(c => c !== category)
                          : [...prev.categories, category]
                      }));
                    }}
                  >
                    {category.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Content Types</h4>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map(type => (
                  <Badge
                    key={type}
                    variant={filters.types.includes(type) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        types: prev.types.includes(type)
                          ? prev.types.filter(t => t !== type)
                          : [...prev.types, type]
                      }));
                    }}
                  >
                    {type.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ categories: [], types: [], dateRange: 'all' })}
              >
                Clear Filters
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Recent Searches</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer text-xs hover:bg-muted"
                onClick={() => handleSearchChange(search)}
              >
                {search}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Search Results */}
      {query && (
        <div className="space-y-2">
          {isSearching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Searching...
            </div>
          )}

          {/* AI-Enhanced Results Section */}
          {aiEnhancedResults.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-medium">AI-Enhanced Results</h4>
              </div>
              <div className="space-y-2">
                {aiEnhancedResults.slice(0, 3).map((result) => (
                  <Card
                    key={result.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors border-blue-200"
                    onClick={() => handleResultSelect(result)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{result.title}</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {result.category.replace('-', ' ')}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {result.type.replace('-', ' ')}
                            </Badge>
                            {result.popularity && result.popularity > 80 && (
                              <Badge variant="secondary" className="text-xs">
                                <TrendingUp className="h-2 w-2 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {results.length > 0 && <Separator className="my-4" />}
            </div>
          )}

          {/* Regular Results */}
          {filteredResults.length > 0 ? (
            <div className="space-y-2">
              {aiEnhancedResults.length === 0 && (
                <h4 className="text-sm font-medium mb-2">Search Results</h4>
              )}
              {filteredResults.map((result) => (
                <Card
                  key={result.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleResultSelect(result)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{result.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {result.category.replace('-', ' ')}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {result.type.replace('-', ' ')}
                          </Badge>
                          {result.relevanceScore > 50 && (
                            <Badge variant="secondary" className="text-xs">
                              High Match
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : query && !isSearching ? (
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No results found for "{query}"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try different keywords or check your filters
              </p>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default IntelligentSearch;