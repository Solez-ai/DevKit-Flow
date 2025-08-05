import React, { useState, useMemo, useCallback } from 'react';
import { Search, Star, StarOff, Info, Sparkles, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useComponentUsage } from '@/hooks/use-component-usage';
import { useAIService } from '@/hooks/use-ai-service';
import type { RegexComponent } from '@/types';
import { cn } from '@/lib/utils';
import { allRegexComponents } from '@/lib/regex-components';

interface EnhancedComponentPaletteProps {
  onComponentSelect: (component: RegexComponent) => void;
  onComponentDrag: (component: RegexComponent, event: React.DragEvent) => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'popularity' | 'recent' | 'category';
type ComponentCategory = 'character-classes' | 'anchors' | 'quantifiers' | 'groups' | 'lookarounds' | 'modifiers' | 'shortcuts' | 'custom';

export const EnhancedComponentPalette: React.FC<EnhancedComponentPaletteProps> = ({
  onComponentSelect,
  onComponentDrag,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('category');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAIAssistance, setShowAIAssistance] = useState(false);

  const {
    favorites,
    toggleFavorite
  } = useComponentUsage();

  // Get components from the main library
  const components = allRegexComponents;

  // Mock categories for now
  const categories = [
    { id: 'character-classes', name: 'Character Classes' },
    { id: 'anchors', name: 'Anchors' },
    { id: 'quantifiers', name: 'Quantifiers' },
    { id: 'groups', name: 'Groups' },
    { id: 'lookarounds', name: 'Lookarounds' },
    { id: 'modifiers', name: 'Modifiers' },
    { id: 'shortcuts', name: 'Shortcuts' },
    { id: 'custom', name: 'Custom' }
  ];

  const { isAvailable: aiAvailable } = useAIService();

  // Filter and sort components
  const filteredComponents = useMemo(() => {
    let filtered = components;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(component =>
        component.name.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query) ||
        component.examples.some((example: string) => example.toLowerCase().includes(query)) ||
        component.commonUses.some((use: string) => use.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(component => component.category === selectedCategory);
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(component => favorites.includes(component.id));
    }

    // Sort components
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
          // Simplified sorting without usage stats
          return a.name.localeCompare(b.name);
        case 'recent':
          // Simplified recent sorting
          return a.name.localeCompare(b.name);
        case 'category':
        default:
          return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [components, searchQuery, selectedCategory, showFavoritesOnly, sortBy, favorites]);

  const handleComponentDragStart = useCallback((component: RegexComponent, event: React.DragEvent) => {
    event.dataTransfer.setData('application/json', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'copy';
    onComponentDrag(component, event);
  }, [onComponentDrag]);

  const handleAISuggestion = useCallback(async () => {
    if (!aiAvailable || !searchQuery) return;

    try {
      // Mock AI suggestion for now
      const aiComponent: RegexComponent = {
        id: `ai-${Date.now()}`,
        name: `AI: ${searchQuery}`,
        description: `AI-generated pattern for: ${searchQuery}`,
        category: 'character-classes' as ComponentCategory,
        regexPattern: `.*${searchQuery}.*`,
        visualRepresentation: {
          icon: 'sparkles',
          color: '#8B5CF6',
          // preview property removed - not supported in base ComponentVisual type
        },
        examples: [searchQuery],
        commonUses: [searchQuery]
      };
      onComponentSelect(aiComponent);
    } catch (error) {
      console.error('AI suggestion failed:', error);
    }
  }, [aiAvailable, searchQuery, onComponentSelect]);

  const ComponentCard: React.FC<{ component: RegexComponent }> = ({ component }) => {
    const isFavorite = favorites.includes(component.id);
    const isRecent = false; // Simplified - recentlyUsed not available
    const stats = { usageCount: 0 }; // Simplified - getComponentUsageStats not available

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105",
                "border-2 border-transparent hover:border-primary/20",
                viewMode === 'list' && "flex-row items-center p-3"
              )}
              draggable
              onDragStart={(e) => handleComponentDragStart(component, e)}
              onClick={() => onComponentSelect(component)}
            >
              <CardHeader className={cn("pb-2", viewMode === 'list' && "py-0 pr-4")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: component.visualRepresentation.color }}
                    >
                      {component.visualRepresentation.icon === 'sparkles' ? (
                        <Sparkles className="w-4 h-4" />
                      ) : (
                        component.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <CardTitle className="text-sm font-medium truncate">
                      {component.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    {isRecent && (
                      <Badge variant="secondary" className="text-xs px-1">
                        Recent
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(component.id);
                      }}
                    >
                      {isFavorite ? (
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                {viewMode === 'grid' && (
                  <CardDescription className="text-xs line-clamp-2">
                    {component.description}
                  </CardDescription>
                )}
              </CardHeader>
              {viewMode === 'grid' && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="bg-muted rounded p-2 font-mono text-xs">
                      {component.regexPattern}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {component.category}
                      </Badge>
                      <span>{stats.usageCount} uses</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-sm">
            <div className="space-y-2">
              <div className="font-semibold">{component.name}</div>
              <div className="text-sm">{component.description}</div>
              <div className="bg-muted rounded p-2 font-mono text-xs">
                {component.regexPattern}
              </div>
              {component.examples.length > 0 && (
                <div>
                  <div className="font-medium text-xs mb-1">Examples:</div>
                  <div className="text-xs space-y-1">
                    {component.examples.slice(0, 3).map((example: string, index: number) => (
                      <div key={index} className="bg-muted/50 rounded px-2 py-1 font-mono">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {component.commonUses.length > 0 && (
                <div>
                  <div className="font-medium text-xs mb-1">Common uses:</div>
                  <div className="text-xs">
                    {component.commonUses.slice(0, 2).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Component Palette</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {aiAvailable && searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={handleAISuggestion}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ComponentCategory | 'all')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="sort-by" className="text-xs">Sort:</Label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="popularity">Popular</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="favorites-only"
              checked={showFavoritesOnly}
              onCheckedChange={setShowFavoritesOnly}
            />
            <Label htmlFor="favorites-only" className="text-xs">Favorites</Label>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {aiAvailable && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Switch
                  id="ai-assistance"
                  checked={showAIAssistance}
                  onCheckedChange={setShowAIAssistance}
                />
                <Label htmlFor="ai-assistance" className="text-sm">AI Assistance</Label>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              {showAIAssistance && (
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                  <CardContent className="p-3">
                    <div className="text-sm text-purple-700">
                      <div className="font-medium mb-1">AI-Powered Suggestions</div>
                      <div className="text-xs">
                        Type what you want to match in the search box and click the ✨ button for AI-generated regex patterns.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Tabs defaultValue="components" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>

            <TabsContent value="components" className="mt-4">
              {filteredComponents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm">No components found</div>
                  {searchQuery && (
                    <div className="text-xs mt-1">
                      Try adjusting your search or filters
                    </div>
                  )}
                </div>
              ) : (
                <div className={cn(
                  "gap-3",
                  viewMode === 'grid' ? "grid grid-cols-1 xl:grid-cols-2" : "space-y-2"
                )}>
                  {filteredComponents.map(component => (
                    <ComponentCard key={component.id} component={component} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="templates" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">Template library coming soon</div>
                <div className="text-xs mt-1">
                  Pre-built pattern templates for common use cases
                </div>
              </div>
            </TabsContent>

            <TabsContent value="community" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">Community patterns coming soon</div>
                <div className="text-xs mt-1">
                  Share and discover patterns from the community
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>{filteredComponents.length} components</div>
          <div>{favorites.length} favorites</div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedComponentPalette;